# Auth architecture

Self-hosted, JWT HS256, two sign-in methods: magic link and Google
OAuth. Password sign-in was retired on 2026-08-17 with the move to
Cloudflare Workers. The surface lives in `worker/src/auth.js` (about
370 LOC) with the token primitives in `worker/src/jwt.js`; the
decision behind the design is recorded in
`docs/decisions/0003-jwt-hs256-self-hosted.md`, and the FastAPI
implementation it mirrors (`api/auth.py`) stays as the origin fallback
until decommission.

## JWT scheme

- Algorithm: HS256, WebCrypto HMAC (`worker/src/jwt.js`).
- Secret: `JWT_SECRET`, a Worker secret. The same value is in the
  legacy `/home/cercol/.env`, so a token minted on either side
  validates on the other; that is what let sessions survive the
  cutover in both directions.
- Claims: `sub` (user id), `email`, `aud` = `"authenticated"`, `iat`,
  `exp`. `is_admin` is not in the token; admin routes look it up in
  `profiles` on every call.
- Access token lifetime: 1 hour.
- Refresh token lifetime: 30 days, a random 48-byte URL-safe string
  stored in the `refresh_tokens` table in D1.
- Storage in the browser: access token in a JS module variable (not
  localStorage); refresh token in localStorage as `cercol_rt`.
- Verification rejects a wrong signature, any `alg` other than HS256,
  a wrong audience and an expired `exp`, in that order, and returns
  the payload otherwise. `requireUser(env, request)` wraps it and
  returns either the payload or a 401 `Response`.

## Sign-in methods

### Magic link

1. `POST /auth/magic-link/request` with `{ email }`. Always 202,
   never reveals whether the account exists.
2. The Worker stores a random token in `magic_tokens` with a 15
   minute `expires_at` and emails
   `https://cercol.team/auth/callback?type=magic&token=...` through
   Resend, in the profile's language if there is one.
3. The SPA posts the token to `POST /auth/magic-link/verify`.
4. The Worker marks the token used, runs `findOrCreateUser`, issues an
   access token and a refresh token.

Tokens are single-use; reuse or expiry returns 401.

### Google OAuth

- `GET /auth/google` stores a CSRF state in `oauth_states` (10 minute
  TTL, expired rows swept on each call) and redirects to Google's
  authorize URL with `openid email profile` and `prompt=select_account`.
- `GET /auth/google/callback` checks and deletes the state, exchanges
  the code for a token and fetches userinfo (two plain `fetch` calls,
  no SDK), runs `findOrCreateUser` keyed by Google id with the email as
  the fallback match, then redirects to
  `https://cercol.team/auth/callback?access_token=...&refresh_token=...`.
  Failures redirect to `/auth?error=<reason>`.
- One web OAuth client. Redirect URI is
  `BACKEND_URL/auth/google/callback` (`https://api.cercol.team/...`).

### Password (retired)

`POST /auth/password/signup`, `POST /auth/password/signin` and
`POST /me/password` answer `410 Gone` from the Worker
(`passwordGone` in `auth.js`). bcrypt does not fit the 10 ms CPU
budget of a free-plan invocation, PBKDF2 at 20 to 80k iterations
would be a step down from what OWASP asks for, and only 8 of 16
accounts had ever set a password. Magic link and Google cover every
existing account, and the 410 gives the frontend a clean signal
rather than a half-working proxy. `POST /auth/verify-email` and the
unverified-signup path went with it: both remaining methods prove
ownership of the address by construction.

## findOrCreateUser

Both methods converge on one function (`api/auth.py:_find_or_create_user`
in the legacy backend). It finds the `auth_users` row by `google_id`,
then by email (linking the Google id to an existing email account),
or creates one; then in one `batch`: sets `email_verified = 1`,
upserts `profiles` without clobbering an edited name, links pending
`group_members` invitations addressed to that email, and stamps
`last_sign_in_at`. Every write downstream uses the account's stored
email, never the incoming one, which matters after an email change
(below).

## Refresh token rotation

- `POST /auth/refresh` with `{ refresh_token }`: the row must exist,
  not be revoked and not be expired, or 401. It is then marked
  `revoked_at` and a fresh pair is issued.
- `POST /auth/signout` marks the presented token revoked; 204 either
  way.
- Presenting an already-revoked token is a plain 401; the Worker does
  not revoke sibling tokens on reuse (the FastAPI never did either).
  Every session of a user is revoked in one place only: the email
  change confirmation.
- The `purge-tokens` job (04:00 UTC daily, `worker/src/scheduled.js`)
  deletes refresh tokens seven days after revocation or expiry, and
  used or expired rows from `magic_tokens`, `email_change_tokens` and
  `oauth_states` after one day, plus events older than 120 days.
  `POST /admin/maintenance/purge-tokens` runs the same purge on
  demand.

## Changing the account email

`POST /auth/email/change-request` (authenticated) and
`POST /auth/email/change-confirm` (token). `email_change_tokens` is a
table of its own rather than a `purpose` column on `magic_tokens`, so
an email-change token can never be replayed against
`/auth/magic-link/verify`.

The address moves only when the **new** address opens a one-time link
valid for 15 minutes (`/auth/callback?type=email-change&token=...`).
Nothing is written to `auth_users` before that click. Without
passwords there is no "re-enter it" branch: the two emails are the
safeguard. The current address always receives a heads-up naming the
requested new address; it carries no button, so the inbox being left
behind can never complete the change. The request refuses the current
address (400) and an address already registered (409); the confirm
step re-checks the 409 at click time.

Confirming, in one batch: marks the token used, updates
`auth_users.email` (and `email_verified = 1`), updates
`profiles.email`, links any `group_members` invitations already
waiting on the new address, revokes **every** refresh token for the
user, then issues a fresh pair to whoever proved ownership. The old
inbox does not keep control of the account, and the link works in any
browser.

A changed address outranks the OAuth provider. Google keeps asserting
whatever address the account signed up with, so `findOrCreateUser`
keys every write off the account's stored email. Without that the next
Google sign-in would reset `profiles.email` to the Google address
while `auth_users.email` kept the new one, with the JWT and login on
the new address and group invitations and digest mail on the old.

## Email verification and the beta/premium grant

The "first 500 free Full Moon" grant in `ensureProfile`
(`worker/src/db.js`, `BETA_TOTAL`) needs a free slot, a row that is
neither premium nor beta, and `auth_users.email_verified = 1`. Both
sign-in methods set it, so a new account gets the grant on its first
`/me/profile` call. The gate lives in the grant SQL itself, so every
caller of `ensureProfile` inherits it; it never revokes an existing
grant or a paid premium, and it fires on the UPDATE branch too because
the sign-in path creates the row before the profile call.

## Full Moon premium enforcement (server-side)

Premium is enforced on the server-dependent Full Moon surfaces (ADR
0018) while client-side scoring stays untouched. The check authorises
`premium = 1 OR is_beta = 1`.

- `requirePremium` in `worker/src/witness.js` (401 without a valid
  bearer, 403 when not entitled) gates `POST /witness/sessions`,
  `GET /witness/my-sessions` and `GET /groups/<id>/report-data` (the
  last on top of its active-membership check).
- `POST /results` (`worker/src/writes.js`) gates inside the `fullMoon`
  branch only, so free instruments and anonymous posts stay open and
  no ungated Full Moon row can be written.
- Left open by design: the public witness submission
  (`/witness/session/<token>` and `.../complete`),
  `/witness/my-contributions`, `/me/results` and `POST /groups`.

## Admin bootstrap

`profiles.is_admin` is the gate; `requireAdmin` in
`worker/src/admin.js` is the bearer check plus that lookup, 401 then
403. The first admin is promoted by SQL against D1:

```
npx wrangler d1 execute cercol --remote --config worker/wrangler.jsonc \
  --command "UPDATE profiles SET is_admin = 1 WHERE email = 'operator@example.com'"
```

There is no in-app UI to promote admins; that is a deliberate
constraint (ADR 0003). An admin JWT for scripts comes from the magic
link flow with curl (see `docs/ops/runbook.md`).

## Tables (D1, `worker/schema/002_core.sql`)

`auth_users` (id, email, google_id, email_verified, created_at,
last_sign_in_at), `profiles` (the product-facing row keyed by the same
id), `refresh_tokens` (token, user_id, expires_at, revoked_at),
`magic_tokens` (email, token, expires_at, used_at), `oauth_states`
(state, expires_at), `email_change_tokens` (user_id, new_email, token,
expires_at, used_at). Timestamps are ISO strings, booleans 0/1.

## Secrets and identities

Every credential used by this layer is a Worker secret on `cercol-api`
and is documented in `docs/policies/identities.md`:

- `JWT_SECRET`.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (Miquel personal,
  until the Workspace migration).
- `RESEND_API_KEY` (Miquel personal, until the Workspace migration).

Rotation procedures live in `docs/ops/runbook.md`.

# Spec: docs/architecture/auth.md
