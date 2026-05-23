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
`/home/cercol/.secrets/cercol-sa.json`, never in this repo. The
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

1. Place the SA key at `/home/cercol/.secrets/cercol-sa.json`,
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
