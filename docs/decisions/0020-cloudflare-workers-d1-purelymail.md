# ADR 0020: API on a Cloudflare Worker with D1 and KV, frontend as Cloudflare static assets, mail on Purelymail

- **Number**: 0020
- **Title**: Move the API to a Cloudflare Worker (D1 + KV), the frontend to Cloudflare static assets, and mail to Purelymail; retire password sign-in
- **Status**: Accepted
- **Date**: 2026-08-17

## Context

Since ADR 0002 the API, its Postgres database, the mail server and
the DNS glue for `cercol.team` all lived on one Hetzner VPS shared
with the topquaranta project. Cèrcol shared seven things with its
neighbour: Caddy, the Postgres cluster, the Stalwart mail server, the
MX of its own domain, the SPF that authorised that server to send as
cercol.team, the DKIM keys, and the OS. Two production outages
(`docs/post-mortems/2026-04-16-caddy-30day-silent-outage.md` and
`docs/post-mortems/2026-05-17-caddy-outage-recurrence.md`) were caused
by the neighbour's deploy overwriting the shared Caddy config; ADR
0004 contained the symptom, not the coupling. On top of that, the
operator was without a computer for months, so every operation
(deploy, rollback, secret rotation, data fix) had to be possible from
a phone or through an assistant, without ssh sessions on a box whose
state neither of them could see.

## Decision

Take Cèrcol entirely off the shared box:

- **API**: a Cloudflare Worker `cercol-api` (`worker/`), custom domain
  `api.cercol.team`, data in a D1 database `cercol` (SQLite, schema in
  `worker/schema/`) and a KV namespace `NORMS` for norm caches, SEO
  cache and the links-sweep cursor. Scheduled jobs run on Worker cron
  triggers (`worker/src/scheduled.js`). Deployed by `deploy-worker.yml`.
- **Frontend**: a static-assets Worker `cercol-web` (`web/wrangler.jsonc`)
  serving `dist/` with SPA fallback on `cercol.team` and `www.cercol.team`
  (www redirected to the apex by a zone rule). This is ADR 0013
  implemented, as a Worker with static assets rather than a Pages project.
- **DNS**: the zone moved from Porkbun to Cloudflare (2026-08-17).
- **Mail**: receiving and mailboxes on Purelymail (hello@, miquel@,
  admin@) from 2026-08-18; sending stays on Resend. Stalwart retired.
- **Auth**: magic link and Google OAuth only. Password sign-in retired
  (endpoints answer 410): bcrypt does not fit the 10 ms CPU budget and
  a weaker hash was not worth keeping the feature.

The cutover used the strangler pattern: the Worker owned routes one
group at a time and proxied the rest to Hetzner through
`origin.cercol.team`, with a single `WRITES_LIVE` switch moving writes
and auth. Postgres has been frozen since `WRITES_LIVE=1` on 2026-08-17.
The narrative is in `docs/architecture/seo-pipeline.md`, section "The
Cloudflare migration (Aug 2026)".

## Alternatives considered

- **Stay on the shared box and coordinate with topquaranta**: rejected;
  the coupling (Caddy, Postgres, mail, DNS, OS) is structural and every
  fix so far had been a convention the neighbour could break again.
- **A second VPS for Cèrcol alone**: rejected; it removes the neighbour
  but keeps a box to patch, back up and ssh into, which the operator
  could not do for months.
- **Cloudflare only for the frontend (ADR 0013's scope)**: rejected as
  the whole answer; it left the API, database and mail on the shared box,
  which is where the outages came from.

## Consequences

- Free-plan limits shape the code: 10 ms CPU per invocation (bcrypt
  out, WebCrypto only), 50 subrequests per invocation (the links sweep
  is paced at 15 URLs per tick with a KV cursor), 5 cron triggers (seven
  jobs share five schedules), D1 is SQLite (per-statement size limit,
  no Postgres extensions). The daily brief watches usage and warns at 70%.
- Migrations `db/migrations/001..094` are history; the D1 schema lives
  in `worker/schema/`, content changes go through the blog admin
  endpoints or `wrangler d1 execute` (supersedes ADR 0011).
- Backups are `wrangler d1 export`; the two-leg pg_dump strategy of ADR
  0017 no longer applies.
- The PageSpeed API key is still IP-restricted to Hetzner in Google
  Cloud, so the `cercol-pagespeed-ingest` cron stays on the box until the
  restriction is lifted.
- GitHub Pages remains published as a warm fallback for a fortnight
  from 2026-08-17; the DNS records to restore it are saved locally.
- Rollback windows: `WRITES_LIVE=0` returns writes and auth to Hetzner;
  api.cercol.team DNS to grey returns everything. Both close at
  decommission (`scripts/decommission-hetzner.sh`), a later step after a
  quiet period. Until then `api/` and its deploy files are legacy origin
  fallback only.
- The MCP server on Hetzner (ADR 0008) is not user-facing and goes with
  the decommission; the Worker already holds `MCP_API_KEY`.
- New vendor dependencies: Cloudflare (account "cercol") and Purelymail.
  Secrets live on the Worker (`wrangler secret put`), never in the repo;
  names are listed in `docs/policies/identities.md`.

## Related

- Supersedes ADR 0002 (API hosting), ADR 0004 (Caddy multi-tenant),
  ADR 0011 (Postgres migration apply), ADR 0017 (Postgres backups).
  Implements ADR 0013.
- Post-mortems: `docs/post-mortems/2026-04-16-caddy-30day-silent-outage.md`,
  `docs/post-mortems/2026-05-17-caddy-outage-recurrence.md`.
- Commits: `81d30a2ed feat(web): cercol.team and www served by the cercol-web Worker`,
  `75835450c chore(migration): decommission script for Hetzner, and the seven duplicate crons disabled`.
- `docs/architecture/seo-pipeline.md` (migration narrative), `docs/ops/runbook.md`.
