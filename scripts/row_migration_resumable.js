#!/usr/bin/env node
/*
  Resumable, chunked migration script.
  Usage: node scripts/row_migration_resumable.js <SOURCE_DB_URL> <TARGET_DB_URL> [chunkSize]

  Behavior:
  - Processes tables in chunks of `chunkSize` (default 500).
  - Writes progress to `migration_state.json` in working directory.
  - Safe to resume: script reads `migration_state.json` and continues from last completed offset per table.
  - Uses `migration_mappings` table on target (created if missing) to ensure idempotency.
*/

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const SRC = process.argv[2]
const TGT = process.argv[3]
const CHUNK = parseInt(process.argv[4] || '500', 10)

if (!SRC || !TGT) {
  console.error('Usage: node scripts/row_migration_resumable.js <SOURCE_DB_URL> <TARGET_DB_URL> [chunkSize]')
  process.exit(1)
}

const stateFile = path.resolve(process.cwd(), 'migration_state.json')
let state = { users: 0, tags: 0, cases: 0, evidence: 0, caseevents: 0, casetags: 0 }
if (fs.existsSync(stateFile)) {
  state = JSON.parse(fs.readFileSync(stateFile, 'utf8'))
}

const src = new Pool({ connectionString: SRC })
const tgt = new Pool({ connectionString: TGT })

async function ensureMappingsTable() {
  await tgt.query(`
    CREATE TABLE IF NOT EXISTS migration_mappings (
      id SERIAL PRIMARY KEY,
      source_table text NOT NULL,
      source_id bigint NOT NULL,
      target_id bigint NOT NULL,
      migrated_at timestamptz DEFAULT now(),
      checksum text
    );
    CREATE UNIQUE INDEX IF NOT EXISTS unique_mapping ON migration_mappings(source_table, source_id);
  `)
}

async function processChunk(table, columns, convertFn, offset) {
  const q = `SELECT ${columns} FROM "${table}" ORDER BY id ASC LIMIT ${CHUNK} OFFSET ${offset}`
  const res = await src.query(q)
  if (res.rowCount === 0) return 0

  for (const row of res.rows) {
    await convertFn(row)
  }
  return res.rowCount
}

async function migrateUsers() {
  console.log('migrateUsers from offset', state.users)
  const cols = 'id, email, role, mfa_enabled, created_at'
  const convert = async (row) => {
    const srcId = row.id
    const map = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['User', srcId])
    if (map.rowCount > 0) return

    const existing = await tgt.query('SELECT id FROM "User" WHERE email=$1', [row.email])
    if (existing.rowCount > 0) {
      await tgt.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', ['User', srcId, existing.rows[0].id])
      return
    }

    const client = await tgt.connect()
    try {
      await client.query('BEGIN')
      const insert = await client.query('INSERT INTO "User"(email, role, mfa_enabled, created_at) VALUES($1,$2,$3,$4) RETURNING id', [row.email, row.role, row.mfa_enabled, row.created_at])
      const tid = insert.rows[0].id
      await client.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3)', ['User', srcId, tid])
      await client.query('INSERT INTO "CaseEvent"(case_id, actor_id, event_type, payload_json, created_at) VALUES($1,$2,$3,$4,$5)', [null, tid, 'migration:import:user', JSON.stringify({ source_id: srcId, email: row.email }), new Date()])
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('user insert failed', e.message)
    } finally {
      client.release()
    }
  }

  while (true) {
    const processed = await processChunk('User', cols, convert, state.users)
    if (processed === 0) break
    state.users += processed
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  }
}

// Implement similar chunked functions for tags, cases, evidence, caseevents, casetags
async function migrateTags() {
  console.log('migrateTags from offset', state.tags)
  const cols = 'id, name'
  const convert = async (row) => {
    const srcId = row.id
    const map = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Tag', srcId])
    if (map.rowCount > 0) return
    const existing = await tgt.query('SELECT id FROM "Tag" WHERE name=$1', [row.name])
    if (existing.rowCount > 0) {
      await tgt.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', ['Tag', srcId, existing.rows[0].id])
      return
    }
    const client = await tgt.connect()
    try {
      await client.query('BEGIN')
      const insert = await client.query('INSERT INTO "Tag"(name) VALUES($1) RETURNING id', [row.name])
      const tid = insert.rows[0].id
      await client.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3)', ['Tag', srcId, tid])
      await client.query('INSERT INTO "CaseEvent"(case_id, actor_id, event_type, payload_json, created_at) VALUES($1,$2,$3,$4,$5)', [null, null, 'migration:import:tag', JSON.stringify({ source_id: srcId, name: row.name }), new Date()])
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('tag insert failed', e.message)
    } finally {
      client.release()
    }
  }

  while (true) {
    const processed = await processChunk('Tag', cols, convert, state.tags)
    if (processed === 0) break
    state.tags += processed
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  }
}

async function migrateCases() {
  console.log('migrateCases from offset', state.cases)
  const cols = 'id, reporter_id, type, status, loss_amount, currency, created_at'
  const convert = async (row) => {
    const srcId = row.id
    const map = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Case', srcId])
    if (map.rowCount > 0) return
    const reporterMap = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['User', row.reporter_id])
    const reporterTarget = reporterMap.rowCount > 0 ? reporterMap.rows[0].target_id : null
    const client = await tgt.connect()
    try {
      await client.query('BEGIN')
      const insert = await client.query('INSERT INTO "Case"(reporter_id, type, status, loss_amount, currency, created_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', [reporterTarget, row.type, row.status, row.loss_amount, row.currency, row.created_at])
      const tid = insert.rows[0].id
      await client.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3)', ['Case', srcId, tid])
      await client.query('INSERT INTO "CaseEvent"(case_id, actor_id, event_type, payload_json, created_at) VALUES($1,$2,$3,$4,$5)', [tid, reporterTarget, 'migration:import:case', JSON.stringify({ source_id: srcId }), new Date()])
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('case insert failed', e.message)
    } finally {
      client.release()
    }
  }

  while (true) {
    const processed = await processChunk('Case', cols, convert, state.cases)
    if (processed === 0) break
    state.cases += processed
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  }
}

async function migrateEvidence() {
  console.log('migrateEvidence from offset', state.evidence)
  const cols = 'id, case_id, file_name, sha256, mime_type, storage_url, created_at'
  const convert = async (row) => {
    const srcId = row.id
    const map = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Evidence', srcId])
    if (map.rowCount > 0) return
    const caseMap = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Case', row.case_id])
    const caseTarget = caseMap.rowCount > 0 ? caseMap.rows[0].target_id : null
    const client = await tgt.connect()
    try {
      await client.query('BEGIN')
      const insert = await client.query('INSERT INTO "Evidence"(case_id, file_name, sha256, mime_type, storage_url, created_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', [caseTarget, row.file_name, row.sha256, row.mime_type, row.storage_url, row.created_at])
      const tid = insert.rows[0].id
      await client.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3)', ['Evidence', srcId, tid])
      await client.query('INSERT INTO "CaseEvent"(case_id, actor_id, event_type, payload_json, created_at) VALUES($1,$2,$3,$4,$5)', [caseTarget, null, 'migration:import:evidence', JSON.stringify({ source_id: srcId, file_name: row.file_name }), new Date()])
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('evidence insert failed', e.message)
    } finally {
      client.release()
    }
  }

  while (true) {
    const processed = await processChunk('Evidence', cols, convert, state.evidence)
    if (processed === 0) break
    state.evidence += processed
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  }
}

async function migrateCaseEvents() {
  console.log('migrateCaseEvents from offset', state.caseevents)
  const cols = 'id, case_id, actor_id, event_type, payload_json, created_at'
  const convert = async (row) => {
    const srcId = row.id
    const map = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['CaseEvent', srcId])
    if (map.rowCount > 0) return
    const caseMap = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Case', row.case_id])
    const caseTarget = caseMap.rowCount > 0 ? caseMap.rows[0].target_id : null
    const actorMap = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['User', row.actor_id])
    const actorTarget = actorMap.rowCount > 0 ? actorMap.rows[0].target_id : null
    const client = await tgt.connect()
    try {
      await client.query('BEGIN')
      const insert = await client.query('INSERT INTO "CaseEvent"(case_id, actor_id, event_type, payload_json, created_at) VALUES($1,$2,$3,$4,$5) RETURNING id', [caseTarget, actorTarget, row.event_type, row.payload_json, row.created_at])
      const tid = insert.rows[0].id
      await client.query('INSERT INTO migration_mappings(source_table, source_id, target_id) VALUES($1,$2,$3)', ['CaseEvent', srcId, tid])
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('caseevent insert failed', e.message)
    } finally {
      client.release()
    }
  }

  while (true) {
    const processed = await processChunk('CaseEvent', cols, convert, state.caseevents)
    if (processed === 0) break
    state.caseevents += processed
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  }
}

async function migrateCaseTags() {
  console.log('migrateCaseTags from offset', state.casetags)
  const cols = 'case_id, tag_id'
  const res = await src.query(`SELECT ${cols} FROM "CaseTag" ORDER BY case_id ASC LIMIT ${CHUNK} OFFSET ${state.casetags}`)
  if (res.rowCount === 0) return
  for (const row of res.rows) {
    const caseSrc = row.case_id
    const tagSrc = row.tag_id
    const caseMap = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Case', caseSrc])
    const tagMap = await tgt.query('SELECT target_id FROM migration_mappings WHERE source_table=$1 AND source_id=$2', ['Tag', tagSrc])
    if (caseMap.rowCount === 0 || tagMap.rowCount === 0) {
      console.warn('Skipping case_tag mapping because referenced case/tag not migrated yet', row)
      continue
    }
    const caseTarget = caseMap.rows[0].target_id
    const tagTarget = tagMap.rows[0].target_id
    try {
      await tgt.query('INSERT INTO "CaseTag"(case_id, tag_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [caseTarget, tagTarget])
    } catch (e) {
      console.error('case_tag insert failed', e.message)
    }
  }
  state.casetags += res.rowCount
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
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
    console.log('Resumable migration complete')
  } catch (err) {
    console.error('Migration failed', err.message)
  } finally {
    await src.end()
    await tgt.end()
  }
}

run()
