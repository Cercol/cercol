"""
SEO ingest jobs.

# Spec: docs/architecture/seo-pipeline.md

This package contains standalone scripts invoked by /etc/cron.d/cercol-*
cron jobs on the Hetzner VPS. Each job pulls from a third-party API or
parses a local log, then writes into the BigQuery `cercol_seo` dataset.

Jobs do NOT run in the FastAPI process (see
docs/decisions/0006-cron-pattern-seo-ingest.md). They are invoked from
the project's venv as scripts.

Module layout:
  _config.py            - shared env-var loader, fail-fast helpers
  bing_ingest.py        - Bing Webmaster Tools API -> bing_* tables
  pagespeed_ingest.py   - PSI API + top-N URL selection -> pagespeed_runs
  crawl_log_parser.py   - Caddy JSON access logs -> crawl_logs
"""
