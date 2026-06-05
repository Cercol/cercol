#!/usr/bin/env bash
#
# scripts/apply_pg_migrations.sh — tracked, idempotent Postgres migration apply.
#
# Decided in docs/decisions/0011-migration-apply-mechanism.md (Accepted).
# Invoked through the sanctioned pipeline (.github/workflows/apply-migrations.yml,
# workflow_dispatch only) over the existing root SSH channel — no new secret.
#
# A ledger table `schema_migrations` records which db/migrations/*.sql files have
# been applied. Files are applied in numeric (NNN) order, each recorded only after
# it succeeds, and the run HALTS on the first failure — so the ledger never holds a
# partial or out-of-order state.
#
# ADOPTION FLOW (first time, on a DB whose 001..NNN were already applied by hand):
#   1. ./scripts/apply_pg_migrations.sh --baseline <highest-already-applied>
#        records 001..NNN as applied WITHOUT executing them. This is required
#        because some early migrations (013, 014) are NOT idempotent (bare CREATE
#        TABLE / INSERT) and would error if re-run.
#   2. ./scripts/apply_pg_migrations.sh --dry-run    # preview the rest
#   3. ./scripts/apply_pg_migrations.sh              # apply the pending ones
#
# psql mirrors the runbook's working path: peer auth as the postgres superuser
# (docs/ops/runbook.md). No credential is ever hardcoded. Override the psql command
# via the PSQL env var if needed (e.g. for a non-default host).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# Overridable so --list is unit-testable against a temp dir of fixtures.
MIGRATIONS_DIR="${MIGRATIONS_DIR:-$REPO_ROOT/db/migrations}"

# psql invocation (peer auth, mirrors docs/ops/runbook.md). Overridable for tests.
PSQL="${PSQL:-sudo -u postgres psql cercol}"

LEDGER_DDL="CREATE TABLE IF NOT EXISTS schema_migrations (filename text primary key, applied_at timestamptz default now());"

usage() {
  cat <<'EOF'
Usage: apply_pg_migrations.sh [MODE]

Modes:
  --list           Print discovered migrations in numeric order. No DB connection.
  --dry-run        Print the pending set (files not yet in the ledger), in apply
                   order. Changes nothing.
  --baseline NNN   Record every migration up to and including NNN as applied,
                   WITHOUT executing it (adopts the ledger on a DB where 001..NNN
                   were already applied by hand). Applies nothing.
  (no mode)        Apply each pending migration in order, recording it after it
                   succeeds. Halts on the first failure.
  -h, --help       Show this help.
EOF
}

# Discover db/migrations/*.sql ordered by the leading NNN numeric prefix.
# Filenames are zero-padded (NNN_name.sql), so a plain C-locale sort is numeric.
discover() {
  local f
  for f in "$MIGRATIONS_DIR"/*.sql; do
    [ -e "$f" ] || continue
    basename "$f"
  done | LC_ALL=C sort
}

ensure_ledger() {
  printf '%s\n' "$LEDGER_DDL" | $PSQL -v ON_ERROR_STOP=1 -q
}

# Filenames already recorded in the ledger, one per line.
applied_set() {
  $PSQL -v ON_ERROR_STOP=1 -tA -c "SELECT filename FROM schema_migrations;"
}

record() {
  # Idempotent insert so re-recording a file is harmless.
  printf "INSERT INTO schema_migrations (filename) VALUES ('%s') ON CONFLICT (filename) DO NOTHING;\n" "$1" \
    | $PSQL -v ON_ERROR_STOP=1 -q
}

# Numeric prefix of a migration filename: 017_foo.sql -> 17 (10# avoids octal).
prefix_num() { echo "$((10#${1%%_*}))"; }

mode_list() {
  discover
}

mode_dry_run() {
  # Read-only: never create the ledger. Only consult it if it already exists;
  # if it does not, treat the applied set as empty (everything is pending).
  local applied=""
  local ledger
  ledger="$($PSQL -v ON_ERROR_STOP=1 -tA -c "SELECT to_regclass('public.schema_migrations');")"
  if [ -n "$ledger" ]; then
    applied="$(applied_set)"
  fi
  local any=0 f
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    if ! grep -qxF "$f" <<<"$applied"; then
      echo "PENDING $f"
      any=1
    fi
  done < <(discover)
  [ "$any" -eq 1 ] || echo "(no pending migrations)"
}

mode_baseline() {
  local nnn="$1"
  [[ "$nnn" =~ ^[0-9]+$ ]] || { echo "ERROR: --baseline needs a numeric NNN" >&2; exit 2; }
  ensure_ledger
  local target; target="$((10#$nnn))"
  local f
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    if [ "$(prefix_num "$f")" -le "$target" ]; then
      record "$f"
      echo "BASELINED (recorded, not executed) $f"
    fi
  done < <(discover)
}

mode_apply() {
  ensure_ledger
  local applied; applied="$(applied_set)"
  local f applied_any=0
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    if grep -qxF "$f" <<<"$applied"; then
      continue
    fi
    echo "APPLYING $f"
    # Feed the file via stdin so the invoking shell (root) opens it, not the
    # postgres user (which cannot read files under /home/cercol/api). ON_ERROR_STOP=1
    # + set -e => halt on the first failure, before recording.
    $PSQL -v ON_ERROR_STOP=1 -q < "$MIGRATIONS_DIR/$f"
    record "$f"
    echo "APPLIED  $f"
    applied_any=1
  done < <(discover)
  [ "$applied_any" -eq 1 ] || echo "(no pending migrations)"
}

main() {
  case "${1:---apply}" in
    --list)     mode_list ;;
    --dry-run)  mode_dry_run ;;
    --baseline) mode_baseline "${2:-}" ;;
    --apply)    mode_apply ;;
    -h|--help)  usage ;;
    *) echo "ERROR: unknown mode '$1'" >&2; usage >&2; exit 2 ;;
  esac
}

main "$@"
