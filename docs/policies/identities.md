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

Current state: `hello@cercol.team` exists as a mail alias but does
NOT have a Google Workspace account. OAuth flows against Google APIs
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
| Google OAuth (Cèrcol sign-in) | Miquel personal | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `/home/cercol/.env` | When the Workspace migration happens |
| Resend API key | Miquel personal | `RESEND_API_KEY` in `/home/cercol/.env` | TODO document at runbook |
| Stripe (test mode) | Miquel personal | `STRIPE_SECRET_KEY` in `/home/cercol/.env` | When moving to live mode |
| Porkbun DNS API | Miquel personal | `PORKBUN_API_KEY` / `PORKBUN_SECRET_KEY` in `/home/cercol/.env` | TODO document at runbook |
| Hetzner SSH (cercol deploy) | Project keypair | `HETZNER_SSH_KEY` GitHub Actions secret | When key compromised |

The runbook (`docs/ops/runbook.md`, created in FASE F) is the live
source of truth; this table is a snapshot at the time of this
policy's creation.

## Backlog

Phase 17.7 (planned, not started): migrate every token currently
owned by Miquel's personal Google account to `hello@cercol.team`
once the Workspace tenant is provisioned. Tracked in `ROADMAP.md`.
