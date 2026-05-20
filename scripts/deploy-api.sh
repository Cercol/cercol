#!/usr/bin/env bash
# Deploy Cercol API to Hetzner.
# Usage: ./scripts/deploy-api.sh
# Requires SSH access to 188.245.60.20.
#
# Mirrors .github/workflows/deploy-backend.yml so manual and automated
# deploys converge on the same end state.

set -euo pipefail

SERVER="188.245.60.20"
APP_DIR="/home/cercol/api"
SERVICE="cercol-api"

echo "→ Pulling latest code..."
ssh root@$SERVER "cd $APP_DIR && git pull origin main"

echo "→ Installing dependencies..."
ssh root@$SERVER "$APP_DIR/api/.venv/bin/pip install --quiet -r $APP_DIR/api/requirements.txt"

echo "→ Syncing Caddy snippet..."
# Idempotent install with validate-then-rollback. Mirrors the workflow.
ssh root@$SERVER "set -e
cd $APP_DIR
mkdir -p /etc/caddy/conf.d
if ! cmp -s api/deploy/caddy/cercol-api.caddy /etc/caddy/conf.d/cercol-api.caddy 2>/dev/null; then
    install -m 0644 api/deploy/caddy/cercol-api.caddy /etc/caddy/conf.d/cercol-api.caddy
    if ! caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile; then
        echo 'Caddy validation failed, rolling back snippet' >&2
        rm -f /etc/caddy/conf.d/cercol-api.caddy
        exit 1
    fi
    systemctl reload caddy
fi"

echo "→ Restarting service..."
ssh root@$SERVER "systemctl restart $SERVICE"

echo "→ Verifying..."
sleep 2
ssh root@$SERVER "systemctl is-active $SERVICE"

echo "→ External smoke test..."
for i in 1 2 3 4 5; do
    if curl -fsS -o /dev/null https://api.cercol.team/blog; then
        echo "✓ API deployed successfully — https://api.cercol.team"
        exit 0
    fi
    sleep 2
done
echo "External smoke test failed: https://api.cercol.team/blog unreachable" >&2
exit 1
