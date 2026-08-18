# Backend architecture

One Cloudflare Worker, `cercol-api`, on `api.cercol.team`, with a D1
database (SQLite) and one KV namespace. About 3700 LOC of plain
JavaScript in `worker/src/`, no framework, no router library, no
ORM, no SDKs for Google, Stripe or Resend: each integration is the
one or two HTTPS calls it actually needs plus WebCrypto. The move
from the FastAPI on Hetzner (2026-08-17) is narrated in
`docs/architecture/seo-pipeline.md` § "The Cloudflare migration".

## Layout

```
worker/
  wrangler.jsonc         # name, D1 and KV bindings, FRONTEND_URL/BACKEND_URL, five cron triggers
  schema/
    001_blog.sql         # blog_posts, blog_slug_redirects
    002_core.sql         # auth, profiles, results, events, groups, witness, translation_feedback
  test/pure.test.js      # unit tests of the pure logic, part of the root vitest run
  src/
    index.js             # fetch entry: the MIGRATED route table, CORS, proxyToOrigin, blog reads
    auth.js              # magic link, Google OAuth, refresh, signout, /me family, email change
    jwt.js               # HS256 issue and verify, bearer parsing, random tokens
    db.js                # now(), uuid(), bool(), httpError(), jsonBody(), ensureProfile()
    writes.js            # POST /events, /blog/<slug>/view, /results, /results/<id>/accuracy, /translation-feedback
    emails.js            # transactional templates through Resend
    email-ui.js          # email design kit on mm-design tokens (brief and digest render through it)
    i18n/emails.json     # the string table for the transactional emails, six languages
    witness.js           # Witness sessions, public completion, aggregate reporting
    groups.js            # groups, invitations, witness rounds, Last Quarter report data
    scoring.js           # server-side role scoring for the group report, on the frontend engine
    norms.js             # empirical norms from D1, cached in KV
    stripe.js            # checkout session and the completion webhook, signature by WebCrypto
    admin.js             # /admin/*: stats, users, results, norms, activity, feedback, jobs, probe
    seo.js               # /admin/seo/*: BigQuery reads cached in KV for an hour
    blog-admin.js        # blog create/update/status with the DOI gate, /health, /robots.txt
    links.js             # markdown link and DOI extraction (shared by blog-admin and the sweep)
    bigquery.js          # service-account RS256 assertion, token in KV, query and execute
    scheduled.js         # cron entry: five triggers, eight jobs, and NAMED for on-demand runs
    jobs/
      daily.js           # daily brief
      digest.js          # weekly digest
      nudge.js           # group nudge
      links.js           # external links sweep, 15 URLs per tick, cursor in KV
      anomalies.js       # SEO anomaly detector
      bing.js            # Bing Webmaster ingest
      pagespeed.js       # PageSpeed ingest
      crawlers.js        # crawler traffic from Cloudflare analytics (read by the digest)
```

### index.js: the route table is the migration

`MIGRATED` is a flat array of `{ method, pattern, handler, gated }`.
`fetch` walks it, answers CORS preflight for a matched path, calls the
handler, wraps the response with the CORS headers for the three
allowed origins, and falls through to `proxyToOrigin` for anything not
in the list. `proxyToOrigin` forwards the request unchanged to
`https://origin.cercol.team` (the Hetzner box, DNS-only, with its own
Caddy certificate) and does not follow redirects, so a 308 from the
origin reaches the client as a 308.

Entries marked `gated: true` are only active while the `WRITES_LIVE`
secret is `"1"`. With any other value they are skipped and proxied,
which is what makes the whole API a single switch: flip it and writes,
auth, witness, groups, Stripe and admin go back to FastAPI without a
deploy. Only the blog reads, `/health` and `/robots.txt` are ungated.

The blog read projections (`listPosts`, `getPost`) live in `index.js`
too. They were byte-compared against the FastAPI answers with
`scripts/diff-api.mjs` (111 endpoints, 0 differences), which is why
they preserve things that look incidental: the camelCase keys, the
`published_at DESC, id DESC` ordering, the `languages` array computed
with a GLOB over the raw JSON column rather than a parse (parsing six
language bodies per article put CPU p90 at 69 ms against a 10 ms
budget).

### Why flat, still

The rationale from the FastAPI era carries over unchanged. The product
scope is small; a `routers/`, `services/`, `models/` tree would give
short files and a shallow call graph spread over three places. One
file per concern, SQL written where it is used, and `db.js` kept thin
on purpose so nothing hides a query. The largest file is `auth.js` at
about 370 lines. If `index.js` or any handler file passes roughly
1000 lines, revisit; today the biggest is well under half that.

## Database access

`env.DB` is the D1 binding, used directly with `prepare().bind()` and
`first()`, `all()`, `run()`, or `batch()` for multi-statement
transactions. There is no pool, no connection lifecycle and no ORM.
Conventions that follow from SQLite:

- Booleans are stored as 0/1 and converted with `bool()` from `db.js`
  at the edge, so the JSON contract still says `true`/`false`.
- Timestamps are ISO strings with `+00:00`, produced by `now()`.
- Ids are `crypto.randomUUID()`.
- No `STDDEV_SAMP`, no `NULLS LAST`, no `jsonb`: `norms.js` computes
  the sample SD from SUM and SUM(x*x), the blog list emulates NULLS
  LAST with `ORDER BY published_at IS NULL, published_at DESC`, and
  JSON columns are text, written with `json_set` and tested with GLOB.

The schema is `worker/schema/*.sql`, applied with `wrangler d1 execute
--file`. `db/migrations/001..094` are the Postgres history, frozen.
Content changes go through `blog-admin.js` or a hand-run `--file`
(SQLite dialect, 100 KB per statement; see the runbook).

## Auth and admin gates

`requireUser(env, request)` in `auth.js` returns the JWT payload or a
401 `Response`; every handler checks `instanceof Response` and returns
it. `requireAdmin` in `admin.js` adds the `profiles.is_admin` lookup
(401 then 403, in that order). `requirePremium` in `witness.js` is the
same shape for `premium OR is_beta`, and gates the Full Moon surfaces
of ADR 0018: witness sessions, my-sessions, the group report, and the
`fullMoon` branch of `POST /results`. Details in
`docs/architecture/auth.md`.

## Scheduled work

`scheduled.js` exports `scheduled(event, env, ctx)`, which looks the
cron expression up in `JOBS` and runs its steps under `ctx.waitUntil`.
Each step is wrapped so one failure never stops the next and every
outcome is one `[cron]` log line. `NAMED` maps a job name to a
function for `POST /admin/jobs/<name>`, which is the Worker's
equivalent of `python -m jobs.<name>` and is how any job is run on
demand or dry-run. The five triggers and what each carries are in
`docs/ops/runbook.md`.

Two free-plan limits shaped the jobs: 50 subrequests per invocation
(the links sweep is a 15-URL tick with a KV cursor; PageSpeed is
capped at 20 URLs x 2 devices) and 10 ms CPU (no bcrypt, no JSON
parsing of article bodies on hot paths). A Worker cannot fetch its own
routed hostname, so nothing self-chains.

## External integrations

- **Stripe** (`stripe.js`): checkout session creation and the
  `checkout.session.completed` webhook, one HTTPS call each; the
  webhook signature is HMAC-SHA256 over `<timestamp>.<raw body>` with
  `STRIPE_WEBHOOK_SECRET`. Test-mode keys, one price id.
- **Resend** (`emails.js`): the transactional templates, rendered per
  recipient in one of six languages from `i18n/emails.json`, from
  `noreply@cercol.team`. The brief and the digest build their HTML
  with `email-ui.js` and post to the Resend API themselves, same
  sender.
- **Google OAuth** (`auth.js`): one web client, redirect URI
  `BACKEND_URL/auth/google/callback`, CSRF state in D1.
- **BigQuery** (`bigquery.js`): the service-account JSON is the
  `GOOGLE_SA_JSON` secret; the module signs the RS256 assertion with
  WebCrypto, exchanges it for an access token cached in KV, and posts
  queries over REST. Used by `seo.js` and the SEO jobs.
- **Cloudflare GraphQL analytics** (`jobs/crawlers.js`, `jobs/daily.js`):
  zone traffic and Worker usage, with `CF_ANALYTICS_TOKEN`.

## Deploy flow

`.github/workflows/deploy-worker.yml` runs on push to `main` touching
`worker/**`, `src/utils/role-scoring.js` or `package*.json`: `npm
install`, `npx vitest run worker/test`, `npx wrangler deploy --config
worker/wrangler.jsonc` with `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`, then a smoke test of `/health` and `/blog`.
Secrets are set with `wrangler secret put` and survive deploys.
Emergency and rollback procedures are in `docs/ops/runbook.md`.

## Legacy `api/` (FastAPI)

`api/` is the FastAPI + asyncpg backend that ran on the Hetzner VPS
until 2026-08-17. It is still deployed there by `deploy-backend.yml`
and still answers on `origin.cercol.team`, but only as the origin
fallback: the Worker proxies to it whatever it does not own, and
everything when `WRITES_LIVE` is not `"1"`. Its Postgres database is
frozen. The Worker modules carry `mirrors api/x.py` notes because they
were written against it line by line, and `scripts/diff-api.mjs`
compares the two. The whole directory goes with
`scripts/decommission-hetzner.sh`; until then treat it as read-only
reference, not as a place to add features.

# Spec: docs/architecture/backend.md
