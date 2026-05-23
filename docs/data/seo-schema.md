# SEO BigQuery schemas

Column-level reference for the `cercol.cercol_seo.*` tables.
Authoritative DDL lives under `api/data/bigquery_ddl/`; this file
mirrors it in human-readable form.

All tables include a trailing `ingested_at TIMESTAMP NOT NULL`
column populated by the writing job at insert time. It is not the
business date; use the per-table date column for partitioned
queries.

## bing_query_stats

Per-day per-query Bing search stats.

| Column | Type | Notes |
|---|---|---|
| date | DATE | Stat day in UTC. Partition key. |
| query | STRING | Bing-reported query string. Cluster key. |
| impressions | INT64 | Search result impressions on this day. |
| clicks | INT64 | Clicks on this day. |
| avg_position | FLOAT64 | Average SERP position. Null if Bing did not report. |
| ingested_at | TIMESTAMP | Write timestamp. |

Written by `api/jobs/bing_ingest.py` with DELETE-then-INSERT on
the day partition.

## bing_page_stats

Same shape as `bing_query_stats`, with `page` (STRING) instead of
`query`. Cluster key is `page`.

## bing_crawl_stats

Daily Bingbot crawl summary.

| Column | Type | Notes |
|---|---|---|
| date | DATE | Stat day in UTC. Partition key. |
| crawled_pages | INT64 | Pages Bingbot fetched. |
| crawl_errors | INT64 | 5xx, timeouts, DNS failures. |
| blocked | INT64 | Pages Bingbot was blocked from (robots.txt, 4xx). |
| ingested_at | TIMESTAMP | Write timestamp. |

## pagespeed_runs

One row per PSI run per (URL, device) pair.

| Column | Type | Notes |
|---|---|---|
| run_ts | TIMESTAMP | Exact run moment, write key. |
| run_date | DATE | Date(run_ts) for partitioning. |
| url | STRING | The audited page. Cluster key. |
| device | STRING | "mobile" or "desktop". Cluster key. |
| lcp_ms | INT64 | Largest Contentful Paint, ms. |
| fid_ms | INT64 | First Input Delay p75 from CrUX, ms. Legacy, often null. |
| inp_ms | INT64 | Interaction to Next Paint p75 from CrUX, ms. |
| cls | FLOAT64 | Cumulative Layout Shift, unitless. |
| fcp_ms | INT64 | First Contentful Paint, ms. |
| ttfb_ms | INT64 | Time To First Byte, ms. |
| performance_score | INT64 | Lighthouse performance 0..100. |
| accessibility_score | INT64 | Lighthouse accessibility 0..100. |
| seo_score | INT64 | Lighthouse SEO 0..100. |
| best_practices_score | INT64 | Lighthouse best practices 0..100. |
| ingested_at | TIMESTAMP | Write timestamp. |

Written by `api/jobs/pagespeed_ingest.py`. Append-only; the
history is kept for trend dashboards.

## crawl_logs

Crawler hits parsed from Caddy's JSON access log.

| Column | Type | Notes |
|---|---|---|
| ts | TIMESTAMP | Request timestamp from Caddy. |
| ts_date | DATE | Date(ts) for partitioning. |
| remote_ip | STRING | Client IP as Caddy saw it. |
| user_agent | STRING | Raw User-Agent header. |
| bot_name | STRING | Normalised crawler name. Cluster key. |
| host | STRING | Request host header. Always `api.cercol.team` today. |
| path | STRING | Request URI path. Cluster key. |
| status | INT64 | HTTP response status code. |
| duration_ms | INT64 | Caddy-reported handling time in ms. |
| bytes_sent | INT64 | Response body bytes. |
| ingested_at | TIMESTAMP | Write timestamp. |

Written by `api/jobs/crawl_log_parser.py`. Append-only; the
parser is stateful so each line is written at most once.

LIMITATION: this table covers only `api.cercol.team`. The
frontend `cercol.team` is on GitHub Pages, no origin logs. See
the limitations section of `docs/architecture/seo-pipeline.md`.
