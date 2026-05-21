# ADR 0005: GCP project and BigQuery dataset for SEO observability

- **Number**: 0005
- **Title**: GCP project and BigQuery dataset for SEO observability
- **Status**: Proposed
- **Date**: 2026-05-21

## Context

Phase 17.6 (SEO observability) ingests Google Search Console Bulk
Export, Bing Webmaster Tools API, PageSpeed Insights, and parsed
Caddy access logs into a single store with dashboards and a custom
MCP server. The store needs to be queryable, cheap at low volume,
and Google-native (GSC Bulk Export only exports to BigQuery).

`docs/EXPLORATION-2026-05-21.md` confirmed there is no existing
GCP project linked to Cèrcol; the only Google integration in the
codebase is sign-in OAuth against Miquel's personal Google account.

## Decision

Create a new GCP project `cercol-team-observability`. Billing
owner: Miquel personal (the `hello@cercol.team` Google Workspace
account does not yet exist; see `docs/policies/identities.md`).
BigQuery dataset `cercol_seo` in EU region.

A dedicated service account
`cercol-seo-ingest@cercol-team-observability.iam.gserviceaccount.com`
holds the keys for ingest jobs, scoped to write into
`cercol_seo` and nothing else.

When `hello@cercol.team` is migrated to Workspace (backlog Phase
17.7), the billing owner moves and the project gets transferred;
service account stays unchanged.

## Alternatives considered

- **Reuse an existing GCP project from another personal/work
  account**. Rejected: mixing identities across projects violates
  the rule in `docs/policies/identities.md`.
- **Use BigQuery free-tier from a separate Google account**.
  Rejected: same identity-mixing argument, and the free tier has
  10 GB storage per month which is below the expected volume after
  one year of GSC export.
- **Self-host the warehouse (DuckDB on the VPS, ClickHouse)**.
  Rejected: GSC Bulk Export only writes to BigQuery; self-hosting
  would require building a custom export pipeline.

## Consequences

- Expected cost: 0.50 to 2 EUR per month for BigQuery storage at
  current site volume. Bulk Export is free. PSI API is free.
- One more identity surface to maintain (the service account key).
  Logged in the runbook.
- Migration cost later: transferring the project to the Workspace
  tenant is one-click in GCP console but needs to be done at the
  right moment (after billing reaches a stable state on the
  Workspace account).

## Related

- Phase 17.6 plan (not yet written).
- ADR 0006 (cron pattern for the ingest jobs).
- ADR 0007 (PageSpeed data source).
- `docs/policies/identities.md` Rule 1.
