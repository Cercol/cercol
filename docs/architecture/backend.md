# Backend architecture

FastAPI + uvicorn on a single Hetzner CX22, with PostgreSQL on the
same host and Caddy as the reverse proxy. About 3000 LOC split
across six Python files at the top of `api/`. No nested router or
service tree.

## Layout

```
api/
  main.py          # FastAPI app: lifespan, asyncpg pool, all non-auth/non-blog routes
  auth.py          # Sign-in, JWT, magic link, password, Google OAuth
  blog.py          # /blog and /admin/blog endpoints
  emails.py        # Resend transactional sends (magic link, witness, group invite)
  limiter.py       # slowapi rate-limiting wiring
  scoring.py       # Pure-Python scoring (mirrors src/utils/role-scoring.js)
  requirements.txt
  tests/           # pytest suite (scoring oracle, infra guards, SEO H1)
  deploy/
    caddy/         # cercol-api.caddy snippet, source of truth for /etc/caddy/conf.d/
    cron/          # /etc/cron.d/cercol-purge-tokens, manual install
```

### Why flat, not nested

The product scope is small. A nested layout with `routers/`,
`services/`, `models/`, `schemas/` would impose a structure where
the files are short and the call graph is shallow. The codebase
favours readability of the call chain in one file over
file-level decomposition that requires jumping between three places
to understand one endpoint.

If `main.py` exceeds about 2500 LOC, this decision should be
revisited. The current size (1567 LOC) is on the edge but the
internal grouping (lifespan, dependencies, public endpoints, admin
endpoints, scoring endpoints, group endpoints) keeps it navigable.

## Database access

A single asyncpg pool is created in the FastAPI lifespan handler
and reused for every request. The DSN comes from `DATABASE_URL`
on the server. Pool size defaults to asyncpg's own defaults; no
custom tuning at this volume.

Migrations live in `db/migrations/001` through `015`. They are
applied to production by hand right after the merge that introduces
them (see `docs/policies/conventions.md`). No migration runner; the
hand-applied SQL is recorded in commit history.

## Admin gate pattern

```python
async def require_admin(user = Depends(require_user)) -> User:
    if not user.is_admin:
        raise HTTPException(403, "Admin only")
    return user
```

Every admin endpoint receives this as a dependency. The boolean
column `is_admin` on `profiles` is the single source of truth;
bootstrap of the first admin is a manual UPDATE statement on the
server (see `docs/architecture/auth.md`).

Known duplication: `api/blog.py` re-implements the same check
locally rather than importing `require_admin` from `api/main.py`,
because of a now-fixable circular-import issue when blog.py was
first split. This is a tech debt item; a future ADR will track
the consolidation.

## In-process scheduled work

One exception to the "use system cron, not in-process scheduler"
rule from ADR 0006: `_norm_refresh_loop` in `api/main.py` runs as
an `asyncio.create_task` and refreshes empirical scoring norms
every 28 days. It stays in-process because:

- It operates on data already loaded by the API and updates a
  cached object in memory.
- The cadence is multi-week; a cron-shell process would cost more
  setup than the benefit.
- A miss is tolerated (the previous norms keep being used).

Any other periodic work follows ADR 0006: ship as
`api/deploy/cron/<name>` and install manually on the server.

## External integrations

- **Stripe** (`api/main.py` checkout and webhook). Test-mode keys.
  Single price ID for the premium tier. Webhook signing secret is
  required at runtime.
- **Resend** (`api/emails.py`). Transactional sends only. Templates
  rendered per recipient in their preferred language (six locales).
- **Google OAuth** (`api/auth.py`). One web client. Redirect URI
  must match `BACKEND_URL/auth/google/callback`.

## Deploy flow

`.github/workflows/deploy-backend.yml` triggers on push to `main`
that touches `api/**` or the workflow itself. Steps:

1. SSH to Hetzner as root.
2. `git pull origin main` in `/home/cercol/api`.
3. Install Caddy snippet to `/etc/caddy/conf.d/cercol-api.caddy`
   if it changed (`cmp -s`), validate with `caddy validate`, roll
   back on failure, reload Caddy.
4. `systemctl restart cercol-api`.
5. External smoke test against `https://api.cercol.team/blog`
   with five retries.

Manual deploy fallback: `scripts/deploy-api.sh` mirrors the same
logic. See `docs/ops/runbook.md` for emergency procedures.

# Spec: docs/architecture/backend.md
