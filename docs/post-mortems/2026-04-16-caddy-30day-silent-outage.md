# 2026-04-16 - Caddy 30-day silent outage of api.cercol.team

- **Date of incident**: 2026-04-16 to 2026-05-16 (30 days)
- **Severity**: high
- **Impact**: `api.cercol.team` returned a TLS alert ("internal error")
  to every external client for thirty days. The frontend at
  `cercol.team` is served by GitHub Pages and continued to render
  the SPA shell, but every API call (sign-in, blog list, witness
  submissions) failed silently in the browser. Most of the product
  was non-functional in practice. The team did not notice because
  there was no synthetic probe pointing at the API and traffic was
  low.

## Timeline

Times in UTC.

- **2026-04-16 17:56** - The topquaranta deploy ran `tq-sync-infra`
  for the first time after a refactor of its Caddyfile. The script
  copied `/home/topquaranta/app/deploy/Caddyfile` to
  `/etc/caddy/Caddyfile` byte for byte, with no merge logic. The
  in-place `api.cercol.team {...}` block that had been added by
  hand months earlier was erased. Caddy reloaded; from that moment
  it had no virtual host for `api.cercol.team`, so the SNI handshake
  failed.
- **2026-04-16 to 2026-05-16** - 30 days of silent failure. No
  alerts. No user reports reached the team.
- **2026-05-16** - During the 16-17 May SEO and performance sprint,
  Miquel discovered the outage while testing the prerender pipeline,
  which tries to fetch `https://api.cercol.team/blog` and was timing
  out with a TLS error.
- **2026-05-16** - Manual fix on the server: re-added an
  `api.cercol.team` block to `/etc/caddy/Caddyfile`, ran
  `caddy validate`, `systemctl reload caddy`. No commit, no record
  in any repo. Tagged in `ROADMAP.md` Phase 17.1 as "Restored API
  after 30-day silent Caddy outage".

## Root cause

Two coupled failures, neither of them was "a test was missing".

1. **Shared mutable state with no ownership boundary.** The Hetzner
   VPS hosts both Cèrcol and topquaranta. Caddy is shared. Until
   Phase 17.4 there was no convention about who owns
   `/etc/caddy/Caddyfile`. The topquaranta deploy assumed it owned
   the whole file, and the Cèrcol manual edit assumed the file was
   stable between deploys. Neither assumption was documented.

2. **No external probe.** Cèrcol's deploys did not test that the
   public API URL responded. The deploy script restarted
   `cercol-api.service` and exited green even when nothing was
   reachable from outside.

## Fix applied

The 2026-05-16 fix was a band-aid (manual re-edit of the live
Caddyfile). The structural fix arrived at Phase 17.4 (PR #25 on
this repo and PR #57 on topquaranta), documented in the next
post-mortem.

## Prevention

- Structural fix: ADR
  [`docs/decisions/0004-caddy-multi-tenant-conf-d.md`](../decisions/0004-caddy-multi-tenant-conf-d.md)
  defines the multi-tenant Caddy pattern. Each project owns its own
  snippet under `/etc/caddy/conf.d/`. The main Caddyfile, owned by
  topquaranta, contains
  `import /etc/caddy/conf.d/*.caddy` and never touches the
  directory.
- External probe: the smoke test added in
  `.github/workflows/deploy-backend.yml` (Phase 17.4) calls
  `https://api.cercol.team/blog` after deploy with five retries.
  A repeat of this failure mode would now turn the deploy red.
- Test guard: `api/tests/test_infra.py` asserts the snippet file
  exists and contains the expected directives, so a deletion or
  rename in this repo also fails CI.

## Lessons learned

- Shared mutable infrastructure files between repos must have a
  documented ownership boundary, enforced by tests on both sides.
- "Manual fix on the server, no commit" guarantees recurrence. Any
  configuration that lives on the server must have a source of
  truth in some repo.
- 30 days of silent failure of a core dependency is a signal that
  the dependency was not observable. Even cheap synthetic probes
  would have caught this in minutes.
