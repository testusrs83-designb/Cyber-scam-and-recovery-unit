Migration runbook — resumable chunked migration into Render internal DB

Preconditions
- Ensure target Render DB is reachable from the runner (either a Render private worker or a host in same network).
- Backup the target DB:
  pg_dump "<TARGET_DATABASE_URL>" | gzip > pre_import_backup_$(date -u +%Y%m%dT%H%M%SZ).sql.gz
- Ensure you have the source DB URL accessible from the runner.

Recommended runner placements
- Run inside a Render private worker (see `render/render.yaml`) so the runner has internal network access.
- Alternatively run from a jump host in the same VPC or via a bastion with appropriate firewall rules.

Execution steps
1) Build runner image (if using Render worker):
   - Ensure `SOURCE_DATABASE_URL` and `TARGET_DATABASE_URL` are set as private env vars in Render.
   - Deploy `migration-runner` service.

2) One-time setup (on target DB):
   psql "<TARGET_DATABASE_URL>" -f prisma/migrations/manual_create_tables.sql

3) Start migration (resumable):
   node scripts/row_migration_resumable.js "<SOURCE_DATABASE_URL>" "<TARGET_DATABASE_URL>" 500

4) Monitor `migration_state.json` on the runner for progress. The file contains offsets per table.

5) If interrupted: restart the same command — it will resume from last saved offsets.

6) Verify counts using the `scripts/verify_import.sh` script.

Post-migration
- Run integrity checks and spot checks on sample cases.
- Remove any temporary migration secrets once complete.

Rollback plan
- If import corrupted target data, restore from the `pre_import_backup_*.sql.gz` backup using:
  gunzip -c pre_import_backup.sql.gz | psql "<TARGET_DATABASE_URL>"

CI / GitHub Actions option
- Use the `manual-migration` workflow as a controlled way to run migration from CI if you store DB URLs as GitHub secrets. This is practical for teams that prefer central control.
