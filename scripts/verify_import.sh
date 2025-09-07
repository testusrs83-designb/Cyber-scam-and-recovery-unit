#!/usr/bin/env bash
set -euo pipefail

# Usage: ./verify_import.sh <SOURCE_DB_URL> <TARGET_DB_URL> <table1,table2,...>
SRC="$1"
TGT="$2"
TABLES="$3"

IFS=',' read -ra TARR <<< "$TABLES"
for t in "${TARR[@]}"; do
  src_count=$(psql "$SRC" -t -c "SELECT count(*) FROM \"$t\";" | tr -d ' '\n)
  tgt_count=$(psql "$TGT" -t -c "SELECT count(*) FROM \"$t\";" | tr -d ' '\n)
  echo "Table $t: source=$src_count target=$tgt_count"
done
