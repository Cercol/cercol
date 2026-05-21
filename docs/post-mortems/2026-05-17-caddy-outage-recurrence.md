# 2026-05-17 - Caddy outage recurrence on api.cercol.team

- **Date of incident**: 2026-05-17 21:15 UTC to 2026-05-20 20:50 UTC
  (about three days)
- **Severity**: high
- **Impact**: identical to the previous outage. `api.cercol.team`
  returned a TLS alert externally; frontend cercol.team continued
  to render but every API call failed. In addition, the
  frontend deploy pipeline itself failed (PR #23 and PR #24 deploy
  runs went red) because
  `scripts/prerender.mjs` tries to fetch
  `https://api.cercol.team/blog` to inject blog data into
  pre-rendered HTML. The frontend SEO sprint had to pause until
  the API was restored.

## Timeline

Times in UTC. Reconstructed from server file mtimes,
`journalctl -u caddy`, and GitHub Actions logs.

- **2026-05-17 ~21:09** - Topquaranta merged commit `5338b01`
  ("social: distribució diferenciada de mencions per canal").
  Deploy workflow ran.
- **2026-05-17 21:15** - `tq-sync-infra` overwrote
  `/etc/caddy/Caddyfile` from the topquaranta repo. The
  `api.cercol.team` block that had been manually restored on
  2026-05-16 was once again erased. Caddy reloaded; SNI for
  `api.cercol.team` started failing.
- **2026-05-20 19:40** - Frontend deploy of PR #23 (Phase 17.2 SEO
  indexability fixes) failed in the prerender step:
  `[prerender] fatal: [TypeError: fetch failed]` with
  `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`. Documented in
  `gh run 26185656844`.
- **2026-05-20 19:51** - Same failure on PR #24's deploy
  (`gh run 26186192207`).
- **2026-05-20 19:55** - Investigation began. SSH into the server
  confirmed `cercol-api.service` was healthy on `127.0.0.1:8090`
  but no Caddy site block for the public hostname.
- **2026-05-20 20:50** - PR #25 merged with the structural fix
  (multi-tenant Caddy via `conf.d/`). Backend deploy
  `gh run 26189187889` installed the snippet, validated Caddy, and
  passed the new external smoke test. API was reachable again.
- **2026-05-20 20:50** - Frontend deploy of PR #25 ran, prerender
  succeeded, gh-pages updated.

## Root cause

Same as the April outage. The 2026-05-16 manual fix did not address
the structural issue; it only restored the Caddyfile contents,
which were always going to be overwritten at the next topquaranta
deploy. The lesson from the first incident was filed in
`ROADMAP.md` as "Phase 17.1" prose but never landed as a code or
infrastructure change.

This makes the post-mortem of the first incident itself part of the
root cause of the second: a regret without a structural fix.

## Fix applied

PR #25 on cercol and PR #57 on topquaranta, both merged on
2026-05-20. The two PRs together implement the architecture
described in
[`docs/decisions/0004-caddy-multi-tenant-conf-d.md`](../decisions/0004-caddy-multi-tenant-conf-d.md):

- Topquaranta's `deploy/Caddyfile` ends with
  `import /etc/caddy/conf.d/*.caddy` (PR #57).
- Cèrcol owns `api/deploy/caddy/cercol-api.caddy`. The backend
  deploy installs it to `/etc/caddy/conf.d/cercol-api.caddy` with
  `cmp -s` idempotency, `caddy validate`, rollback on failure, and
  `systemctl reload caddy`.
- New external smoke test in deploy-backend.yml: five retries of
  `curl -fsS https://api.cercol.team/blog`. A repeat of this
  failure mode now makes the deploy fail.
- New CI check in `ci.yml`: `caddy validate` inside the `caddy:2`
  Docker image on every push that touches the snippet.

## Prevention

- ADR
  [`docs/decisions/0004-caddy-multi-tenant-conf-d.md`](../decisions/0004-caddy-multi-tenant-conf-d.md)
  defines the ownership boundary and locks the new architecture.
- Test
  [`api/tests/test_infra.py`](../../api/tests/test_infra.py)
  guards the snippet's existence and content in this repo.
- Deploy-time smoke test in
  [`.github/workflows/deploy-backend.yml`](../../.github/workflows/deploy-backend.yml)
  catches any future recurrence regardless of cause.
- Policy
  [`docs/policies/identities.md`](../policies/identities.md) Rule 1
  about ownership boundaries on shared server files generalises the
  lesson.

## Lessons learned

- A post-mortem without a structural fix is a regret. The first
  Caddy outage was "fixed" in April with no commit; the second
  outage is the direct consequence.
- Failures of internal dependencies that the build pipeline depends
  on become deploy-blocking failures, not just runtime failures.
  This made the SEO sprint pause, which surfaced the issue quickly,
  but it could also have been worse if the prerender script had
  fallen back silently.
- Every shared infrastructure file that lives outside a repo has to
  either (a) live in exactly one repo with a clear ownership marker
  or (b) be split into per-owner pieces with an `import` or `include`
  boundary.
