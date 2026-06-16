# Cèrcol — Cron jobs

System-level cron files for the Hetzner VPS. These are NOT applied
automatically by `deploy-backend.yml`; they require a one-time manual
installation by an administrator on the production server.

## cercol-purge-tokens

Daily cleanup of expired authentication tokens. Closes audit-v2
finding V7 (no scheduler called the purge endpoint). Also prunes
funnel `events` older than 120 days (Phase 17.6.7): `page_view` rows
(one per route change) grow fast, and 120 days comfortably covers the
weekly digest's current + prior-week windows. Re-install this file
when updating to pick up the retention DELETE.

### Install

```bash
sudo cp /home/cercol/api/api/deploy/cron/cercol-purge-tokens /etc/cron.d/
sudo chmod 644 /etc/cron.d/cercol-purge-tokens
```

### Schedule

`0 4 * * *` — daily at 04:00 UTC. The chosen hour is low-traffic and
matches the pattern of `topquaranta` already installed on the same VPS.

### Verify

```bash
# Confirm install
ls -la /etc/cron.d/cercol-purge-tokens

# Trigger the SQL once manually
sudo -u postgres psql -d cercol -c "DELETE FROM magic_tokens WHERE expires_at < NOW(); DELETE FROM refresh_tokens WHERE expires_at < NOW(); DELETE FROM oauth_states WHERE created_at < NOW() - INTERVAL '1 hour';"

# After the next 04:00 UTC trigger
journalctl -t CRON --since "today 03:55" | grep cercol
```

### Why a system cron and not a GitHub Action?

A system cron does not require committing service tokens or SSH keys
to GitHub secrets, runs entirely inside the trust boundary of the
production VPS, and matches the pattern already in use for
`topquaranta`. Trade-off: the install is manual once.

## SEO ingest jobs (Phase 17.6.1a)

Three new cron files ship with this phase. They are deployed
manually (same convention as `cercol-purge-tokens` above) when
Phase 17.6.1b lands. Until then they live in the repo only and the
file `/etc/cron.d/cercol-*` on the server is unchanged.

Each job uses the project's venv at
`/home/cercol/api/api/.venv/bin/python` and runs as the `cercol`
user. Secrets come from `/home/cercol/.env`.

### cercol-bing-ingest

Pulls Bing Webmaster Tools stats into `cercol_seo.bing_*` tables.
Schedule: `0 3 * * 0` (Sundays 03:00 UTC). Rationale in the file
header. See ADR 0005 and ADR 0006.

### cercol-pagespeed-ingest

Runs PageSpeed Insights against the top-N URLs (mobile + desktop)
and writes to `cercol_seo.pagespeed_runs`. Schedule:
`0 4 * * 0` (Sundays 04:00 UTC, one hour after Bing). See ADR 0007.

### cercol-crawl-parser

Parses `/var/log/caddy/cercol_api_access.log` for crawler hits and
writes to `cercol_seo.crawl_logs`. Schedule: `0 2 * * *` (daily
02:00 UTC). State persisted to
`/home/cercol/.state/crawl_parser_offset`.

Filesystem permission setup (one-time on the server, before
installing the cron):

```bash
sudo mkdir -p /home/cercol/.state && sudo chown cercol:cercol /home/cercol/.state
sudo usermod -aG adm cercol     # Caddy logs are caddy:adm 0640
# the cercol user must log out and back in for the group to take effect
```

### Install all SEO crons

```bash
sudo cp /home/cercol/api/api/deploy/cron/cercol-bing-ingest      /etc/cron.d/
sudo cp /home/cercol/api/api/deploy/cron/cercol-pagespeed-ingest /etc/cron.d/
sudo cp /home/cercol/api/api/deploy/cron/cercol-crawl-parser     /etc/cron.d/
sudo chmod 644 /etc/cron.d/cercol-bing-ingest /etc/cron.d/cercol-pagespeed-ingest /etc/cron.d/cercol-crawl-parser
```

### Verify

```bash
ls -la /etc/cron.d/cercol-*
journalctl -t CRON --since "today" | grep cercol-
```

## cercol-weekly-digest (Phase 17.6.7)

Emails one branded English metrics summary of the prior Mon-Sun week
to `DIGEST_EMAIL` (default `hello@cercol.team`): signups, tests +
clusters, funnel + conversions, top articles, search (GSC/Bing),
PageSpeed, broken links, and week-over-week deltas. Reads PostgreSQL
+ BigQuery; sends through `api/emails.py` (Resend). Runs as the
`cercol` user from the project venv.

### Install

```bash
sudo cp /home/cercol/api/api/deploy/cron/cercol-weekly-digest /etc/cron.d/
sudo chmod 644 /etc/cron.d/cercol-weekly-digest
```

### Schedule

`0 8 * * 1` — Mondays 08:00 UTC, after the weekend SEO jobs and past
the ~48h GSC export lag. Prerequisite: migration 026 (`page_view`)
applied, else the funnel's page-view stage stays empty.

### Verify

```bash
ls -la /etc/cron.d/cercol-weekly-digest
# Manual one-shot (sends a real email):
sudo -u cercol bash -c 'cd /home/cercol/api/api && set -a && . /home/cercol/.env && set +a && /home/cercol/api/api/.venv/bin/python -m jobs.weekly_digest'
journalctl -t CRON --since "today" | grep weekly-digest
```
