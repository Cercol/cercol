#!/usr/bin/env bash
# Nightly two-leg backup of the cercol PostgreSQL database.
# Spec: docs/decisions/0017-database-backups-two-leg.md
#
# Leg 1: pg_dump -Fc of the cercol database only, kept on-box under
#        /var/backups/cercol/ (7 most recent dumps).
# Leg 2: the same dump, gpg-encrypted (AES256, symmetric), pushed to
#        Google Drive via rclone (30-day retention on the remote).
#
# Runs as root from /etc/cron.d/cercol-db-backup (see that file for the
# one-time install steps). The dump itself runs as postgres via runuser
# (peer auth); root owns the passphrase file, the backup directory and
# the rclone config.
#
# Failure contract: exits non-zero on ANY failure, appends a
# "BACKUP FAILED" line to the log (the cron line redirects output to
# /home/cercol/logs/db-backup.log) and leaves a FAILED marker file that
# the next successful run removes. No silent deaths.

set -euo pipefail

BACKUP_DIR="/var/backups/cercol"
PASSPHRASE_FILE="/root/.cercol-backup-passphrase"
RCLONE_REMOTE="gdrive:cercol-db-backups"
LOCAL_KEEP=7
REMOTE_KEEP_DAYS=30
LOG_DIR="/home/cercol/logs"
FAIL_MARKER="$LOG_DIR/db-backup.FAILED"

ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

fail() {
    echo "$(ts) BACKUP FAILED: $1" >&2
    mkdir -p "$LOG_DIR"
    echo "$(ts) $1" > "$FAIL_MARKER"
    exit 1
}
trap 'fail "command on line $LINENO exited non-zero"' ERR

# postgres cannot read root's cwd; avoid the noisy "could not change
# directory" warning from runuser/pg_dump.
cd /

[ "$(id -u)" -eq 0 ] || fail "must run as root"
[ -r "$PASSPHRASE_FILE" ] || fail "passphrase file $PASSPHRASE_FILE missing or unreadable"
command -v rclone > /dev/null || fail "rclone not installed"
rclone listremotes | grep -q '^gdrive:$' || fail "rclone remote 'gdrive' not configured"

# Backup dir: root-owned, postgres can read (needed for the restore
# test in the runbook, which runs pg_restore as postgres).
install -d -m 0750 -o root -g postgres "$BACKUP_DIR"

stamp=$(date -u +%Y%m%dT%H%M%SZ)
dump="$BACKUP_DIR/cercol-$stamp.dump"

# Leg 1: local dump. -Fc is already zlib-compressed; no extra gzip.
runuser -u postgres -- pg_dump -Fc --dbname=cercol > "$dump"
chown root:postgres "$dump"
chmod 0640 "$dump"
[ -s "$dump" ] || fail "dump file is empty"

# Integrity check: a corrupt archive fails to list.
runuser -u postgres -- pg_restore --list "$dump" > /dev/null

# Local rotation: keep the LOCAL_KEEP most recent dumps. Filenames
# embed a UTC timestamp (cercol-YYYYMMDDTHHMMSSZ.dump), so reverse
# lexical order IS reverse chronological order.
shopt -s nullglob
printf '%s\n' "$BACKUP_DIR"/cercol-*.dump | sort -r | tail -n +$((LOCAL_KEEP + 1)) | xargs -r rm --
shopt -u nullglob

# Leg 2: encrypt and push off-box, then drop the local ciphertext.
gpg --batch --yes --pinentry-mode loopback \
    --symmetric --cipher-algo AES256 \
    --passphrase-file "$PASSPHRASE_FILE" \
    -o "$dump.gpg" "$dump"
rclone copy "$dump.gpg" "$RCLONE_REMOTE"
rclone delete --min-age "${REMOTE_KEEP_DAYS}d" "$RCLONE_REMOTE"
rm -f "$dump.gpg"

rm -f "$FAIL_MARKER"
echo "$(ts) BACKUP OK: $(basename "$dump") ($(du -h "$dump" | cut -f1)) local, encrypted copy pushed to $RCLONE_REMOTE"
