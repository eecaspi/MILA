#!/usr/bin/env bash
# Runs the database tests against a throwaway database on a local Postgres (16+).
# Uses the standard PG* environment variables (PGHOST, PGPORT, PGUSER, ...).
#   PGHOST=localhost PGUSER=postgres npm run test:db
set -euo pipefail
cd "$(dirname "$0")/.."

DB="mila_test_$$"
PSQL=(psql -X -q -v ON_ERROR_STOP=1)

"${PSQL[@]}" -d postgres -c "create database $DB" >/dev/null
trap '"${PSQL[@]}" -d postgres -c "drop database if exists $DB" >/dev/null' EXIT

"${PSQL[@]}" -d "$DB" -f supabase/tests/supabase_stub.sql >/dev/null
for f in supabase/migrations/*.sql; do
  "${PSQL[@]}" -d "$DB" -f "$f" >/dev/null
done
"${PSQL[@]}" -d "$DB" -f supabase/seed.sql >/dev/null

for t in supabase/tests/*.test.sql; do
  echo "→ $t"
  "${PSQL[@]}" -d "$DB" -f "$t" 2>&1 | sed -e 's/^psql:[^ ]* NOTICE:  /  /' -e 's/^NOTICE:  /  /'
done
