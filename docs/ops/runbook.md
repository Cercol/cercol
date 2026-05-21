# Operations runbook

How to operate the Cèrcol Hetzner VPS in the day to day and during
incidents. The host is `188.245.60.20` (`api.cercol.team`); the
backend systemd unit is `cercol-api.service`; the project home is
`/home/cercol/api`.

## Routine operations

### Deploy the backend

Push to `main` with changes under `api/**` triggers
`.github/workflows/deploy-backend.yml` automatically. The
workflow:

1. SSH as `root`.
2. `cd /home/cercol/api && git pull origin main`.
3. Install Caddy snippet to `/etc/caddy/conf.d/cercol-api.caddy`
   if it changed (`cmp -s`), validate, roll back on failure,
   `systemctl reload caddy`.
4. `systemctl restart cercol-api`.
5. Smoke test `curl -fsS https://api.cercol.team/blog`, five
   retries.

Manual override: `scripts/deploy-api.sh` from a local checkout
runs the same logic plus a `pip install` step that the workflow
omits. Use only when CI is down.

### Restart the backend

```
ssh root@188.245.60.20
systemctl restart cercol-api
systemctl is-active cercol-api
journalctl -u cercol-api -n 50 --no-pager
```

### Reload Caddy

After editing `/etc/caddy/conf.d/*.caddy` by hand:

```
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl reload caddy
```

Validate first. A failed reload keeps the previous config; a failed
validate stops you from reloading at all.

### Install a new cron job

Pattern from ADR 0006: each cron file lives in `api/deploy/cron/`
in the repo. Manual install on the server after merge:

```
sudo cp /home/cercol/api/api/deploy/cron/cercol-<name> /etc/cron.d/
sudo chmod 644 /etc/cron.d/cercol-<name>
```

Verify:

```
ls -la /etc/cron.d/cercol-<name>
journalctl -t CRON --since today | grep cercol-<name>
```

## Secrets

All secrets live in `/home/cercol/.env`, owned by the `cercol`
user, mode 0600.

### Current inventory

See `docs/policies/identities.md` for the policy and the current
ownership table.

### How to rotate JWT_SECRET

1. Generate the new secret:
   `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
2. SSH to the server, edit `/home/cercol/.env`, replace the value.
3. `systemctl restart cercol-api`.
4. All existing access and refresh tokens are invalidated; users
   will need to sign in again. Schedule the rotation for low
   traffic.

### How to rotate Google OAuth client secret

1. Generate a new secret in Google Cloud Console for the
   existing OAuth client.
2. Replace `GOOGLE_CLIENT_SECRET` in `/home/cercol/.env`.
3. `systemctl restart cercol-api`.
4. No user impact; ongoing access tokens unaffected.

### How to rotate Resend API key

1. Generate a new key in Resend dashboard.
2. Replace `RESEND_API_KEY` in `/home/cercol/.env`.
3. `systemctl restart cercol-api`.
4. Revoke the old key in Resend.

## DNS verification (Porkbun)

When verifying domain ownership with Google Search Console or other
services that ask for a TXT record:

- API key and secret live in `/home/cercol/.env` as
  `PORKBUN_API_KEY` and `PORKBUN_SECRET_KEY`.
- These are NOT consumed by the FastAPI process; they are used by
  manual scripts that operators run from the server to add or
  remove TXT records on demand.
- After verification, remove the TXT record unless the service
  requires it to persist.

The Porkbun API docs are at https://porkbun.com/api/json/v3/documentation .

## Caddy logs and observability

- Caddy logs to `/var/log/caddy/cercol_api_access.log` (rotated by
  the system logrotate; see `/etc/logrotate.d/`).
- `journalctl -u caddy --since today` for runtime events.
- `journalctl -u cercol-api -f` for live API logs.

There is no centralised log aggregation today. Phase 17.6 will
ingest the Caddy access log into BigQuery on a daily cron.

## Incident response: api.cercol.team is down

When the public hostname returns TLS internal alert or 502:

1. **Is the backend up?**
   `systemctl status cercol-api`. If not, restart it. If it
   crashes on restart, `journalctl -u cercol-api -n 200`.

2. **Is Caddy up?**
   `systemctl status caddy`. If not, restart it.

3. **Is the snippet in place?**
   `cat /etc/caddy/conf.d/cercol-api.caddy`. If missing or empty,
   reinstall from the repo:
   ```
   cd /home/cercol/api
   git pull
   sudo install -m 0644 api/deploy/caddy/cercol-api.caddy /etc/caddy/conf.d/cercol-api.caddy
   sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
   sudo systemctl reload caddy
   ```

4. **Has topquaranta's deploy clobbered the main Caddyfile?**
   `grep "import /etc/caddy/conf.d" /etc/caddy/Caddyfile`. If
   missing, the multi-tenant boundary defined in ADR 0004 is
   broken. File an issue on the topquaranta repo and contact the
   topquaranta operator. Do NOT try to add the import line by
   hand to `/etc/caddy/Caddyfile`; it will be overwritten at the
   next topquaranta deploy. The fix has to land in the
   topquaranta repo.

5. **Has DNS changed?**
   `dig api.cercol.team A +short`. Should return `188.245.60.20`.

6. **Is the cert valid?**
   `curl -vI https://api.cercol.team/blog 2>&1 | head -20`.

The relevant post-mortems are
`docs/post-mortems/2026-04-16-caddy-30day-silent-outage.md` and
`docs/post-mortems/2026-05-17-caddy-outage-recurrence.md`. Read
them if the same pattern recurs.

## Database

PostgreSQL runs on the same host. Connect as `cercol` via local
socket:

```
sudo -u cercol psql cercol
```

Migrations are applied by hand:

```
sudo -u cercol psql cercol -f db/migrations/<NNN>-<name>.sql
```

Backups are the operator's responsibility (`pg_dump`). Frequency
and offsite copy procedure: TODO document.
