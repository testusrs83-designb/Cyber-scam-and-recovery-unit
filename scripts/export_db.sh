#!/usr/bin/env bash
set -euo pipefail

# Usage: ./export_db.sh <DATABASE_URL> <OUT_DIR>
DB_URL="$1"
OUT_DIR="$2"

mkdir -p "$OUT_DIR"
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
DUMP_FILE="$OUT_DIR/db_export_$TIMESTAMP.sql.gz"

echo "Exporting database to $DUMP_FILE"
PGPASSWORD=$(echo "$DB_URL" | awk -F: '{print $3}' | awk -F@ '{print $1}')
# Use pg_dump via connection string
PGPASSWORD="" pg_dump "$DB_URL" | gzip > "$DUMP_FILE"

echo "Computing checksum"
sha256sum "$DUMP_FILE" > "$DUMP_FILE.sha256"

echo "Export complete: $DUMP_FILE"
echo "Checksum: $(cat $DUMP_FILE.sha256)"
