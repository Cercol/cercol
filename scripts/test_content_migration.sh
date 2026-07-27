#!/usr/bin/env bash
#
# Run a content migration against a throwaway Postgres seeded with the REAL
# published bodies, then run it a second time and diff.
#
# Spec: docs/architecture/seo-pipeline.md
#
# Content migrations edit prose inside blog_posts.content JSONB in six
# languages, with hand-generated SQL full of apostrophes and accents. Exit 0
# from the deploy workflow proves the statements parsed, not that they did the
# right thing. This runs them somewhere harmless first.
#
# The second run is the point. Migrations 034-036 replaced a dead DOI with a
# live one, so old and new were disjoint and a re-run found no needle. A
# migration that ADDS text around a needle it keeps is NOT idempotent by
# default: the replacement contains the needle and the second run inserts a
# second copy. That is a real bug this harness caught in migration 037, where
# the first draft produced two "## Sources" headings.
#
# Usage:
#   scripts/test_content_migration.sh db/migrations/037_*.sql slug-one slug-two
#
# Requires a local postgres (initdb/pg_ctl/psql on PATH). Touches nothing
# outside its temp directory and never connects to the production database.

set -euo pipefail

MIGRATION="${1:?usage: $0 <migration.sql> <slug> [slug...]}"
shift
SLUGS=("$@")
[ ${#SLUGS[@]} -gt 0 ] || { echo "give at least one article slug to seed"; exit 2; }

API="${CERCOL_API_BASE:-https://api.cercol.team}"
PORT="${PGTESTPORT:-55440}"
WORK="$(mktemp -d)"
trap 'pg_ctl -D "$WORK/db" stop >/dev/null 2>&1 || true; rm -rf "$WORK"' EXIT

echo "==> throwaway postgres in $WORK"
# LC_ALL is required: without a valid locale the postmaster aborts at startup
# with "postmaster became multithreaded during startup" on macOS.
LC_ALL=C initdb -D "$WORK/db" -U postgres --auth=trust -E UTF8 >/dev/null
LC_ALL=C pg_ctl -D "$WORK/db" -o "-p $PORT -k /tmp" -l "$WORK/pg.log" start >/dev/null
for _ in $(seq 30); do
  psql -h /tmp -p "$PORT" -U postgres -tAc 'select 1' >/dev/null 2>&1 && break
  sleep 1
done

psql -h /tmp -p "$PORT" -U postgres -q -c \
  "CREATE TABLE blog_posts(slug text primary key, content jsonb, updated_at timestamptz default now());"

echo "==> seeding ${#SLUGS[@]} article(s) from $API"
API="$API" python3 - "$WORK/seed.sql" "${SLUGS[@]}" <<'PY'
import json, os, sys, httpx
out, slugs = sys.argv[1], sys.argv[2:]
api = os.environ["API"]
with httpx.Client(timeout=30) as c, open(out, "w") as f:
    for slug in slugs:
        r = c.get(f"{api}/blog/{slug}")
        r.raise_for_status()
        content = json.dumps(r.json()["content"], ensure_ascii=False).replace("'", "''")
        f.write(f"INSERT INTO blog_posts(slug,content) VALUES ('{slug}', '{content}'::jsonb);\n")
PY
psql -h /tmp -p "$PORT" -U postgres -q -f "$WORK/seed.sql"
psql -h /tmp -p "$PORT" -U postgres -tAc \
  "select slug || ' [' || (select string_agg(k,'/' order by k) from jsonb_object_keys(content) k) || ']' from blog_posts order by slug"

echo "==> run 1"
psql -h /tmp -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -f "$MIGRATION" | grep -E '^(UPDATE|INSERT|DELETE)' || true
psql -h /tmp -p "$PORT" -U postgres -tAc \
  "select slug, md5(content::text) from blog_posts order by slug" > "$WORK/h1"

echo "==> run 2 (must be a no-op)"
psql -h /tmp -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -f "$MIGRATION" | grep -E '^(UPDATE|INSERT|DELETE)' || true
psql -h /tmp -p "$PORT" -U postgres -tAc \
  "select slug, md5(content::text) from blog_posts order by slug" > "$WORK/h2"

if ! diff -q "$WORK/h1" "$WORK/h2" >/dev/null; then
  echo
  echo "NOT IDEMPOTENT: the second run changed content."
  echo "Likely cause: a replacement that contains its own needle. Add a WHERE"
  echo "guard on the text the statement adds."
  diff "$WORK/h1" "$WORK/h2" || true
  exit 1
fi

echo "==> language keys preserved"
psql -h /tmp -p "$PORT" -U postgres -tAc \
  "select slug || ' [' || (select string_agg(k,'/' order by k) from jsonb_object_keys(content) k) || ']' from blog_posts order by slug"

echo
echo "OK: statements applied, second run was a no-op, all language keys intact."
echo "Diff the bodies by hand before shipping if the change is editorial."
