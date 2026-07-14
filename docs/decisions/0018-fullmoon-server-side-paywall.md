# ADR 0018: Server-side enforcement of the Full Moon paywall

Status: Accepted
Date: 2026-07-14
Deciders: Miquel

## Context

The Full Moon paywall was enforced only in the frontend (`FullMoonPage.jsx`,
`gateState` keyed on `profile.premium`). A read-only investigation on
2026-07-13/14 mapped the server-side enforcement of every premium-value surface
and found them all open: `POST /results` accepted `instrument=fullMoon` from any
caller — including anonymous — with no premium check, and the witness and team
surfaces were gated only on authentication/membership, never on premium.

Cèrcol scores all instruments client-side by design — a documented product value
and privacy promise ("no data sent to the server during assessment"). Full Moon
items ship in the JS bundle and the report renders client-side. A server-side
gate therefore cannot stop a technical user from taking the client-bundled test
and viewing their own one-off report; moving scoring server-side would break the
privacy promise. The gateable value is the part that is **server-dependent**:
persisting/serving account-linked Full Moon data, witness aggregation, and team
reports.

## Decision

Option A: enforce premium server-side on the server-dependent Full Moon value
surfaces; leave client-side scoring and the anonymous one-off self-report render
untouched. The check authorizes `premium = TRUE OR is_beta = TRUE`, so the
"first 500 free Full Moon" promo accounts keep access while the promotion is
live. Implemented as a reusable `require_premium` dependency in `api/deps.py`
(mirroring `require_admin`: 401 without `sub`, 403 when not entitled), plus one
inline check inside the `POST /results` fullMoon branch.

### Enforcement map

Gated (premium OR is_beta):

| Surface | Where | How |
|---|---|---|
| `POST /witness/sessions` | create a witness campaign | `Depends(require_premium)` |
| `GET /witness/my-sessions` | serve averaged witness results | `Depends(require_premium)` |
| `GET /groups/{id}/report-data` | Last Quarter team report | `Depends(require_premium)`, on top of the existing active-membership 403 |
| `POST /results` (`instrument == fullMoon` only) | persist a Full Moon result | inline `premium OR is_beta` check; anonymous/non-entitled → 403 |

Deliberate non-targets (left open — gating them would break legitimate flows):

| Surface | Why left open |
|---|---|
| `POST /results` for `newMoon` / `firstQuarter` (incl. anonymous) | free instruments; the fullMoon gate is scoped to that branch only |
| `GET /witness/session/{token}`, `POST /witness/session/{token}/complete` | the third-party witness submits via a public link and does not pay |
| `GET /witness/my-contributions` | a user viewing what they contributed as a witness; not Full Moon value |
| `GET /me/results`, `DELETE /me/results/{id}` | act on the user's own rows incl. free instruments; gating persistence in `POST /results` already prevents non-entitled fullMoon rows from existing |
| `POST /groups` | creating a group is harmless without the (now gated) report |

## Consequences

- The server-dependent Full Moon surfaces are enforced server-side; an
  anonymous or non-entitled caller can no longer persist a Full Moon result,
  create a witness campaign, pull averaged witness results, or pull a team
  report.
- Client-side scoring and the anonymous one-off self-report render stay open by
  design — the privacy promise is preserved and can be reaffirmed explicitly.
- `is_beta` is accepted alongside `premium`, so no promo account is broken while
  the "first 500 free" promotion is live. When Full Moon is charged for again,
  no code change is required — paid `premium` accounts already pass.
- No database migration: this is handler logic only.
