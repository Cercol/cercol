# ADR 0001: No Supabase, asyncpg direct

- **Number**: 0001
- **Title**: No Supabase, asyncpg direct
- **Status**: Accepted
- **Date**: 2026-05-04

## Context

The early Cèrcol stack used Supabase as the database and auth
provider. Two problems became binding by spring 2026:

- Lock-in. Supabase Auth tokens are issued with ES256 plus a JWKS
  endpoint; the backend had to depend on Supabase's identity layer
  for every request.
- Cost and complexity. The product needed exactly one PostgreSQL
  database, a few async queries per request, and a thin auth
  layer. Supabase added a managed UI, a real-time engine, and a
  storage product the project did not use; the fixed cost did not
  match the actual usage profile.

## Decision

Drop Supabase entirely. Run PostgreSQL self-hosted on the Hetzner
VPS, connect from the FastAPI backend with `asyncpg` pool directly,
and self-host auth (see ADR 0003).

## Alternatives considered

- **Stay on Supabase**. Rejected: the cost / lock-in pair was the
  primary problem; staying did not address it.
- **Move to PlanetScale or Neon**. Rejected: same managed-PG model
  as Supabase but without an auth layer; would have left the auth
  migration cost in place.
- **Render or Fly managed Postgres**. Rejected: cost similar to a
  Hetzner CX22 running both the API and the DB, with less control
  over backups.

## Consequences

- The repo gestiona el pool i les migracions directament:
  `db/migrations/001` to `015` are plain SQL files applied by hand
  to the production database. There is no migration runner.
- No managed admin UI. Admin endpoints are implemented by hand
  under `/admin/*` in `api/main.py` and reached from
  `src/pages/AdminDashboardPage.jsx`.
- Backups are the operator's responsibility. PostgreSQL on Hetzner
  with `pg_dump` against a snapshot.
- Frees the auth design to be exactly what the product needs (see
  ADR 0003).

## Related

- Commit: `f3f37ac feat: Phase 15 - Migrate auth fully from Supabase to Hetzner` (2026-05-04).
- Commit: `bea1f63 chore(phase-17): remove obsolete Supabase artifacts` (2026-05-16).
- ROADMAP Phase 15 and Phase 17.
- Other ADRs: 0002 (Hetzner), 0003 (JWT HS256).
