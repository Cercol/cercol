# ADR 0003: JWT HS256 self-hosted

- **Number**: 0003
- **Title**: JWT HS256 self-hosted auth
- **Status**: Accepted
- **Date**: 2026-05-04

## Context

After dropping Supabase (ADR 0001), the backend needed its own auth
layer. Requirements:

- Three sign-in methods: magic link (email), password, Google
  OAuth. All three already worked from the Cèrcol frontend against
  Supabase Auth and needed to keep working after the migration.
- Stateless verification on every request (no DB round trip just to
  authenticate).
- No managed identity provider. The cost / lock-in argument that
  drove ADR 0001 applies here too.

## Decision

Self-host auth with JWT HS256 signed by a secret stored in
`JWT_SECRET` on the server. The secret must be at least 32 bytes;
the backend fails fast at startup if it is missing or too short
(commit `998a9f7`).

- Access tokens: short-lived JWT in memory in the browser.
- Refresh tokens: opaque tokens persisted in PostgreSQL, rotated on
  each refresh, single use.
- Magic links: opaque tokens persisted in PostgreSQL, single use,
  short TTL.
- Passwords: bcrypt direct (no passlib wrapper).
- Google OAuth: direct OAuth 2.0 flow against Google, no Supabase
  middle layer.

Admin gate: a boolean column `is_admin` on the `profiles` table,
checked by the `require_admin` dependency in `api/main.py`.
Bootstrap of the first admin is a manual SQL UPDATE on the server.

## Alternatives considered

- **Auth0**. Rejected: cost and lock-in.
- **Clerk**. Rejected: same reason.
- **Keep Supabase Auth only, drop the rest of Supabase**. Rejected:
  partial migration is harder than full migration; Supabase Auth
  alone still requires the JWKS round-trip and the Supabase project
  lifecycle.
- **JWT RS256 with managed JWKS**. Rejected: HS256 plus a single
  shared secret is simpler for a single-process backend, and
  there is no third party to share the public key with.

## Consequences

- The team rotates `JWT_SECRET` manually. There is no built-in key
  rotation; the runbook documents the procedure.
- Refresh tokens in the DB mean a revoked session is immediately
  effective (delete the row), at the cost of one DB round trip on
  refresh.
- The first admin must be promoted by SQL. Documented in
  `docs/architecture/auth.md`.
- The whole auth surface lives in `api/auth.py`. About 800 LOC at
  the time of writing. No router split; the file is the surface.

## Related

- Commit: `f3f37ac feat: Phase 15 - Migrate auth fully from Supabase to Hetzner`.
- Commit: `998a9f7 fix(security): fail fast at startup if JWT_SECRET is missing or too short`.
- `api/auth.py` lines 44-54 for the fail-fast check.
- `api/main.py` for the `require_admin` dependency.
- ADR 0001 (Supabase removal) and ADR 0002 (Hetzner hosting).
