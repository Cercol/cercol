# Identities

Separation between human identities and service identities. Every
external integration (OAuth, API token, refresh token) is owned by a
named account. Future maintainers should be able to answer "whose
credentials are these?" in one lookup.

## Rules

### Rule 1: service integrations use a dedicated identity

External APIs that Cèrcol calls on behalf of itself, not on behalf
of an end user, must authenticate as a single dedicated identity:
`hello@cercol.team`.

Current state: `hello@cercol.team` is a real mailbox on Purelymail
(since 2026-08-18, ADR 0020) but does NOT have a Google Workspace account. OAuth flows against Google APIs
(Search Console, BigQuery, etc.) cannot use this alias until a
Google account is created and associated with it. Until that
migration is done, tokens against Google APIs are issued from
Miquel's personal Google account; this is documented per-token in
`docs/ops/runbook.md`.

When the Workspace migration happens (Phase 17.7 in the roadmap),
every token currently held by a personal account rotates to
`hello@cercol.team`.

### Rule 2: every token is documented

For each long-lived credential the project depends on, the runbook
must record:

- Purpose (which feature it enables).
- Owner account (which email holds it).
- Storage location (env var name on the server, GitHub Actions
  secret, etc.).
- Rotation policy (when, and what triggers it).

A token without all four entries in the runbook is considered
unowned and is a finding in any audit.

### Rule 3: end-to-end smoke tests against real APIs use a QA account

Smoke tests that exercise real third-party APIs (not mocks) must use
a dedicated identity, never a real user account. For Cèrcol the
account is `qa_smoke@cercol.team`, with a fictional profile created
explicitly for that purpose.

Current state: the account does not exist yet. It is a backlog item
for the time we introduce real E2E smoke tests; today's tests are
either unit tests with mocks or the deploy-time external probe of
`/blog`, which does not require auth.

## Current ownership

| Token / credential | Owner account | Storage | Rotation |
|---|---|---|---|
| Cloudflare account "cercol" (id `04bf08778ace2b87b910fb5ca0be3feb`): zone, Workers, D1, KV | Miquel personal | Console login; `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` GitHub Actions secrets for deploys | When token compromised; scoped tokens are created per task and revoked after |
| Worker secrets on `cercol-api` (names only): `BING_WMT_API_KEY`, `CF_ACCOUNT_ID`, `CF_ANALYTICS_TOKEN`, `CF_ZONE_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_SA_JSON`, `JWT_SECRET`, `MCP_API_KEY`, `PAGESPEED_API_KEY`, `PURELYMAIL_API_KEY`, `RESEND_API_KEY`, `STRIPE_PRICE_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `WRITES_LIVE` | Miquel personal (each upstream account) | `wrangler secret put` on the Worker; never in the repo | Per upstream vendor; see runbook |
| Google OAuth (Cèrcol sign-in) | Miquel personal | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` Worker secrets | When the Workspace migration happens |
| Google service account (BigQuery, PageSpeed) | Miquel personal (GCP project `cercol`) | `GOOGLE_SA_JSON`, `PAGESPEED_API_KEY` Worker secrets; the PageSpeed key is still IP-restricted to Hetzner in Google Cloud | When the Workspace migration happens |
| Resend API key | Miquel personal | `RESEND_API_KEY` Worker secret | TODO document at runbook |
| Purelymail (mailboxes hello@, miquel@, admin@; also topquaranta.cat) | Miquel personal | Console login; `PURELYMAIL_API_KEY` Worker secret | TODO document at runbook |
| Stripe (test mode) | Miquel personal | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_ID` Worker secrets | When moving to live mode |
| Hetzner SSH (legacy origin fallback, until decommission) | Project keypair | `HETZNER_SSH_KEY` GitHub Actions secret; `/home/cercol/.env` on the box still holds the pre-migration copies of the secrets above | Retire with `scripts/decommission-hetzner.sh` |

Retired: Porkbun DNS API (`PORKBUN_API_KEY` / `PORKBUN_SECRET_KEY`), DNS
moved to Cloudflare on 2026-08-17; Stalwart mail server, retired
2026-08-18; password sign-in (no bcrypt hashes are written any more).

The runbook (`docs/ops/runbook.md`, created in FASE F) is the live
source of truth; this table is a snapshot at the time of this
policy's creation.

## Backlog

Phase 17.7 (planned, not started): migrate every token currently
owned by Miquel's personal Google account to `hello@cercol.team`
once the Workspace tenant is provisioned. Tracked in `ROADMAP.md`.
