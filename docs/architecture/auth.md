# Auth architecture

Self-hosted, JWT HS256, three sign-in methods. The full surface
lives in `api/auth.py` (about 550 LOC). The architectural decision
behind this design is recorded in
`docs/decisions/0003-jwt-hs256-self-hosted.md`.

## JWT scheme

- Algorithm: HS256.
- Secret: `JWT_SECRET` env var, minimum 32 bytes. The backend
  fails fast at startup if missing or too short (`api/auth.py`
  lines 44 to 54).
- Claims: `sub` (user id), `iat`, `exp`, `is_admin`,
  `audience`.
- Access token lifetime: short (about 15 minutes).
- Storage: access token in a JS module variable in the browser
  (not localStorage); refresh token in localStorage as
  `cercol_rt`.

## Sign-in methods

### Magic link

1. User submits email.
2. Backend generates a random token, stores it in `magic_tokens`
   with `expires_at` (15 minutes), sends email via Resend.
3. User clicks the link.
4. Backend verifies the token, marks it consumed, issues
   access + refresh tokens.

Tokens are single-use; reuse returns 401.

### Password

- bcrypt direct (no passlib wrapper).
- Signup creates a `profiles` row with the bcrypt hash.
- Signin verifies and issues tokens.
- Signup creates the account **unverified** (`auth_users.email_verified = FALSE`)
  and issues tokens (the account is immediately usable — the free instruments
  need no account at all). A verification email is sent via Resend, reusing the
  one-time `magic_tokens` table. Clicking it hits `POST /auth/verify-email`,
  which consumes the token, sets `email_verified = TRUE`, and re-runs
  `ensure_profile`. Rate-limited `5/minute` (signup) and `10/minute` (verify).

## Email verification and the beta/premium grant

The "first 500 free Full Moon" grant in `ensure_profile` (`api/main.py`) is gated
on `auth_users.email_verified` (migration `032`). An account only claims a
beta/premium slot once its email is verified, which closes disposable-email
slot-farming on the unverified password-signup path.

- Magic link and Google OAuth prove ownership by construction: both route
  through `_find_or_create_user`, which sets `email_verified = TRUE`, so they get
  the grant on their first `/me/profile` call as before.
- Password accounts start `FALSE` and become eligible only after
  `POST /auth/verify-email`.
- The gate lives in the grant SQL itself (`_EMAIL_VERIFIED_SQL`), so every caller
  of `ensure_profile` inherits it; it never revokes an existing grant or a paid
  premium (the grant still ORs with the current value). Accounts predating the
  migration were backfilled `TRUE` (no revocation).

### Google OAuth

- Direct OAuth 2.0 flow (no Supabase middle layer).
- Authorize endpoint: returns Google's authorize URL.
- Callback endpoint: exchanges the code, fetches the userinfo,
  upserts a `profiles` row keyed by Google sub, issues tokens.
- One web OAuth client. Redirect URI is
  `BACKEND_URL/auth/google/callback`.

## Refresh token rotation

- Refresh tokens are persisted in the `refresh_tokens` table.
- Each refresh request consumes the presented refresh token (mark
  revoked) and issues a fresh one.
- Stolen tokens are detected by attempted reuse: presenting an
  already-revoked refresh token revokes the entire chain
  (defensive logout).

## Admin bootstrap

The `is_admin` flag on `profiles` is the gate. The first admin is
promoted by SQL on the server:

```sql
UPDATE profiles SET is_admin = TRUE WHERE email = 'operator@example.com';
```

There is no in-app UI to promote admins; it is a deliberate
constraint (see ADR 0003).

## Secrets and identities

Every credential used by this layer is documented in
`docs/policies/identities.md`:

- `JWT_SECRET` (server-only).
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (Miquel personal,
  until Workspace migration).
- `RESEND_API_KEY` (Miquel personal, until Workspace migration).

Rotation procedures live in `docs/ops/runbook.md`.

# Spec: docs/architecture/auth.md
