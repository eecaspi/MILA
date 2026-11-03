#!/usr/bin/env bash
# Runs each database test file against its own fresh database on a local Postgres (16+).
# Uses the standard PG* environment variables (PGHOST, PGPORT, PGUSER, ...).
#   PGHOST=localhost PGUSER=postgres npm run test:db
set -euo pipefail
cd "$(dirname "$0")/.."

PSQL=(psql -X -q -v ON_ERROR_STOP=1)
status=0

for t in supabase/tests/*.test.sql; do
  DB="mila_test_$$_$(basename "$t" .test.sql)"
  "${PSQL[@]}" -d postgres -c "create database $DB" >/dev/null
  {
    "${PSQL[@]}" -d "$DB" -f supabase/tests/supabase_stub.sql >/dev/null
    for f in supabase/migrations/*.sql; do
      "${PSQL[@]}" -d "$DB" -f "$f" >/dev/null 2>&1 || { echo "migration failed: $f"; "${PSQL[@]}" -d "$DB" -f "$f"; }
    done
    "${PSQL[@]}" -d "$DB" -f supabase/seed.sql >/dev/null
    echo "→ $t"
    "${PSQL[@]}" -d "$DB" -f "$t" 2>&1 | sed -e 's/^psql:[^ ]* NOTICE:  /  /' -e 's/^NOTICE:  /  /'
  } || status=1
  "${PSQL[@]}" -d postgres -c "drop database if exists $DB" >/dev/null
done
exit $status
