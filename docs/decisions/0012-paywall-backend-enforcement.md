# ADR 0012: enforce the premium paywall server-side with a require_premium dependency

- **Number**: 0012
- **Title**: enforce the premium paywall server-side with a require_premium dependency
- **Status**: Proposed
- **Date**: 2026-06-04

## Context

The Full Moon paywall is **frontend-only**. `src/pages/FullMoonPage.jsx` runs a
gate state machine (`checking → paywall → processing → completed → ready`,
lines 56-61) that shows a Stripe CTA unless `profile.premium` is true. Nothing on
the server enforces premium: the gated-data endpoints are reachable by any
authenticated user.

Premium is determined by a single `premium` boolean column on `profiles`. It is
set in two places:

- **Beta auto-grant** (`api/main.py:344-377`): on profile creation, `premium` and
  `is_beta` are both set to `(SELECT COUNT(*) < BETA_TOTAL FROM profiles WHERE
  is_beta = TRUE)` with `BETA_TOTAL = 500` (`api/main.py:344`). So the first ~500
  users are silently granted premium for free.
- **Stripe webhook** (`api/main.py:674,690`): on `checkout.session.completed`,
  `UPDATE profiles SET premium = true`. Checkout is created at `/checkout`
  (`api/main.py:658`) from `STRIPE_PRICE_ID` (a single line item — apparent
  one-time payment, consistent with PRODUCT.md; to be confirmed). Stripe env
  reads: `STRIPE_PRICE_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  (`api/main.py:281,282,294`).

The only server-side authorization that exists is `require_admin` in
`api/deps.py` (#48): `(request, user=Depends(get_current_user)) → SELECT is_admin
FROM profiles WHERE id = $1 → 403 if not admin`. No endpoint uses a premium check.

### Endpoints that return gated data, unprotected server-side today

| Endpoint | file:line | Exposes | Premium-checked server-side? |
|----------|-----------|---------|------------------------------|
| `POST /results` | `api/main.py:624` | stores a result (incl. Full Moon, with facets) | no |
| `GET /me/results` | `api/main.py:572` | the user's results incl. Full Moon report data | no |
| `POST /witness/sessions` | `api/main.py:701` | create a Witness assessment session | no |
| `GET /witness/my-sessions` | `api/main.py:845` | the subject's Witness sessions | no |
| `GET /witness/my-contributions` | `api/main.py:876` | the user's Witness contributions | no |
| `POST /groups` | `api/main.py:903` | group creation (Last Quarter) | no |
| `GET /groups/{id}/report-data` | `api/main.py:1101` | team report data | no |

(There is no PDF-export endpoint in the backend today; export is client-side.)

So "Full Moon is paid" is true only in the UI. A non-premium user can drive these
endpoints directly. The gate is cosmetic until the server enforces it.

## Decision

Add a **`require_premium`** FastAPI dependency in `api/deps.py`, mirroring
`require_admin` exactly but reading the `premium` column:

```python
async def require_premium(request: Request, user: dict = Depends(get_current_user)) -> dict:
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    async with request.app.state.pool.acquire() as conn:
        row = await conn.fetchrow("SELECT premium FROM profiles WHERE id = $1", user_id)
    if not row or not row["premium"]:
        raise HTTPException(status_code=402, detail="Payment required")  # or 403 — to confirm
    return user
```

Apply it as `Depends(require_premium)` to the confirmed gated endpoint set so the
server, not just the UI, refuses non-premium access. Premium is read from the
existing `premium` column — no schema change.

**Recommended gated set** (the operator confirms the final list — see Open
questions): the Full Moon write/read path (`POST /results` when the result is a
Full Moon, `GET /me/results` for Full Moon report data), the Witness creation path
(`POST /witness/sessions`), and group creation (`POST /groups`). Endpoints a
Witness assessor hits via a per-token link (`GET /witness/session/{token}`,
`POST /witness/session/{token}/complete`) must stay open — the assessor is not the
paying user.

This ADR decides the *mechanism and that enforcement belongs server-side*. It does
not implement it; the dependency and its application are a follow-up, gated on the
Open questions being answered.

## Alternatives considered

- **Keep the frontend-only gate.** Rejected: it is trivially bypassable by calling
  the API directly; it is not a real paywall, only a UI affordance.
- **A per-endpoint inline premium check** (no shared dependency). Rejected: it
  re-introduces the exact duplication ADR 0011/#48 removed for `require_admin`; a
  shared dependency is the established pattern.
- **A new `premium_features` table / entitlements system.** Rejected as premature:
  there is one boolean tier today. A column-backed dependency matches the current
  model; an entitlements table is a later step if tiers multiply.

## Consequences

- Gated endpoints return a clear `402`/`403` to non-premium callers; the paywall
  becomes real, not cosmetic.
- The dependency reads `premium` per request (one indexed PK lookup), same cost as
  `require_admin` — negligible.
- **Interaction with the beta grant:** because the first ~500 users were
  auto-granted `premium = true`, enabling enforcement changes nothing for them —
  they pass. Enforcement only starts biting once the beta window closes or the
  grant is revoked (see Open questions).
- Every gated endpoint must be tested for both the premium-pass and
  non-premium-block paths before this ships.

## Open questions for sign-off (do NOT decide here)

1. **Exact gated endpoint set** — which of the endpoints above (and any others)
   are premium-only vs free. The "recommended set" above is a starting point, not
   a decision.
2. **The first-~500 beta grant** — does it stay as-is, sunset on a date, or
   grandfather existing beta users while new users must pay?
3. **Already-granted beta users** — keep their `premium = true` indefinitely, or
   migrate/expire them when enforcement turns on?
4. **Payment model** — confirm one-time payment (single `STRIPE_PRICE_ID`) vs a
   future subscription, since that changes what "premium" should mean over time.
5. **Status code** — `402 Payment Required` (semantically precise) vs `403
   Forbidden` (consistent with `require_admin`).

## Related

- `api/deps.py` `require_admin` (the pattern to mirror; ADR 0011 / #48).
- `api/main.py:344-377` (beta auto-grant), `:658` (/checkout), `:674-690`
  (Stripe webhook → premium).
- `src/pages/FullMoonPage.jsx` (the frontend-only gate this would back).
- PRODUCT.md (freemium model: Full Moon is the paid tier).
