#!/usr/bin/env node
/*
  Row-by-row idempotent migration from a SOURCE Postgres to TARGET Postgres.
  Usage: node scripts/row_migration.js <SOURCE_DB_URL> <TARGET_DB_URL>

  Notes:
  - Creates a `migration_mappings` table on the TARGET to keep track of migrated IDs.
  - Inserts a CaseEvent with event_type 'migration:import' for each migrated entity.
  - Idempotent: skips rows that already have a mapping.
*/

const { Pool } = require('pg')

const SRC = process.argv[2]
const TGT = process.argv[3]

if (!SRC || !TGT) {
  console.error('Usage: node scripts/row_migration.js <SOURCE_DB_URL> <TARGET_DB_URL>')
  process.exit(1)
}

const srcPool = new Pool({ connectionString: SRC })
const tgtPool = new Pool({ connectionString: TGT })

async function ensureMappingsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS migration_mappings (
      id SERIAL PRIMARY KEY,
      source_table text NOT NULL,
      source_id bigint NOT NULL,
      target_id bigint NOT NULL,
      migrated_at timestamptz DEFAULT now(),
      checksum text
    );
    CREATE UNIQUE INDEX IF NOT EXISTS unique_mapping ON migration_mappings(source_table, source_id);
  `
  await tgtPool.query(sql)
}

async function migrateUsers() {
  console.log('Migrating users...')
  const res = await srcPool.query('SELECT id, email, role, mfa_enabled, created_at FROM "User"')
  for (const row of res.rows) {
    const srcId = row.id
    // check mapping
    const map = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['User', srcId])
    if (map.rowCount > 0) {
      continue
    }

    // check existing by unique email
    const existing = await tgtPool.query('SELECT id FROM "User" WHERE email=$1', [row.email])
    if (existing.rowCount > 0) {
      const targetId = existing.rows[0].id
      await tgtPool.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', ['User', srcId, targetId])
      continue
    }

    const client = await tgtPool.connect()
    try {
      await client.query('BEGIN')
      const insert = await client.query(
        'INSERT INTO "User"(email, role, mfa_enabled, created_at) VALUES($1,$2,$3,$4) RETURNING id',
        [row.email, row.role, row.mfa_enabled, row.created_at]
      )
      const targetId = insert.rows[0].id
      await client.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3)', ['User', srcId, targetId])
      // write CaseEvent audit for this user import (no case_id available, put null)
      await client.query(
        'INSERT INTO "CaseEvent"(case_id, actor_id, event_type, payload_json, created_at) VALUES($1,$2,$3,$4,$5)'
        , [null, targetId, 'migration:import:user', JSON.stringify({ source_id: srcId, email: row.email }), new Date()]
      )
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Failed migrating user', row.email, err.message)
    } finally {
      client.release()
    }
  }
}

async function migrateTags() {
  console.log('Migrating tags...')
  const res = await srcPool.query('SELECT id, name FROM "Tag"')
  for (const row of res.rows) {
    const srcId = row.id
    const map = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Tag', srcId])
    if (map.rowCount > 0) continue

    const existing = await tgtPool.query('SELECT id FROM "Tag" WHERE name=$1', [row.name])
    if (existing.rowCount > 0) {
      await tgtPool.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', ['Tag', srcId, existing.rows[0].id])
      continue
    }

    const client = await tgtPool.connect()
    try {
      await client.query('BEGIN')
      const insert = await client.query('INSERT INTO "Tag"(name) VALUES($1) RETURNING id', [row.name])
      const targetId = insert.rows[0].id
      await client.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3)', ['Tag', srcId, targetId])
      await client.query('INSERT INTO "CaseEvent"(case_id, actor_id, event_type, payload_json, created_at) VALUES($1,$2,$3,$4,$5)'
        , [null, null, 'migration:import:tag', JSON.stringify({ source_id: srcId, name: row.name }), new Date()])
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Failed migrating tag', row.name, err.message)
    } finally {
      client.release()
    }
  }
}

async function migrateCases() {
  console.log('Migrating cases...')
  const res = await srcPool.query('SELECT id, reporter_id, type, status, loss_amount, currency, created_at FROM "Case"')
  for (const row of res.rows) {
    const srcId = row.id
    const map = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Case', srcId])
    if (map.rowCount > 0) continue

    // map reporter
    const reporterMap = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['User', row.reporter_id])
    const reporterTarget = reporterMap.rowCount > 0 ? reporterMap.rows[0].target_id : null

    const client = await tgtPool.connect()
    try {
      await client.query('BEGIN')
      const insert = await client.query(
        'INSERT INTO "Case"(reporter_id, type, status, loss_amount, currency, created_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
        [reporterTarget, row.type, row.status, row.loss_amount, row.currency, row.created_at]
      )
      const targetId = insert.rows[0].id
      await client.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3)', ['Case', srcId, targetId])
      await client.query('INSERT INTO "CaseEvent"(case_id, actor_id, event_type, payload_json, created_at) VALUES($1,$2,$3,$4,$5)'
        , [targetId, reporterTarget, 'migration:import:case', JSON.stringify({ source_id: srcId }), new Date()])
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Failed migrating case', srcId, err.message)
    } finally {
      client.release()
    }
  }
}

async function migrateEvidence() {
  console.log('Migrating evidence...')
  const res = await srcPool.query('SELECT id, case_id, file_name, sha256, mime_type, storage_url, created_at FROM "Evidence"')
  for (const row of res.rows) {
    const srcId = row.id
    const map = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Evidence', srcId])
    if (map.rowCount > 0) continue

    const caseMap = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Case', row.case_id])
    const caseTarget = caseMap.rowCount > 0 ? caseMap.rows[0].target_id : null

    const client = await tgtPool.connect()
    try {
      await client.query('BEGIN')
      const insert = await client.query(
        'INSERT INTO "Evidence"(case_id, file_name, sha256, mime_type, storage_url, created_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
        [caseTarget, row.file_name, row.sha256, row.mime_type, row.storage_url, row.created_at]
      )
      const targetId = insert.rows[0].id
      await client.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3)', ['Evidence', srcId, targetId])
      await client.query('INSERT INTO "CaseEvent"(case_id, actor_id, event_type, payload_json, created_at) VALUES($1,$2,$3,$4,$5)'
        , [caseTarget, null, 'migration:import:evidence', JSON.stringify({ source_id: srcId, file_name: row.file_name }), new Date()])
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Failed migrating evidence', srcId, err.message)
    } finally {
      client.release()
    }
  }
}

async function migrateCaseEvents() {
  console.log('Migrating case_events...')
  const res = await srcPool.query('SELECT id, case_id, actor_id, event_type, payload_json, created_at FROM "CaseEvent"')
  for (const row of res.rows) {
    const srcId = row.id
    const map = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['CaseEvent', srcId])
    if (map.rowCount > 0) continue

    const caseMap = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Case', row.case_id])
    const caseTarget = caseMap.rowCount > 0 ? caseMap.rows[0].target_id : null
    const actorMap = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['User', row.actor_id])
    const actorTarget = actorMap.rowCount > 0 ? actorMap.rows[0].target_id : null

    const client = await tgtPool.connect()
    try {
      await client.query('BEGIN')
      const insert = await client.query(
        'INSERT INTO "CaseEvent"(case_id, actor_id, event_type, payload_json, created_at) VALUES($1,$2,$3,$4,$5) RETURNING id',
        [caseTarget, actorTarget, row.event_type, row.payload_json, row.created_at]
      )
      const targetId = insert.rows[0].id
      await client.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3)', ['CaseEvent', srcId, targetId])
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Failed migrating case_event', srcId, err.message)
    } finally {
      client.release()
    }
  }
}

async function migrateCaseTags() {
  console.log('Migrating case_tags...')
  const res = await srcPool.query('SELECT case_id, tag_id FROM "CaseTag"')
  for (const row of res.rows) {
    const caseSrc = row.case_id
    const tagSrc = row.tag_id
    const caseMap = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Case', caseSrc])
    const tagMap = await tgtPool.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Tag', tagSrc])
    if (caseMap.rowCount === 0 || tagMap.rowCount === 0) {
      console.warn('Skipping case_tag mapping because referenced case/tag not migrated yet', row)
      continue
    }
    const caseTarget = caseMap.rows[0].target_id
    const tagTarget = tagMap.rows[0].target_id
    // idempotent insert
    try {
      await tgtPool.query('INSERT INTO "CaseTag"(case_id, tag_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [caseTarget, tagTarget])
    } catch (err) {
      console.error('Failed inserting case_tag', err.message)
    }
  }
}

async function run() {
  try {
    await ensureMappingsTable()
    await migrateUsers()
    await migrateTags()
    await migrateCases()
    await migrateEvidence()
    await migrateCaseEvents()
    await migrateCaseTags()
    console.log('Migration complete')
  } catch (err) {
    console.error('Migration failed', err.message)
  } finally {
    await srcPool.end()
    await tgtPool.end()
  }
}

run()
