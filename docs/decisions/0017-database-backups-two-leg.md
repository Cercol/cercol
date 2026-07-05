# ADR 0017: Database backups, two-leg strategy

- **Number**: 0017
- **Title**: Two-leg backup strategy for the cercol PostgreSQL database
- **Status**: Accepted
- **Date**: 2026-07-05 (proposed and accepted same day; design signed
  off by the operator before implementation)

## Context

The cercol PostgreSQL database (~20 MB) holds everything the project
cannot regenerate: profiles, auth tables, results (the raw material for
the Phase 4+ team instrument), witness sessions, groups, blog posts and
funnel events. Until now it had no logical backup at all: the July 2026
reliability audit confirmed no `pg_dump` anywhere on the server, and
`docs/ops/runbook.md` carried the TODO "Backups are the operator's
responsibility (`pg_dump`). Frequency and offsite copy procedure: TODO
document." This ADR closes that TODO.

Hetzner Cloud machine-level backups ARE enabled on the VPS (billed as
"Backup (20% of instance price)" on the invoice): whole-VM,
crash-consistent, 7-day retention, stored with the same provider under
the same account. They are the coarse fallback, not a substitute:

- no granular restore (whole-VM rollback also rolls back topquaranta,
  which shares the box),
- no off-provider copy (a lost account or provider incident loses both
  the VM and its backups),
- crash-consistent only, no application-consistent guarantee for
  PostgreSQL.

## Decision

Two legs, proportionate to actual risk on a shared VPS:

- **Leg 1, logical-error recovery**: nightly `pg_dump` of the cercol
  database only (never topquaranta's), custom format (`-Fc`), stored
  on-box under `/var/backups/cercol/` with local rotation keeping the
  7 most recent dumps. Covers accidental deletes, bad migrations and
  application bugs, restorable table by table with `pg_restore`.
- **Leg 2, disk/box-loss recovery**: the same dump encrypted and pushed
  off-box to Google Drive via rclone, with its own retention (30 days).
  Google Drive is chosen because it is free, already in use by the
  operator, and decoupled from the pending Cloudflare Pages migration
  (ADR 0013).

Implementation details (resolved during implementation, see
`api/deploy/backup/cercol-db-backup.sh`):

- **Encryption: gpg symmetric (AES256)** with a passphrase read from a
  root-only file at `/root/.cercol-backup-passphrase`. gpg 2.2 is
  already installed on the server; `age` is not, and installing a new
  tool for one `gpg --symmetric` call fails the proportionality test.
  The passphrase file is created by the operator at install time and is
  NEVER committed to the repository.
- **rclone auth: interactive OAuth token flow (user-owned quota)**, not
  a service account. On a personal Google account, service-account
  uploads can land in the service account's own 15 GB quota instead of
  the user's Drive, and the SA identity would be one more secret to
  manage. The OAuth token is created interactively by the operator
  (`rclone config`) during the one-time manual install step; rclone
  refreshes it automatically afterwards.
- **Schedule: daily at 03:15 UTC**, offset from the existing crons
  (02:00 crawl parser, 03:00 Sunday Bing ingest, 04:00 token purge,
  05:00 daily jobs). Runs as root: the dump itself is executed via
  `runuser -u postgres` (peer auth), while root owns the passphrase
  file, the backup directory and the rclone config.
- **No silent deaths**: the script exits non-zero on any failure, logs
  every run to `/home/cercol/logs/db-backup.log` (the cron line
  redirects stdout and stderr there), and maintains a
  `/home/cercol/logs/db-backup.FAILED` marker file that is written on
  failure and removed on the next success, so a human or a future
  digest job can detect a broken backup without reading cron mail.
  This deliberately breaks with the `MAILTO=""` pattern of the other
  crons, which has let jobs die silently for weeks, twice.

## Alternatives considered

- **Hetzner Storage Box**: rejected on cost. Hard constraint for this
  decision: no new spend.
- **Cloudflare R2**: rejected to avoid coupling the backup path to an
  incomplete migration (ADR 0013 is still Proposed); if that migration
  is later accepted, moving Leg 2 to R2 is a one-line rclone remote
  change.
- **Backblaze B2**: rejected to avoid a new account and identity to
  manage for a 20 MB payload.
- **Committing encrypted dumps to Git**: rejected on security grounds
  (user PII in a public repository, even encrypted, with no revocation
  story) and repo hygiene (unbounded binary growth).

## Consequences

- One manual install step on the server, mirroring the existing cron
  deployment pattern: files live in the repo
  (`api/deploy/backup/cercol-db-backup.sh`,
  `api/deploy/cron/cercol-db-backup`), the operator installs once. The
  exact install block lives in `docs/ops/runbook.md`.
- Restore procedures (on-box, off-box, and the Hetzner whole-VM last
  resort) and a quarterly restore test are documented in
  `docs/ops/runbook.md`, replacing the TODO.
- Restore capability is only proven by restoring: the runbook documents
  a scratch-database restore test to run once after install and then
  quarterly.
- Follow-up, out of scope here: standardise output redirection and
  failure alerting across the other existing cron jobs; the current
  `MAILTO=""` pattern lets crons die silently for weeks (proven twice:
  crawl-parser since 2026-05-28, and the 2026-04-16 Caddy outage class
  of silence).
