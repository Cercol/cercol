# Cèrcol — Caddy snippet

Server-level Caddy snippet for `api.cercol.team`. Unlike the cron file
in `../cron/`, this snippet **is applied automatically** by
`deploy-backend.yml` on every push to `main` that touches `api/**`.

## cercol-api.caddy

Reverse-proxies `api.cercol.team` to the local FastAPI service on
`127.0.0.1:8090` (run by the `cercol-api` systemd unit).

### Why a per-project snippet under `/etc/caddy/conf.d/`

The Hetzner VPS hosts both Cèrcol and topquaranta. Caddy is shared.
Topquaranta owns `/etc/caddy/Caddyfile` and re-syncs it on every
deploy from its own repo, so any block added in-place to that file
disappears at the next topquaranta deploy. This is the same outage
that took down the API for ~30 days before Phase 17.1, and that took
it down again on 2026-05-17 (root cause of Phase 17.4).

The stable architecture: topquaranta's `Caddyfile` ends with
`import /etc/caddy/conf.d/*.caddy`, and each per-project repo ships
its own snippet under `/etc/caddy/conf.d/`. Each project owns its own
file, no shared mutable state.

### Install path

```
/etc/caddy/conf.d/cercol-api.caddy
```

Owner `root:root`, mode `0644`. The file is byte-equal to the copy
under `api/deploy/caddy/cercol-api.caddy` in this repo.

### Deploy flow (automatic)

`.github/workflows/deploy-backend.yml` does, in order:

1. SSH to the Hetzner VPS as `root`.
2. `git pull origin main` inside `/home/cercol/api`.
3. If `api/deploy/caddy/cercol-api.caddy` differs from
   `/etc/caddy/conf.d/cercol-api.caddy`, install the new version,
   run `caddy validate --config /etc/caddy/Caddyfile`, and on
   validation failure roll back the snippet and abort. On success,
   `systemctl reload caddy`.
4. `systemctl restart cercol-api`.
5. External smoke test against `https://api.cercol.team/blog`.

### Manual install (emergency only)

```bash
sudo install -m 0644 /home/cercol/api/api/deploy/caddy/cercol-api.caddy /etc/caddy/conf.d/cercol-api.caddy
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl reload caddy
curl -fsS https://api.cercol.team/blog | head -c 200
```

### Prerequisite — topquaranta must import the conf.d directory

This snippet only takes effect because topquaranta's `deploy/Caddyfile`
ends with:

```caddyfile
import /etc/caddy/conf.d/*.caddy
```

If a future topquaranta deploy drops that line, every cercol deploy
will install the snippet successfully but `api.cercol.team` will
still return TLS internal alerts. The smoke test in step 5 of the
deploy flow is the canary for that regression.
