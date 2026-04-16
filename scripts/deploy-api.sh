#!/usr/bin/env bash
# Deploy Cercol API to Hetzner.
# Usage: ./scripts/deploy-api.sh
# Requires SSH access to 188.245.60.20.

set -euo pipefail

SERVER="188.245.60.20"
APP_DIR="/home/cercol/api"
SERVICE="cercol-api"

echo "→ Pulling latest code..."
ssh root@$SERVER "cd $APP_DIR && git pull origin main"

echo "→ Installing dependencies..."
ssh root@$SERVER "$APP_DIR/api/.venv/bin/pip install --quiet -r $APP_DIR/api/requirements.txt"

echo "→ Restarting service..."
ssh root@$SERVER "systemctl restart $SERVICE"

echo "→ Verifying..."
sleep 2
ssh root@$SERVER "systemctl is-active $SERVICE"

echo "✓ API deployed successfully — https://api.cercol.team"
