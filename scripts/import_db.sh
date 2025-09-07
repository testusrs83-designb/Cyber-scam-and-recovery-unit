#!/usr/bin/env bash
set -euo pipefail

# Usage: ./import_db.sh <DUMP_FILE.gz> <TARGET_DATABASE_URL>
DUMP_FILE="$1"
TARGET_DB="$2"

if [ ! -f "$DUMP_FILE" ]; then
  echo "Dump file not found: $DUMP_FILE"
  exit 1
fi

echo "About to import $DUMP_FILE into target DB. This will run DROP/CREATE operations if present in dump."
read -p "Proceed? (yes/no) " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Import cancelled"
  exit 0
fi

echo "Decompressing and importing..."
gunzip -c "$DUMP_FILE" | psql "$TARGET_DB"

echo "Import finished."
