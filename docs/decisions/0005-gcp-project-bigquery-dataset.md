# ADR 0005: GCP project and BigQuery dataset for SEO observability

- **Number**: 0005
- **Title**: GCP project and BigQuery dataset for SEO observability
- **Status**: Accepted
- **Date**: 2026-05-22

## Context

Phase 17.6.1a builds the code for SEO observability (GSC Bulk Export,
Bing API, PageSpeed, Caddy log parsing). The pipeline needs a single
store. GSC Bulk Export only writes to BigQuery, so the store has to
be BigQuery.

The 2026-05-21 exploration confirmed there was no existing GCP
project linked to Cèrcol; the only Google integration in the
codebase was sign-in OAuth against Miquel's personal Google account.
(Archived reference: `docs/archive/audits/2026-Q2/EXPLORATION-2026-05-21.md`.)

## Decision

Use the GCP project `cercol` (project number 607121997818) for all
SEO observability data.

Two BigQuery datasets, both EU region:

- `searchconsole` - GSC Bulk Export destination. Tables and schema
  owned by Google; we read only.
- `cercol_seo` - everything written by our ingest jobs. Five tables,
  DDL under `api/data/bigquery_ddl/`, applied by
  `scripts/apply_bigquery_ddl.py --apply`.

Service account: `cercol-seo-ingest@cercol.iam.gserviceaccount.com`,
scoped to read `searchconsole` and read+write `cercol_seo`. Key file
stored on the Hetzner server at `/home/cercol/.secrets/cercol-sa.json`.

Budget alert: 30 DKK per month. BigQuery storage at this volume is
expected to cost about 0.50 to 2.00 EUR per month; the cap protects
against a runaway dashboard query.

## Alternatives considered

- **Reuse an existing GCP project from another personal account**.
  Rejected: mixing identities across projects violates the rule in
  `docs/policies/identities.md`.
- **BigQuery free tier on a separate Google account**. Rejected:
  same identity-mixing argument, and the free tier (10 GB storage,
  1 TB query) is below the expected volume after one year of GSC
  bulk export plus history.
- **Self-host the warehouse (DuckDB on the VPS, ClickHouse)**.
  Rejected: GSC Bulk Export only writes to BigQuery; self-hosting
  would require building a separate export pipeline that does not
  exist as a Google product.

## Consequences

Operational:

- Expected cost: 0.50 to 2.00 EUR per month for storage at current
  volume. Bulk Export is free of charge. PSI API is free within
  25000 queries per day.
- One more secret to manage (the service-account key file). Logged
  in the runbook.
- BigQuery is regional (EU). All queries from the Hetzner VPS
  traverse the open internet to GCP EU endpoints; latency is fine
  for batch ingest jobs but not suitable for synchronous request
  paths.

Identity debt:

- Billing owner is currently Miquel's personal Gmail account
  (`miquelmatoses@gmail.com`) because creating a Google Workspace
  account on `hello@cercol.team` is blocked at Gmail's phone
  verification step. This is conscious debt. Migration tracked
  as Phase 17.7 in the roadmap. The runbook captures which tokens
  rotate when the move happens; this ADR remains Accepted across
  that migration (the decision to use the `cercol` project does
  not change, only ownership of the account that holds it).

## Related

- Phase 17.6.1a code: api/jobs/, api/data/bigquery_ddl/.
- ADR 0006 (cron pattern for the ingest jobs).
- ADR 0007 (PSI plus CrUX).
- `docs/policies/identities.md` Rule 1.
- `docs/architecture/seo-pipeline.md`.
- Phase 17.7 in ROADMAP: identity migration to `hello@cercol.team`.
