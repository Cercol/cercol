# ADR 0006: Cron pattern for SEO ingest jobs

- **Number**: 0006
- **Title**: Cron pattern for SEO ingest jobs
- **Status**: Accepted
- **Date**: 2026-05-22

## Context

Phase 17.6 requires scheduled jobs:

- Bing Webmaster Tools API pull (weekly).
- PageSpeed Insights run against the top URLs (weekly).
- Caddy access log parser (daily).
- GSC Bulk Export is push-driven by Google; no cron needed.

The repo already has one in-repo cron pattern: `api/deploy/cron/cercol-purge-tokens`
is a file shipped in the repo whose install procedure is documented
in `api/deploy/cron/README.md` and applied manually on the server
with `sudo cp` into `/etc/cron.d/`.

There is also one in-process scheduled task: `_norm_refresh_loop`
in `api/main.py` runs as an `asyncio.create_task` and refreshes
empirical norms every 28 days.

## Decision

Use the existing `/etc/cron.d/cercol-<name>` pattern for the three
new SEO ingest jobs. Each job ships as a file under
`api/deploy/cron/` with a one-line install procedure in the cron
README. The cron file invokes a Python script under `api/scripts/`
that calls the relevant API and writes into the BigQuery dataset
(see ADR 0005) via the service account.

Do NOT introduce APScheduler in-process for these jobs. They run
once per day or once per week, they fail loudly and recover by
retry on the next tick, and they should not couple to the API
process lifecycle.

The `_norm_refresh_loop` is the existing exception. It stays in
process because it operates on data already loaded by the API and
runs at a 28-day cadence, where setting up a cron file would be
heavier than the benefit.

## Alternatives considered

- **APScheduler in-process**. Rejected: introduces a second
  scheduling mechanism beside the existing cron one, fragments
  ownership, and couples ingest cadence to the API restart cycle.
- **GitHub Actions cron**. Rejected: the ingest scripts need read
  access to the local Caddy logs (`/var/log/caddy/`) and the
  production database; GitHub-hosted runners do not have either
  without exposing credentials over the network.
- **systemd timers**. Considered as cleaner than cron.d on modern
  Linux, but rejected for consistency with the existing pattern.
  A future ADR may switch the cron pattern wholesale to systemd
  timers; that would supersede this ADR.

## Consequences

- Each new cron job ships in the same PR as the script it runs.
  The PR template's checkbox about migrations (which assumes
  immediate-after-merge application) extends to cron installs:
  the operator runs the documented `sudo cp` after the merge.
- The runbook documents the current cron inventory on the server.
- Failure mode is silent unless the script writes to a log file.
  Each ingest script must emit structured logs to stdout (captured
  by cron's mail or by a tail file) and surface failures to a
  monitoring channel.

## Related

- ADR 0005 (GCP project and BigQuery dataset).
- `api/deploy/cron/README.md` for the install procedure pattern.
- `api/deploy/cron/cercol-purge-tokens` as the existing example.
