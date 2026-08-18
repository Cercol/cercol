#!/usr/bin/env bash
# Phase 10: switch Cèrcol off on the Hetzner box. Run from anywhere with ssh
# to root@188.245.60.20. Idempotent; every step checks before it acts.
#
# # Spec: docs/architecture/seo-pipeline.md
#
# Preconditions, all true as of 2026-08-17 evening and to be re-checked:
#   - api.cercol.team is the Worker with WRITES_LIVE=1 (every endpoint on D1)
#   - cercol.team and www resolve to the cercol-web Worker (frontend moved)
#   - all eight migrated crons are already disabled on the box
#   - the Postgres dump below has been taken and copied off the box
#
# What it does NOT do: drop the database. That is a separate, deliberate
# command at the very end, and only after the dump is verified. Nor does it
# touch anything belonging to topquaranta or llotja: only units, files and
# a Caddy snippet named cercol-*.
#
# Rollback: everything here is stop/disable/rename. `systemctl enable --now`
# and renaming the snippet back restores the box in a minute; the Worker's
# proxy still knows origin.cercol.team.

set -euo pipefail
S=root@188.245.60.20

echo "== 1/4 final Postgres dump (kept on the box; copy it somewhere else too)"
ssh "$S" 'sudo -u postgres pg_dump -Fc cercol > /home/cercol/cercol-final-$(date +%F).dump && ls -la /home/cercol/cercol-final-*.dump | tail -1'

echo "== 2/4 stop and disable the API and MCP services"
ssh "$S" 'for u in cercol-api cercol-mcp; do systemctl is-active --quiet $u && systemctl disable --now $u && echo "  $u stopped+disabled" || echo "  $u already inactive"; done'

echo "== 3/4 retire the Caddy site block (api.cercol.team, origin.cercol.team)"
ssh "$S" 'if [ -f /etc/caddy/conf.d/cercol-api.caddy ]; then mv /etc/caddy/conf.d/cercol-api.caddy /etc/caddy/conf.d/cercol-api.caddy.retired && caddy validate --config /etc/caddy/Caddyfile >/dev/null && systemctl reload caddy && echo "  snippet retired, caddy reloaded"; else echo "  snippet already retired"; fi'

echo "== 4/4 the remaining cron"
ssh "$S" 'ls /etc/cron.d/ | grep -E "^cercol-[a-z-]+$" || echo "  none"'
echo
echo "Done. Left on the box on purpose: the database (drop it yourself once the dump is safe:"
echo "  ssh $S \"sudo -u postgres dropdb cercol\""
echo "), and the code under /home/cercol (harmless)."
