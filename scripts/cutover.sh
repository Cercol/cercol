#!/usr/bin/env bash
# The Hetzner -> Cloudflare cutover, in one run from the operator's machine.
#
# # Spec: docs/architecture/seo-pipeline.md
#
# What it does, in order, stopping at the first failure:
#   1. Copies the runtime secrets from /home/cercol/.env into the Worker
#      (JWT, Resend, Google, Stripe). Values travel ssh -> wrangler; nothing
#      is printed and nothing lands in a file.
#   2. Exports every core table from Postgres and loads it into D1, then
#      compares row counts table by table.
#   3. Flips WRITES_LIVE=1 on the Worker. From this second the Worker owns
#      every endpoint and Hetzner receives no traffic.
#   4. Runs scripts/diff-api.mjs and a smoke test.
#
# Rollback at any point: `npx wrangler secret put WRITES_LIVE` with "0", or
# turn api.cercol.team's DNS record grey in Cloudflare. Hetzner is untouched
# by this script and keeps serving the moment traffic returns to it.
#
# Why this is a script the operator runs and not something the assistant
# did: step 1 moves secrets from one system to another. That is a decision
# for the account holder, and it is the only step here that is.

set -euo pipefail
cd "$(dirname "$0")/.."

export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-$(cat ~/.cercol-migration/cf-token)}"
export CLOUDFLARE_ACCOUNT_ID=04bf08778ace2b87b910fb5ca0be3feb
SERVER=root@188.245.60.20
D1=928ddbd6-5fc6-4e2b-9fd1-e7de66435ef6
W=worker

step() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

step "1/4 secrets -> Worker"
ssh "$SERVER" 'grep -E "^(JWT_SECRET|RESEND_API_KEY|GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|STRIPE_PRICE_ID)=" /home/cercol/.env' \
  | while IFS='=' read -r k v; do
      printf '%s' "$v" | (cd $W && npx wrangler secret put "$k" >/dev/null) && echo "  $k"
    done

step "2/4 Postgres -> D1"
# Export on the server (same query the earlier probe used), pull it here,
# load through the D1 HTTP API in batches of 100 statements.
ssh "$SERVER" 'cd /tmp && sudo -u postgres psql cercol -A -t -f -' <<'SQL' > /tmp/cercol_core_export.json
SELECT json_build_object(
 'auth_users', (SELECT coalesce(json_agg(row_to_json(t)),'[]') FROM (SELECT id::text, email, google_id, to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') created_at, to_char(last_sign_in_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') last_sign_in_at, email_verified FROM auth_users) t),
 'profiles', (SELECT coalesce(json_agg(row_to_json(t)),'[]') FROM (SELECT id::text, to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') created_at, to_char(updated_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') updated_at, premium, first_name, last_name, country, native_language, email, is_admin, onboarding_seen, is_beta FROM profiles) t),
 'refresh_tokens', (SELECT coalesce(json_agg(row_to_json(t)),'[]') FROM (SELECT id::text, user_id::text, token, to_char(expires_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') expires_at, to_char(revoked_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') revoked_at, to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') created_at FROM refresh_tokens WHERE revoked_at IS NULL AND expires_at > now()) t),
 'results', (SELECT coalesce(json_agg(row_to_json(t)),'[]') FROM (SELECT id::text, to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') created_at, language, instrument, presence, bond, discipline, depth, vision, user_id::text, facets, anon_id, utm_source, utm_medium, utm_campaign, referrer, is_seed, accuracy_rating, to_char(accuracy_rated_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') accuracy_rated_at FROM results) t),
 'groups', (SELECT coalesce(json_agg(row_to_json(t)),'[]') FROM (SELECT id::text, name, created_by::text, to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') created_at, to_char(nudged_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') nudged_at, is_seed FROM groups) t),
 'group_members', (SELECT coalesce(json_agg(row_to_json(t)),'[]') FROM (SELECT group_id::text, user_id::text, status, invited_email, to_char(invited_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') invited_at, to_char(joined_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') joined_at FROM group_members) t),
 'witness_sessions', (SELECT coalesce(json_agg(row_to_json(t)),'[]') FROM (SELECT id::text, subject_id::text, token, witness_name, witness_email, witness_user_id::text, subject_display, to_char(completed_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') completed_at, to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') created_at, is_seed FROM witness_sessions) t),
 'witness_responses', (SELECT coalesce(json_agg(row_to_json(t)),'[]') FROM (SELECT id::text, session_id::text, domain_scores, to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') created_at FROM witness_responses) t),
 'events', (SELECT coalesce(json_agg(row_to_json(t)),'[]') FROM (SELECT id::text, name, slug, instrument, lang, path, anon_id, to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"') created_at FROM events) t),
 'blog_view_counts', (SELECT coalesce(json_agg(row_to_json(t)),'[]') FROM (SELECT slug, view_count FROM blog_posts) t)
)::text
SQL
python3 - <<'PY'
import json, os, urllib.request
tok = os.environ["CLOUDFLARE_API_TOKEN"]; ACC = os.environ["CLOUDFLARE_ACCOUNT_ID"]
DB = "928ddbd6-5fc6-4e2b-9fd1-e7de66435ef6"
data = json.load(open("/tmp/cercol_core_export.json"))
def q(v):
    if v is None: return "NULL"
    if isinstance(v, bool): return "1" if v else "0"
    if isinstance(v, (int, float)): return repr(v)
    if isinstance(v, (dict, list)): v = json.dumps(v, ensure_ascii=False)
    return "'" + str(v).replace("'", "''") + "'"
def run(sql):
    req = urllib.request.Request(f"https://api.cloudflare.com/client/v4/accounts/{ACC}/d1/database/{DB}/query",
        data=json.dumps({"sql": sql}).encode(), method="POST",
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req))
    if not d.get("success"): raise SystemExit(f"D1 error: {d.get('errors')}")
    return d
order = ["auth_users","profiles","refresh_tokens","results","groups","group_members","witness_sessions","witness_responses","events"]
bad = 0
for table in order:
    rows = data[table]
    if rows:
        cols = list(rows[0].keys())
        stmts = [f"INSERT OR REPLACE INTO {table} ({','.join(cols)}) VALUES ({','.join(q(r[c]) for c in cols)});" for r in rows]
        for i in range(0, len(stmts), 100): run(" ".join(stmts[i:i+100]))
    n = run(f"SELECT COUNT(*) AS n FROM {table}")["result"][0]["results"][0]["n"]
    ok = n >= len(rows)
    bad += not ok
    print(f"  {table:20} pg={len(rows):5}  d1={n:5}  {'ok' if ok else 'MISMATCH'}")
# View counts: the one column that kept moving on Hetzner while D1 was seeded.
vc = data["blog_view_counts"]
for i in range(0, len(vc), 50):
    run(" ".join(f"UPDATE blog_posts SET view_count={int(r['view_count'])} WHERE slug={q(r['slug'])};" for r in vc[i:i+50]))
print(f"  {'blog view_count':20} {len(vc):5} resynced")
raise SystemExit(1 if bad else 0)
PY
rm -f /tmp/cercol_core_export.json

step "3/4 WRITES_LIVE=1"
printf '1' | (cd $W && npx wrangler secret put WRITES_LIVE >/dev/null) && echo "  gate open"

step "4/4 verify"
sleep 5
node scripts/diff-api.mjs --new https://api.cercol.team --old https://origin.cercol.team
for p in /beta /health /blog; do
  printf '  %-8s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' "https://api.cercol.team$p")"
done
echo
echo "Done. Hetzner is idle. To roll back: printf 0 | (cd worker && npx wrangler secret put WRITES_LIVE)"
