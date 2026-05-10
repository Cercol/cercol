# Cèrcol — Cron jobs

System-level cron files for the Hetzner VPS. These are NOT applied
automatically by `deploy-backend.yml`; they require a one-time manual
installation by an administrator on the production server.

## cercol-purge-tokens

Daily cleanup of expired authentication tokens. Closes audit-v2
finding V7 (no scheduler called the purge endpoint).

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
