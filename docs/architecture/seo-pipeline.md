# SEO data pipeline

End-to-end architecture of the SEO observability surface that Phase
17.6.1a establishes in code. Phase 17.6.1b deploys it; this document
describes the design that lands when both phases ship.

# Spec: docs/architecture/seo-pipeline.md

## Goal

Centralise every SEO signal Cèrcol cares about into one BigQuery
project so dashboards and ad-hoc queries can join across sources.
Sources covered here:

- Google Search Console (impressions, clicks, queries, pages,
  countries, devices). Pushed by Google's own bulk export.
- Bing Webmaster Tools (queries, pages, crawl stats). Pulled by
  us.
- PageSpeed Insights v5 (LCP, INP, CLS, FCP, TTFB, scores per
  device). Pulled by us.
- Caddy crawler hits on `api.cercol.team`. Parsed locally.

The pipeline is intentionally code-first: every transformation has
a Python module and a pytest, every table has a DDL file, every
schedule has a cron file in this repo. Nothing important lives
only on the server.

## GCP project layout

| Item | Value |
|---|---|
| Project id | `cercol` |
| Project number | 607121997818 |
| Region | EU (multi-region) |
| Billing owner | Miquel personal account (provisional, see ADR 0005) |

Two datasets:

- `searchconsole` - Google Search Console bulk export. Tables and
  schema owned by Google; we only read from it.
- `cercol_seo` - everything we write. Five tables, all created from
  the DDL under `api/data/bigquery_ddl/` by
  `scripts/apply_bigquery_ddl.py --apply`.

Tables in `cercol_seo`:

| Table | Source | Partition | Cluster |
|---|---|---|---|
| `bing_query_stats` | Bing WMT GetQueryStats | date | query |
| `bing_page_stats` | Bing WMT GetPageStats | date | page |
| `bing_crawl_stats` | Bing WMT GetCrawlStats | date | - |
| `pagespeed_runs` | PSI API v5 | run_date | url, device |
| `crawl_logs` | Caddy access log parser | ts_date | bot_name, path |

See `docs/data/seo-schema.md` for column-level details.

## Identity and credentials

Service account: `cercol-seo-ingest@cercol.iam.gserviceaccount.com`,
key file stored on the server at
`/home/cercol/.secrets/cercol-seo-ingest.json`, never in this repo. The
.gitignore patterns added in FASE A block accidental commit.

Project ownership is currently on Miquel's personal Gmail account
because creating a new Google Workspace account on
`hello@cercol.team` is blocked at the phone-verification step.
This is conscious technical debt; the migration is tracked as
Phase 17.7 in ROADMAP. The runbook documents which tokens migrate
when the move happens.

Environment variables read by the ingest jobs (see
`api/jobs/_config.py`):

- `BIGQUERY_PROJECT` default `cercol`
- `BIGQUERY_DATASET_GSC` default `searchconsole`
- `BIGQUERY_DATASET_SEO` default `cercol_seo`
- `GOOGLE_APPLICATION_CREDENTIALS` path to the SA key file
- `BING_WMT_API_KEY` Bing Webmaster Tools API key
- `PAGESPEED_API_KEY` PSI API key
- `SEO_SITE_URL` default `https://cercol.team/`

All loaded from `/home/cercol/.env` on the server (per
`docs/ops/runbook.md`).

## Ingest jobs

Three Python modules under `api/jobs/`, invoked from
`/etc/cron.d/cercol-*` files on the server. Not in-process. See
ADR 0006 for the cron-vs-APScheduler decision.

### bing_ingest.py

Cadence: weekly, Sunday 03:00 UTC. Pulls three Bing methods,
parses each, and DELETE-then-INSERTs the affected day partitions
in BigQuery. Idempotent on re-run within the same day.

### pagespeed_ingest.py

Cadence: weekly, Sunday 04:00 UTC. URL selection:

- After the GSC bulk export has at least 14 days of data:
  top-N URLs by impressions over the last 14 days, queried from
  `searchconsole.searchdata_url_impression`.
- Before that: hardcoded `SEED_URLS` list inside the module.

For each URL, two PSI calls (mobile and desktop). Rows append to
`pagespeed_runs`; history is kept for trend dashboards.

### crawl_log_parser.py

Cadence: daily 02:00 UTC. Reads
`/var/log/caddy/cercol_api_access.log` incrementally from the
saved offset and inode in
`/home/cercol/.state/crawl_parser_offset`. Filters lines whose
User-Agent matches one of 15 known crawler patterns, classifies
into a normalised `bot_name`, and writes one row per hit.

## Limitation: frontend has no origin logs

The frontend at `cercol.team` is hosted by GitHub Pages. GitHub
does not expose origin logs to the site owner. Consequences:

- The Caddy log parser sees ONLY `api.cercol.team` traffic.
  Google crawls of `/`, `/science/`, `/blog/...` are invisible
  to us at the origin.
- For full-site crawler observability we depend on Search
  Console Crawl Stats (per-day aggregates by file type and
  response code), which is not part of the bulk export and
  requires a separate API call. A future job under
  `api/jobs/gsc_crawl_stats_ingest.py` will fill that gap; not
  in scope for 17.6.1a.

The dashboards explicitly distinguish "API surface" (rich data)
from "frontend surface" (sparse, GSC-only).

## Sequencing

Phase 17.6.1a: code in this repo only. No deploy. No real API
calls.

Phase 17.6.1b: server-side deploy. Steps documented in the
runbook:

1. Place the SA key at `/home/cercol/.secrets/cercol-seo-ingest.json`,
   mode 0400, owner `cercol:cercol`.
2. Add the SEO env vars to `/home/cercol/.env`.
3. Run `scripts/apply_bigquery_ddl.py --apply` once to create
   the `cercol_seo` tables.
4. Install the three cron files (see `api/deploy/cron/README.md`).
5. Wait 48 hours for the GSC bulk export to populate, then
   confirm the first runs landed data in BigQuery.

Phase 17.6.2 onwards: ingest the remaining sources (GSC Crawl
Stats, CrUX BigQuery export), build the admin dashboards (ADR
0009), expose the MCP server (ADR 0008).

## Phase 17.6.2 to 17.6.6 (delivered in one ultra-sprint, 2026-05-23)

Adds the read surfaces on top of the ETL foundation that
17.6.1a/b shipped.

### Admin SEO API (api/seo.py)

Six read-only endpoints under `/admin/seo/*` behind the admin gate
(see `_require_admin` in api/seo.py, an explicit local duplicate
following the same pattern as api/blog.py; TODO Phase 17.8
extracts the dependency to api/deps.py):

- `GET /admin/seo/sources` — row counts and last-update per
  ingest table plus GSC bulk-export readiness.
- `GET /admin/seo/health` — 28-day KPIs across all sources.
- `GET /admin/seo/queries` — top queries, prefers GSC and falls
  back to Bing.
- `GET /admin/seo/pages` — top pages, same preference order.
- `GET /admin/seo/anomalies` — pages with > threshold_pct change
  in 7 days vs prior 7 days.
- `GET /admin/seo/page/{slug}/lifecycle` — per-day history for
  one URL.

Process-local cache with configurable TTL
(`SEO_CACHE_TTL_S`, default 3600). All endpoints return their
normal shape with a `data_pending: true` flag when the underlying
tables are empty; no 500 responses on pending data.

### Admin dashboard (src/pages/AdminDashboardPage.jsx)

Rewrites the SEO tab (previously a hardcoded checklist). New
sections, top to bottom: data-pending banner, source status grid,
28-day overview (4 StatCards), 7-day crawler bar chart, quick-wins
table (queries at SERP position 8 to 20), anomalies list,
auxiliary external-tools and LLM-visibility sections at the
bottom. Uses Recharts, already in package.json.

### Daily anomaly detector (api/jobs/seo_anomaly_detect.py)

Cron `cercol-seo-anomaly` runs at 05:00 UTC. Compares the last
7 days vs prior 7 days for:

- GSC impressions per URL.
- Lighthouse mobile performance score per URL (compares the two
  most recent runs).

Threshold defaults to 30 percent. Writes one row per anomaly into
the auto-created `cercol_seo.seo_anomalies` table. The daily
cron-mail log carries a summary. Weekly digest email was
intentionally deferred to a later phase (ROADMAP 17.6.3+).

### MCP server (api/mcp/server.py + systemd unit)

Separate process under cercol-mcp.service, bound to
`127.0.0.1:8091`. Operator reaches it via SSH tunnel; no public
subdomain (ADR 0008). Six tools: `seo_query`, `seo_page_lifecycle`,
`seo_anomalies`, `seo_quick_wins`, `seo_compare_periods`,
`seo_sources_status`.

SQL safety on the `seo_query` tool: a token-boundary regex blocks
all DML and DDL (INSERT/UPDATE/DELETE/DROP/ALTER/CREATE/etc.) and
constrains every query to address `cercol.cercol_seo` or
`cercol.searchconsole`. Multi-statement and CALL also blocked.
Twenty unit tests cover the safety surface plus the per-tool
behaviour.

Auth: dedicated `MCP_API_KEY` env var, bearer header.

### Closed-loop copy tracking

`cercol_seo.copy_changes` (DDL 06) tracks title/description/h1
changes with a scheduled_measure_ts for the 14-day evaluation.

- `scripts/register_copy_change.py`: manual CLI invoked on the
  server after merging a copy-change PR.
- `api/jobs/seo_copy_impact.py`: weekly job that walks
  `WHERE measured = FALSE AND scheduled_measure_ts <= NOW()`,
  computes 14d-after vs 14d-before CTR for each row from GSC,
  and writes the result back. Skips rows for which GSC has no
  data in either window.
- Cron file not installed in this sprint; install procedure in
  the runbook for the future "go live" of closed-loop.

### Weekly digest funnel: which source feeds which number

The weekly digest (`api/jobs/weekly_digest.py`) funnel mixes two
independent tables, which is easy to misread when querying by hand:

- The four event rows (page views, article reads, test starts, CTA
  clicks) come from the `events` table.
- "Tests completed" (both the funnel row and the north-star headline)
  is a `COUNT(*)` over the `results` table, **not** an event.

The `events` table column is `name` (not `event_type`), and a CHECK
constraint restricts it to exactly four values: `page_view`,
`article_view`, `cta_click`, `test_start`. There is **no**
`test_completed` event, and completions are never counted from
`events`.

False-alarm correction (Jul 2026): a prior ad-hoc query reported
"the events table has zero rows for `cta_click` and `test_completed`".
That was a query artifact — it filtered on `event_type` (the column is
`name`) and on `test_completed` (not a valid event name). Ground truth:
`cta_click` rows do exist, and completions come from `results`. The
digest funnel numbers are accurate.
