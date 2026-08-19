# Operations runbook

How to operate Cèrcol in the day to day and during incidents, on the
Cloudflare deployment that has been live since 2026-08-17. The
narrative of how the move was done is in
`docs/architecture/seo-pipeline.md` § "The Cloudflare migration
(Aug 2026)"; this file is the "what do I type" companion.

## The map

| Piece | Where | Config |
|---|---|---|
| API, `api.cercol.team` | Cloudflare Worker `cercol-api` | `worker/wrangler.jsonc`, code in `worker/src/` |
| Data | Cloudflare D1 database `cercol` (SQLite), binding `DB` | schema in `worker/schema/` |
| Caches and cursors | KV namespace `NORMS` | keys `norms:v1`, `seo:*`, `bq:access-token`, `links:sweep` |
| Frontend, `cercol.team` and `www` | Cloudflare Worker `cercol-web`, static assets only | `web/wrangler.jsonc`, serves `dist/` |
| DNS | Cloudflare zone `cercol.team` (moved from Porkbun 2026-08-17) | dashboard |
| Mail out | Resend, `noreply@cercol.team` | `worker/src/emails.js`, secret `RESEND_API_KEY` |
| Mail in, mailboxes | Purelymail (`hello@`, `miquel@`, `admin@`) | `docs/ops/email.md` |
| SEO data | BigQuery, project `cercol`, datasets `cercol_seo` and `searchconsole` | `worker/src/bigquery.js`, secret `GOOGLE_SA_JSON` |
| Payments | Stripe, test mode | `worker/src/stripe.js` |

Cloudflare account "cercol", id `04bf08778ace2b87b910fb5ca0be3feb`.
D1 database id `928ddbd6-5fc6-4e2b-9fd1-e7de66435ef6`. KV namespace id
`34d45ee221ff417d83b2bead1dc20f26`. Both ids are in the wrangler
configs; they are listed here so a dashboard search finds them.

Every `wrangler` command below runs from the repo root and needs
either a browser login (`npx wrangler login`) or the two env vars
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (the same two that
GitHub Actions holds as secrets). Always pass `--config` for the
Worker you mean; the repo has two.

## Logs and observability

Live tail of the API Worker (requests, `console.log` lines, cron
runs, exceptions):

```
npx wrangler tail cercol-api --config worker/wrangler.jsonc
npx wrangler tail cercol-api --config worker/wrangler.jsonc --status error
npx wrangler tail cercol-api --config worker/wrangler.jsonc --search "[cron]"
```

`--format json` for machine reading, `--method`, `--header`, `--ip
self` are the other useful filters (`npx wrangler tail --help`).

Both Workers have `observability.enabled = true`, so the Cloudflare
dashboard keeps invocation logs and metrics: Workers & Pages →
`cercol-api` → Observability (or Logs). That is where to read a cron
run that happened last night, CPU time percentiles, error counts by
status, and the `exceededResources` errors that mean an invocation
went over the 10 ms CPU budget. Scheduled runs log one line per job,
`[cron] <name> ok <ms> {...}` or `[cron] <name> FAILED <ms> <error>`
(`worker/src/scheduled.js`).

The daily brief (see below) is the summary of all of this; the
dashboard is for the drill-down.

## Deploy

### API Worker

Push to `main` touching `worker/**`, `src/utils/role-scoring.js`
(imported by the digest job) or `package*.json` runs
`.github/workflows/deploy-worker.yml`: `npm install`, the Worker unit
tests (`npx vitest run worker/test`), `npx wrangler deploy --config
worker/wrangler.jsonc`, then a smoke test of `/health` and `/blog` on
`https://api.cercol.team`. The workflow also accepts
`workflow_dispatch`.

Emergency manual deploy, only when Actions is down:

```
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... \
  npx wrangler deploy --config worker/wrangler.jsonc
```

Cloudflare keeps previous versions of the Worker; a bad deploy is
undone with `git revert` and a push, or from the dashboard's
Deployments tab (rollback to a previous version) if the repo is not
the problem. Secrets, bindings and cron triggers are not touched by a
code deploy.

### Frontend Worker

Push to `main` touching `src/**`, `public/**`, `index.html`,
`vite.config.js`, `package*.json`, `.env.production`, `scripts/**` or
`db/migrations/**` runs `.github/workflows/deploy-frontend.yml`, and
so does the nightly schedule at 03:20 UTC. The job runs the tests,
`npm run build:full` (Vite plus the puppeteer prerender of about 650
routes, which reads article bodies from `api.cercol.team`), the
internal link integrity guard, `npx wrangler deploy --config
web/wrangler.jsonc`, and still publishes `dist/` to the `gh-pages`
branch as a warm fallback. Drop the gh-pages step after a quiet
fortnight from 2026-08-17.

Because the prerender reads the live API, a content change made
through the blog admin endpoints or `wrangler d1 execute` is not on
the site until the next frontend build. Dispatch `deploy-frontend` by
hand after a content change you want visible before 03:20 UTC.

`npm run deploy` (local build, push to gh-pages) is the old manual
path. Do not use it: it desyncs the fallback from what the Worker
serves.

## Secrets

Secrets live on the `cercol-api` Worker, never in the repo, never in
`wrangler.jsonc`. Names, as of 2026-08-18:

```
BING_WMT_API_KEY        Bing Webmaster Tools, jobs/bing.js
CF_ACCOUNT_ID           Cloudflare GraphQL analytics (daily brief, crawlers)
CF_ANALYTICS_TOKEN      Cloudflare API token, Zone Analytics Read
CF_ZONE_ID              cercol.team zone, for the analytics queries
GOOGLE_CLIENT_ID        Google OAuth web client
GOOGLE_CLIENT_SECRET
GOOGLE_SA_JSON          BigQuery service-account JSON, whole file
JWT_SECRET              HS256 key for access tokens
MCP_API_KEY             present, unused by the Worker today
PAGESPEED_API_KEY       PSI v5, jobs/pagespeed.js
PURELYMAIL_API_KEY      credit line in the daily brief
RESEND_API_KEY          transactional email
STRIPE_PRICE_ID         the one premium price
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
WRITES_LIVE             "1"; the strangler switch, see Rollback
```

Plain vars (`FRONTEND_URL`, `BACKEND_URL`) are in `worker/wrangler.jsonc`.
Optional overrides read by the code but not set (`DIGEST_EMAIL`,
`BIGQUERY_PROJECT`, `BIGQUERY_DATASET_SEO`, `BIGQUERY_DATASET_GSC`,
`DOI_CHECK_SKIP`) fall back to defaults in the code.

Ownership of each credential is in `docs/policies/identities.md`.

### Listing and setting

```
npx wrangler secret list --config worker/wrangler.jsonc
npx wrangler secret put NAME --config worker/wrangler.jsonc     # prompts on stdin
npx wrangler secret delete NAME --config worker/wrangler.jsonc
```

`secret put` takes effect on the next request; there is no restart and
no redeploy. To set a secret without it passing through your terminal
history, pipe it: `some-command-that-prints-it | npx wrangler secret
put NAME --config worker/wrangler.jsonc`. During the migration the
values travelled from the Hetzner box to Cloudflare over ssh stdin
with a one-hour scoped token, so no one read them; keep that habit.

### Rotations

- **JWT_SECRET**: generate 48 random bytes
  (`openssl rand -base64 48`), `secret put JWT_SECRET`. Every access
  token in circulation fails verification at once; refresh tokens are
  D1 rows and are unaffected, so a signed-in browser gets a 401,
  refreshes, and carries on with a token signed by the new key. Do it
  at a quiet hour anyway. While the Hetzner fallback exists, its
  `/home/cercol/.env` must get the same value or a `WRITES_LIVE=0`
  rollback would reject every session.
- **GOOGLE_CLIENT_SECRET**: new secret on the same OAuth client in
  Google Cloud Console, `secret put`, then delete the old one in the
  console. No user impact.
- **RESEND_API_KEY**: new key in the Resend dashboard, `secret put`,
  revoke the old key. Test with a magic link request to yourself.
- **STRIPE_***: same pattern; the webhook secret changes only if the
  endpoint is recreated in the Stripe dashboard.
- **GOOGLE_SA_JSON**: new key on the service account
  `cercol-seo-ingest@cercol.iam.gserviceaccount.com`, `secret put`
  with the whole JSON file (`cat key.json | npx wrangler secret put
  GOOGLE_SA_JSON --config worker/wrangler.jsonc`), delete the old key
  in IAM. The token cache in KV (`bq:access-token`) expires on its
  own within the hour.
- **CLOUDFLARE_API_TOKEN** (GitHub Actions secret, not a Worker
  secret): rotate in the Cloudflare dashboard (My Profile → API
  Tokens), then update the repository secret. It has to be allowed to
  deploy both Workers and to write D1 (the "Edit Cloudflare Workers"
  template plus D1); check the current token's permissions in the
  dashboard before creating the new one.

## D1 (the database)

One database, `cercol`, SQLite dialect. Schema in
`worker/schema/001_blog.sql` (blog_posts, blog_slug_redirects) and
`worker/schema/002_core.sql` (auth_users, profiles, refresh_tokens,
magic_tokens, oauth_states, email_change_tokens, results, events,
groups, group_members, witness_sessions, witness_responses,
translation_feedback). `db/migrations/001..094` are the Postgres
history and are frozen; do not add to them.

### Query

```
npx wrangler d1 execute cercol --remote --config worker/wrangler.jsonc \
  --command "SELECT COUNT(*) FROM results"
npx wrangler d1 execute cercol --remote --config worker/wrangler.jsonc \
  --file path/to/statements.sql
```

`--remote` is the production database; without it wrangler talks to a
local copy. Booleans are 0/1, timestamps are ISO strings with `+00:00`.

Per-statement size limit: D1 caps a single SQL statement at 100 KB
and a longer one fails with `SQLITE_TOOBIG`. Article bodies in six languages exceed that, so a
large blog write goes as a row insert with a small `content` followed
by one `UPDATE ... SET content = json_set(content, '$.<lang>', ?)` per
language. Prefer the blog admin endpoints on the Worker
(`worker/src/blog-admin.js`, DOI gate included) for content changes,
and `--file` only for the odd fix.

### Backup and export

```
npx wrangler d1 export cercol --remote --config worker/wrangler.jsonc \
  --output backups/cercol-$(date +%F).sql
```

Full SQL dump, schema and data; `--table`, `--no-schema` and
`--no-data` narrow it. Cloudflare also keeps D1 Time Travel (point in
time restore, `npx wrangler d1 time-travel info cercol` and
`... restore`, see `--help` for the flags and the retention). There is no scheduled export today; take one before any
hand-run `--file` write and after each blog batch.

The final Postgres dump taken at decommission (2026-08-19, see
Rollback levers) is the pre-migration baseline; the ADR 0017 Postgres
backup legs stopped with the box.

### Admin bootstrap

`profiles.is_admin` is the gate for every `/admin/*` route
(`worker/src/admin.js`, `requireAdmin`). Promote by SQL:

```
npx wrangler d1 execute cercol --remote --config worker/wrangler.jsonc \
  --command "UPDATE profiles SET is_admin = 1 WHERE email = 'admin@cercol.team'"
```

### Blog slug redirects

`blog_slug_redirects` (`slug_old` to `slug_new`) is read by
`GET /blog/<slug>` in `worker/src/index.js`, which answers 308 for a
dead slug and refuses chains and cycles. Add one:

```
npx wrangler d1 execute cercol --remote --config worker/wrangler.jsonc \
  --command "INSERT OR IGNORE INTO blog_slug_redirects (slug_old, slug_new, reason) VALUES ('<old>', '<new>', '<why>')"
```

## KV

Namespace `NORMS`, four kinds of keys: `norms:v1` (empirical norm
cache, `worker/src/norms.js`, refreshed by `POST /admin/norms/refresh`
or on a miss), `seo:*` (BigQuery answers for the admin SEO pages, one
hour TTL), `bq:access-token` (service-account token, expires with the
token), `links:sweep` (cursor of the external links sweep). All of it
is a cache or a cursor and can be deleted; the code recomputes.

```
npx wrangler kv key list --namespace-id 34d45ee221ff417d83b2bead1dc20f26
npx wrangler kv key get links:sweep --namespace-id 34d45ee221ff417d83b2bead1dc20f26
npx wrangler kv key delete links:sweep --namespace-id 34d45ee221ff417d83b2bead1dc20f26
```

Deleting `links:sweep` restarts the sweep from the first URL on the
next tick.

## Scheduled jobs

Five cron triggers (the free-plan maximum) carry eight jobs, in
`worker/src/scheduled.js` and `worker/src/jobs/`:

| Trigger (UTC) | Jobs, in order |
|---|---|
| `0 4 * * *` | `purge-tokens`, `group-nudge`, `links-tick`, `daily-brief` |
| `0 5 * * *` | `seo-anomalies`, `links-tick` |
| `0 3 * * SUN` | `bing-ingest` |
| `0 4 * * SUN` | `pagespeed-ingest` |
| `0 9 * * MON` | `links-tick`, `weekly-digest` |

Each job is wrapped so one failure never stops the next in the same
trigger. `purge-tokens` deletes used or expired rows from
magic_tokens, email_change_tokens, refresh_tokens (7 days after
revocation or expiry) and oauth_states, and events older than 120
days. `links-tick` probes 15 external URLs per run and keeps its
cursor in KV; a full sweep of the ~207 URLs takes about five days, and
the digest reads the latest completed snapshot. `pagespeed-ingest`
runs 20 analyses (10 URLs, mobile and desktop) and takes longer than an
HTTP client waits, so on demand pass `?urls=https://cercol.team/` to
limit it; the Sunday cron has the full wall budget. (Its API key was
IP-restricted to Hetzner until 2026-08-18; it is not any more.)

### Run a job on demand

Every job is callable, with an admin JWT:

```
curl -X POST "https://api.cercol.team/admin/jobs/<name>?dry_run=1" \
  -H "Authorization: Bearer $JWT"
```

Names: `purge-tokens`, `group-nudge`, `seo-anomalies`, `bing-ingest`,
`pagespeed-ingest`, `links-tick`, `weekly-digest`, `daily-brief`.
`dry_run=1` (or `true`) is forwarded as `{ send: false }` to
`weekly-digest` and `daily-brief` and as `{ dryRun: true }` to every
other job; jobs that do not read it run for real regardless
(`runJob` in `worker/src/admin.js`, then the job's own signature).
The response is `{ job, dry_run, ms, result }`, or `error` with a 500
when the job threw. An unknown name answers 404 with the list.
`GET /admin/probe?url=<url>` runs one link probe and returns the raw
result, for when the sweep reports something odd. `GET /admin/bq`
runs a BigQuery smoke query.

### Getting an admin JWT

Passwords are retired, so the token comes from a magic link:

```
curl -X POST https://api.cercol.team/auth/magic-link/request \
  -H 'content-type: application/json' -d '{"email":"admin@cercol.team"}'
```

Open the `admin@cercol.team` mailbox on Purelymail, copy the `token=`
value from the link (it points at `cercol.team/auth/callback?type=magic&token=...`),
then:

```
curl -X POST https://api.cercol.team/auth/magic-link/verify \
  -H 'content-type: application/json' -d '{"token":"<token>"}'
```

The response carries `access_token` (valid 1 hour) and
`refresh_token`. `admin@cercol.team` must have `is_admin = 1` in
`profiles` (see Admin bootstrap). Signing in on cercol.team also
works, but the access token lives in a JS module variable there, so
curl is the practical path.

## Monitoring: the daily brief and the weekly digest

There is no pager. Two emails are the monitoring surface, and reading
them is the operator's job:

- **Daily brief** (`worker/src/jobs/daily.js`, 04:00 UTC, to
  `hello@cercol.team`): warnings first, or one green line. Yesterday's
  signups, tests, page views and visitors against the same weekday a
  week earlier; new accounts; content that moved; Search Console
  clicks for the latest exported day; and the platform against the
  free-plan caps (D1 rows read and written, KV writes, Worker
  requests, CPU p99, errors by status, Purelymail credit). Anything
  above 70% of a cap is a warning line at the top.
- **Weekly digest** (`worker/src/jobs/digest.js`, Monday 09:00 UTC):
  the full picture for the prior Monday to Sunday, roles, languages,
  SEO, PageSpeed, broken links, crawler traffic from Cloudflare
  analytics.

If the brief does not arrive, that is itself the alert: check the
04:00 cron run in the dashboard and `wrangler tail --search "[cron]"`
around 04:00 UTC. Both emails render through `worker/src/email-ui.js`
(mm-design tokens) and are sent through Resend.

## Free-plan limits

What the code was shaped by, and what the brief watches:

| Resource | Limit | Where it bites |
|---|---|---|
| Worker requests | 100,000 per day | API only; static assets on `cercol-web` are free and uncounted |
| CPU per invocation | 10 ms (soft; over it, `exceededResources` kills the invocation) | JSON-heavy list endpoints, no bcrypt |
| Subrequests per invocation | 50 | links sweep paced at 15 URLs, PSI capped at 20 URLs x 2 devices |
| Cron triggers | 5 per account | eight jobs on five triggers |
| D1 | 5 M rows read per day, 100 k rows written per day, 500 MB | list endpoints, `purge-tokens` |
| KV | 100 k reads per day, 1 k writes per day | SEO cache TTL of one hour, one norms key |

A Worker fetching its own routed hostname is refused as a loop, so no
job self-chains; that is why the sweep is a cursor.

## Mail

Sending (Resend) and receiving (Purelymail) are two separate systems
with separate failure modes. DNS records (MX, SPF, DKIM, DMARC),
mailbox settings, how to test each direction and what to do when one
of them fails are in `docs/ops/email.md`. Do not touch the SPF record
without reading it: it authorises both providers.

## Rollback levers

- **`WRITES_LIVE`**: `npx wrangler secret put WRITES_LIVE --config
  worker/wrangler.jsonc` with value `0` turns every gated route (writes,
  auth, /me, witness, groups, Stripe, admin) into a 404 while the blog
  reads and `/health` keep answering; an emergency brake, not a
  rollback, since the Hetzner origin is gone (2026-08-19). Set it back
  to `1` to return. No redeploy.
- **Worker versions**: the Deployments tab in the dashboard rolls back
  to a previous version of either Worker without a git change, and
  `git revert` + push does the same through CI.
- **D1**: `wrangler d1 time-travel` restores the database to any point
  in the last 30 days; the final Postgres dump
  (`~/.cercol-migration/backups/cercol-final-2026-08-19.dump`, md5
  `cdeab4643ac4bcdc448061dab446d6ca`) is the pre-migration baseline.

## Incident: api.cercol.team is down

1. `curl -sS https://api.cercol.team/health` and `/blog`. A Cloudflare
   error page (1xxx codes) is a platform or DNS matter; a 5xx with a
   JSON body or an `exceededResources` in the tail is the Worker.
2. `npx wrangler tail cercol-api --config worker/wrangler.jsonc
   --status error` while reproducing.
3. Cloudflare status page, then the dashboard: Workers & Pages →
   `cercol-api` → Deployments. If the last deploy is the suspect,
   roll back there or `git revert` and push.
4. `dig api.cercol.team +short` should return Cloudflare addresses
   (orange cloud, Worker custom domain), not `188.245.60.20`.
5. D1 status: `npx wrangler d1 execute cercol --remote --config
   worker/wrangler.jsonc --command "SELECT 1"`.
6. If a gated route misbehaves in a way that damages data,
   `WRITES_LIVE=0` stops writes and auth while you look.

The Caddy post-mortems (`docs/post-mortems/2026-04-16-*` and
`2026-05-17-*`) describe pre-migration failure modes that no longer
exist on this stack.

## When the beta grant runs out

`BETA_TOTAL` in `worker/src/db.js` is 500 free Full Moon licences, and
`GET /beta` reports what is left. While any remain, Full Moon is free
to a new account, and the copy says so in several places.

These strings stop being true the day it reaches zero, and nothing
watches for that:

- `seo.instruments.description` in every `src/locales/*.json`: "Four
  free Big Five instruments", which counts Full Moon among them. It is
  a meta description, so a search engine will keep serving the old one
  for a while after it changes.
- `auth.confirmBody`: "unlock your free Full Moon assessment".
- Three sentences in the `best-free-personality-tests-for-teams-2026`
  article, in all six language bodies (added by Postgres migration
  093, now living in D1): the pricing line, the comparison table row,
  and the closing section that introduces the Witness assessment. Each
  says Full Moon is a one-time paid purchase **and** free to new
  accounts while the open beta lasts, so when the grant ends the fix
  is to delete the second half of a sentence rather than to rewrite a
  claim. Grep for `open beta`, `beta oberta`, `beta abierta`, `bêta
  ouverte`, `offenen Beta` and `åbne beta`; edit through the blog
  admin endpoints.

The FAQ answer at `faq.instruments.a` says Full Moon is paid without
that qualifier, so it reads as narrower than the blog rather than as
a contradiction, and it needs no change when the grant ends. The
`seo.newMoon`, `seo.firstQuarter` and `seo.fullMoon` descriptions
deliberately carry **no** beta claim.

Check with `curl -s https://api.cercol.team/beta`.

## SEO data and Google Cloud

The SEO jobs write to BigQuery (`docs/architecture/seo-pipeline.md`,
ADRs 0005 to 0007). From the Worker they authenticate as the service
account `cercol-seo-ingest@cercol.iam.gserviceaccount.com` with the
key stored whole in `GOOGLE_SA_JSON`; no SDK, `worker/src/bigquery.js`
signs the RS256 assertion itself.

Token identity (unchanged, still provisional): the service account
and the GCP project `cercol` are owned by Miquel's personal Google
account, because creating a Workspace account on `hello@cercol.team`
was blocked at Gmail's phone-verification step. Tracked as Phase 17.7
in `ROADMAP.md`.

The PageSpeed API key (`PAGESPEED_API_KEY`) has an application
restriction by IP address in the Google Cloud console (APIs &
Services → Credentials) that only allows the Hetzner box. Removing
that restriction, or replacing it with none, is what lets
`pagespeed-ingest` run from the Worker and retires the last Hetzner
cron. The BigQuery service account cannot change it; it needs the
project owner in the console.

Checking the tables from a machine with the `bq` CLI and credentials:

```
bq query --nouse_legacy_sql 'SELECT COUNT(*) FROM `cercol.cercol_seo.bing_query_stats`'
bq query --nouse_legacy_sql 'SELECT COUNT(*) FROM `cercol.cercol_seo.pagespeed_runs` WHERE run_date = CURRENT_DATE()'
bq query --nouse_legacy_sql 'SELECT COUNT(*) FROM `cercol.cercol_seo.external_links_status`'
```

Crawler traffic no longer comes from a log parser: `jobs/crawlers.js`
reads it from Cloudflare's GraphQL analytics for the whole zone when
the digest asks, which needs `CF_ANALYTICS_TOKEN`, `CF_ACCOUNT_ID` and
`CF_ZONE_ID`.

Closed-loop copy changes (`register_copy_change.py`,
`seo_copy_impact.py`) were Python scripts on the box and have not been
ported; the BigQuery table stays readable.

## DNS verification

DNS is on Cloudflare. A TXT record for Search Console or any other
verification is added in the dashboard (DNS → Records) or with the
Cloudflare API and the same account token. Remove it afterwards
unless the service requires it to persist. Managed `robots.txt` is
disabled on the zone on purpose: the Worker and the static site serve
their own.

## The Hetzner box, after decommission

Decommissioned on 2026-08-19 with `scripts/decommission-hetzner.sh`:
`cercol-api` and `cercol-mcp` stopped and disabled, the Caddy block for
`api.cercol.team` / `origin.cercol.team` retired, all eight crons
disabled, Stalwart retired at `/root/stalwart-retired-2026-08-18`, and
a final `pg_dump` copied off the box. Two things are still there on
purpose, harmless: the frozen Postgres `cercol` database (drop it with
`ssh root@188.245.60.20 "sudo -u postgres dropdb cercol"` when you no
longer want the second copy) and the code under `/home/cercol`. The
box belongs to topquaranta; nothing of Cèrcol runs, listens or is
scheduled on it.
