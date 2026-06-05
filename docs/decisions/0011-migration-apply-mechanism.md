# ADR 0011: a tracked, idempotent Postgres migration-apply path through the existing pipeline

- **Number**: 0011
- **Title**: a tracked, idempotent Postgres migration-apply path through the existing pipeline
- **Status**: Proposed
- **Date**: 2026-06-04

## Context

Postgres migrations are applied **by hand**. The runbook documents the only
procedure (`docs/ops/runbook.md:321,325`):

```
cd /home/cercol/api && sudo -u postgres psql cercol -f db/migrations/<NNN>-<name>.sql
```

Nothing automates this:

- `deploy-backend.yml` does a `git pull`, Caddy-snippet install, and
  `systemctl restart cercol-api` — it never runs a migration.
- The deploy triggers only on `api/**` (and the workflow file). `db/migrations/**`
  triggers **no workflow at all**, so a PR that adds only a migration deploys
  nothing and applies nothing.
- There is no Postgres migration runner in `scripts/` (only
  `apply_bigquery_ddl.py`, which is BigQuery) and no `schema_migrations` ledger.

The concrete consequence today: migrations **017** (backfill null `published_at`)
and **018** (the `published_at` CHECK constraint, ADR 0010) are merged to `main`
but **un-applied**, because the one action that would apply them — a manual
`psql` on the server — is exactly the kind of ad-hoc server mutation the
automation is meant to avoid. The blog data fix and its guard are therefore
inert until an operator remembers to run them by hand, in the right order.

The pipeline already has a sanctioned way onto the box: `deploy-backend.yml`
SSHes in over the existing root channel (`secrets.HETZNER_SSH_KEY`) to run
`systemctl` and install the Caddy snippet. Schema changes are no more privileged
than those; they just are not wired up.

## Decision

Add a **tracked, idempotent apply path**: a `scripts/apply_pg_migrations.sh` that

- records each applied file in a `schema_migrations` table (the ledger),
- applies only files not yet recorded, in numeric (`NNN`) order,
- supports `--dry-run` (print the pending set, change nothing),
- halts on the first failure (no partial, out-of-order application),

invoked **through the existing sanctioned pipeline over the current root SSH
channel** — no new secret, the same way `systemctl restart` and the Caddy
snippet install already run. The first real run applies the pending 017 then
018 (017 before 018, which the ledger ordering enforces).

This ADR decides the *mechanism and where it runs*. It does not implement it:
the script and any workflow wiring are a follow-up, gated on this ADR being
accepted.

## Open question for sign-off

**Trigger mode.** Two options, to be chosen at acceptance:

- **Auto-on-deploy**: add `db/migrations/**` to the `deploy-backend.yml` paths and
  run the apply step as part of every backend deploy.
- **Explicit `workflow_dispatch`**: a separate, manually-triggered job (which
  Claude Code could also invoke) that applies pending migrations on demand,
  decoupled from code deploys.

The tradeoff is blast radius on the **shared VPS** (Cèrcol and topquaranta share
the host): auto-on-deploy is hands-off but runs DDL on every backend push;
`workflow_dispatch` keeps a human/agent in the loop for schema changes at the
cost of one extra deliberate step. Decide this before the follow-up wires it.

## Alternatives considered

- **A bare apply loop with no ledger** (`for f in db/migrations/*.sql; do psql -f
  "$f"; done`). Rejected: it re-runs every file every time (relying entirely on
  each migration staying idempotent forever), keeps no audit trail of what ran
  when, and cannot enforce or report ordering. The first non-idempotent migration
  someone writes breaks it silently.
- **Adopt Alembic (or another migration framework)**. Rejected for now: heavy,
  and it reverses the repo's hand-rolled `NNN_name.sql` + manual-psql convention
  across all existing migrations. The problem here is "nothing applies the .sql
  files we already have", not "we need a different authoring format".
- **Documentation + a release checklist only** (keep applying by hand, but add a
  "migrations pending apply" reminder to the runbook / PR template). Rejected as
  the primary fix: it leaves the actual apply as a manual `psql` — the exact
  server action the pipeline is meant to subsume — and still depends on a human
  not forgetting. Worth doing as a stopgap, not as the decision.

## Consequences

- Prod schema changes flow through the **sanctioned pipeline**, the same channel
  that already owns `systemctl` and the Caddy snippet — no new ad-hoc SSH, no new
  secret.
- Every future migration **must remain idempotent**; the ledger prevents
  re-application, but the apply step still assumes a clean re-run is harmless.
- The apply step **needs `--dry-run` and halt-on-failure** so a bad migration
  stops the run loudly (and, with auto-on-deploy, does not silently wedge a
  deploy) instead of half-applying.
- Once accepted and built, the long-pending 017/018 land on the first run, which
  is when the blog `published_at` backfill and CHECK constraint actually take
  effect in prod.

## Related

- `docs/ops/runbook.md` (the current manual procedure this replaces).
- `.github/workflows/deploy-backend.yml` (the existing sanctioned SSH channel).
- ADR 0010 and `db/migrations/{017,018}_*.sql` (the pending migrations that this
  path would finally apply).
- ADR 0004 (Caddy snippet through the pipeline) — the precedent for owning a
  server-side concern from the deploy workflow.
