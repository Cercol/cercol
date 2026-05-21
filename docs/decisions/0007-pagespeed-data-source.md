# ADR 0007: PageSpeed data source

- **Number**: 0007
- **Title**: PageSpeed data source for Core Web Vitals
- **Status**: Proposed
- **Date**: 2026-05-21

## Context

Phase 17.6 dashboards must show Core Web Vitals (LCP, INP, CLS) for
the top URLs of cercol.team. Two sources exist:

- **PageSpeed Insights API (PSI)**: synthetic, on-demand. Runs a
  Lighthouse audit against the URL from Google's infrastructure
  and returns lab metrics plus field metrics from the most recent
  28-day CrUX window. Free, with rate limits.
- **CrUX BigQuery export**: monthly export of real-user field data
  by Google. About 28 days of delay between the period and the
  export.

Either alone is incomplete.

## Decision

Use both, for different roles.

- PSI API for two purposes:
  - On-demand audits triggered manually from the admin dashboard
    when investigating a specific URL.
  - Post-deploy automated audit of the top N pages, run from a
    cron job (see ADR 0006). Stored as one row per URL per run in
    BigQuery; alerts when LCP or INP cross threshold.
- CrUX BigQuery export for the trend dashboards. Slower-moving but
  reflects real user experience across populations Cèrcol's
  synthetic probes never cover.

## Alternatives considered

- **PSI API only**. Rejected: synthetic data is sensitive to the
  state of Google's auditor network and does not reflect actual
  user devices in the field.
- **CrUX only**. Rejected: 28-day delay is too long for deploy
  feedback loops; PSI is the immediate signal after a deploy.
- **Self-hosted Lighthouse CI**. Considered, but it would still
  measure synthetic only (the lab side), and would add an extra
  service to operate. Punt to a later sprint if PSI API rate
  limits bite.

## Consequences

- Two ingest scripts, two BigQuery tables, two dashboards in the
  admin UI: one synthetic time series, one CrUX time series.
- The post-deploy alert is the immediate canary; the CrUX trend
  is the longitudinal truth. When they disagree (synthetic regresses
  but real users do not, or vice versa), the dashboard explicitly
  shows both side by side.
- PSI quota: the free tier is 25000 queries per day. At a top-N
  size of 50 URLs per run and four runs per week, this is well
  within quota.

## Related

- ADR 0005 (GCP project and BigQuery dataset).
- ADR 0006 (cron pattern).
- ADR 0009 (SEO admin UI rewrite) for the dashboards.
