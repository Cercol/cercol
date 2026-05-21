# ADR 0002: Railway to Hetzner systemd

- **Number**: 0002
- **Title**: Move backend hosting from Railway to Hetzner systemd
- **Status**: Accepted
- **Date**: 2026-05-04

## Context

The backend originally ran on Railway, billed per process-hour with
a small idle base. The product traffic profile is bursty (the
prerender pipeline pulls 624 blog routes in one shot every deploy;
the rest of the day is low volume), so Railway's pricing model was
about 5 times more expensive than what a single Hetzner CX22 costs
per month.

Independently, the team also wanted full control of the Caddy
configuration to host multiple subdomains and to set up email
infrastructure (Resend webhooks, Stalwart relay) without relying on
Railway's networking primitives.

## Decision

Move the backend to a single Hetzner CX22 VPS at `188.245.60.20`,
run uvicorn under systemd as the `cercol-api.service` unit, and
reverse-proxy through Caddy with automatic Let's Encrypt
certificates. Run PostgreSQL on the same host. Frontend stays on
GitHub Pages (free).

The same VPS hosts the topquaranta project under a separate Linux
user and a separate set of Caddy site blocks (see ADR 0004 for the
multi-tenant boundary that became necessary after this decision).

## Alternatives considered

- **Stay on Railway**. Rejected: cost mismatch with the traffic
  profile.
- **Fly.io**. Rejected: similar pricing model to Railway and no
  obvious advantage; would have required the same migration cost.
- **Managed Kubernetes (GKE / EKS / Hetzner Cloud Kubernetes)**.
  Rejected: massive overkill for a single-process backend.

## Consequences

- Operator owns SSL renewal indirectly via Caddy's ACME automation.
- Secrets live in `/home/cercol/.env`. No managed secret store;
  rotation is manual (see `docs/policies/identities.md`).
- Single point of failure for both Cèrcol and topquaranta (one
  VPS). Trade-off accepted; backups address data loss but not
  availability.
- Multi-tenant Caddy on the same VPS introduced the ownership
  boundary problem later (see ADR 0004 and two post-mortems).

## Related

- Commit: `e37e9ac ci: add backend auto-deploy action + fix requirements.txt`.
- ADR 0004 for the multi-tenant Caddy fallout.
- `docs/post-mortems/2026-04-16-caddy-30day-silent-outage.md` and
  `docs/post-mortems/2026-05-17-caddy-outage-recurrence.md`.
