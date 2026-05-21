# ADR 0004: Caddy multi-tenant via conf.d

- **Number**: 0004
- **Title**: Caddy multi-tenant via conf.d snippets
- **Status**: Accepted
- **Date**: 2026-05-20

## Context

The Hetzner VPS hosts both Cèrcol and topquaranta. A single Caddy
serves both. Until this decision, both projects assumed they owned
`/etc/caddy/Caddyfile`:

- Topquaranta's deploy ran `bin/tq-sync-infra` which copied
  `/home/topquaranta/app/deploy/Caddyfile` to `/etc/caddy/Caddyfile`
  verbatim and reloaded Caddy.
- Cèrcol had no source of truth; the `api.cercol.team` site block
  had been added by hand on the server.

Result: every topquaranta deploy silently erased the cercol block.
This caused two production outages (see the two Caddy post-mortems),
the second of which made the SEO sprint fail to deploy.

## Decision

Each project owns its own snippet under `/etc/caddy/conf.d/`.
Topquaranta's main `/etc/caddy/Caddyfile` ends with:

```caddyfile
import /etc/caddy/conf.d/*.caddy
```

Cèrcol's snippet lives at `api/deploy/caddy/cercol-api.caddy` in
this repo. The deploy installs it to
`/etc/caddy/conf.d/cercol-api.caddy` only when the source has
changed (`cmp -s` idempotency), validates with
`caddy validate --config /etc/caddy/Caddyfile`, rolls back on
validation failure, and reloads Caddy. The deploy then runs an
external smoke test against `https://api.cercol.team/blog` with
five retries; a failure makes the deploy red.

CI on this repo runs `caddy validate` against the snippet (wrapped
with a one-line `import` so it is a complete Caddyfile) inside the
`caddy:2` Docker image on every push that touches it.

A new pytest in `api/tests/test_infra.py` asserts the snippet file
exists and contains the expected directives.

Future projects that want to share this Caddy follow the same
pattern: own a snippet under `/etc/caddy/conf.d/<project>-<name>.caddy`,
sync from their own repo via their own deploy.

## Alternatives considered

- **Switch to nginx**. Rejected: nginx does not solve the
  multi-tenant ownership problem; same shared mutable file pattern
  applies. Switching costs migration time for no win.
- **Per-project reverse proxy in front of Caddy**. Rejected:
  pointless overhead for a two-project setup.
- **Separate VPS per project**. Rejected: doubles the monthly cost
  without removing the problem (the projects share other
  resources too).
- **Hand-edit `/etc/caddy/Caddyfile` again and trust that nobody
  touches it**. Rejected: the previous post-mortem demonstrated
  this is a regret, not a fix.

## Consequences

- Two repos must move in lockstep: this PR (cercol PR #25) only
  takes effect after topquaranta PR #57 ships the `import`
  directive. Operators need to know not to merge PRs that touch
  the multi-tenant boundary out of order.
- Every new subdomain or service that lives behind Caddy gets its
  own snippet file; this is the convention going forward.
- The smoke test in `deploy-backend.yml` is the canary for any
  future regression on either side of the boundary.

## Related

- PR `#25 feat(infra): Phase 17.4 Caddy snippet ownership + CI guards` (this repo).
- PR `Top-Quaranta/TopQuaranta#57 caddy: import /etc/caddy/conf.d/*.caddy for multi-tenant infra`.
- Post-mortems:
  - `docs/post-mortems/2026-04-16-caddy-30day-silent-outage.md`
  - `docs/post-mortems/2026-05-17-caddy-outage-recurrence.md`
- Snippet source: `api/deploy/caddy/cercol-api.caddy`.
- Test: `api/tests/test_infra.py`.
- Workflow: `.github/workflows/deploy-backend.yml`.
