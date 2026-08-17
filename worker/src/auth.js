/**
 * Auth: magic link, Google OAuth, refresh, signout, and the /me family.
 *
 * # Spec: docs/architecture/auth.md
 *
 * Mirrors api/auth.py and the /me routes in api/main.py, minus passwords.
 * Password sign-in is retired in this migration: bcrypt cannot run inside
 * the 10 ms CPU budget, PBKDF2 at 20-80k iterations would be a step down
 * from what OWASP asks for, and only 8 of 16 accounts ever set one. Magic
 * link and Google cover every existing account. The password endpoints
 * therefore answer 410 Gone rather than proxying to Hetzner, so the
 * frontend gets a clean signal instead of a half-working path.
 *
 * Every token issued here validates on FastAPI and vice versa (same secret,
 * same claims), so a session survives the cutover in either direction.
 */

import { issueAccessToken, verifyAccessToken, bearerFrom, randomToken } from './jwt.js'
import { ensureProfile, httpError, jsonBody, now, uuid, bool } from './db.js'
import { sendMagicLink } from './emails.js'

const MAGIC_TTL_MS = 15 * 60 * 1000               // api/auth.py: _MAGIC_TTL
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000   // api/auth.py: _REFRESH_TTL
const STATE_TTL_MS = 10 * 60 * 1000

const iso = (ms) => new Date(ms).toISOString().replace('Z', '+00:00')

/** Require a valid bearer; returns the payload or a 401 Response. */
export async function requireUser(env, request) {
  const tok = bearerFrom(request)
  if (!tok) return httpError(401, 'Not authenticated')
  const user = await verifyAccessToken(env.JWT_SECRET, tok)
  return user || httpError(401, 'Invalid token')
}

async function issueRefreshToken(db, userId) {
  const token = randomToken(48)
  await db.prepare(
    `INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`
  ).bind(uuid(), userId, token, iso(Date.now() + REFRESH_TTL_MS), now()).run()
  return token
}

async function tokenResponse(env, userId, email, refreshToken) {
  return Response.json({
    access_token: await issueAccessToken(env.JWT_SECRET, userId, email),
    refresh_token: refreshToken,
    token_type: 'bearer',
  })
}

/**
 * Find or create the auth user for a proven email (or google_id), mark it
 * verified, upsert the profile without clobbering an edited name, link
 * pending group invitations, stamp last_sign_in_at. Same as
 * api/auth.py:_find_or_create_user, including which email is authoritative
 * downstream (the account's, not Google's).
 */
async function findOrCreateUser(db, email, { googleId = null, firstName = null, lastName = null } = {}) {
  email = email.toLowerCase()
  let row = null
  if (googleId) {
    row = await db.prepare(`SELECT id, email FROM auth_users WHERE google_id = ?`).bind(googleId).first()
    if (!row) {
      row = await db.prepare(`SELECT id, email FROM auth_users WHERE email = ?`).bind(email).first()
      if (row) await db.prepare(`UPDATE auth_users SET google_id = ? WHERE id = ?`).bind(googleId, row.id).run()
    }
  } else {
    row = await db.prepare(`SELECT id, email FROM auth_users WHERE email = ?`).bind(email).first()
  }
  let user
  if (!row) {
    const id = uuid()
    await db.prepare(
      `INSERT INTO auth_users (id, email, google_id, created_at) VALUES (?, ?, ?, ?)`
    ).bind(id, email, googleId, now()).run()
    user = { id, email }
  } else {
    user = { id: row.id, email: row.email }
  }
  const ts = now()
  const fn = (firstName || '').trim() || null
  const ln = (lastName || '').trim() || null
  await db.batch([
    db.prepare(`UPDATE auth_users SET email_verified = 1 WHERE id = ?`).bind(user.id),
    db.prepare(
      `INSERT INTO profiles (id, email, first_name, last_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         first_name = COALESCE(profiles.first_name, excluded.first_name),
         last_name = COALESCE(profiles.last_name, excluded.last_name),
         updated_at = excluded.updated_at`
    ).bind(user.id, user.email, fn, ln, ts, ts),
    db.prepare(
      `UPDATE group_members SET user_id = ? WHERE invited_email = ? AND user_id IS NULL AND status = 'pending'`
    ).bind(user.id, user.email),
    db.prepare(`UPDATE auth_users SET last_sign_in_at = ? WHERE id = ?`).bind(ts, user.id),
  ])
  return user
}

// ---------------------------------------------------------------------------
// Magic link
// ---------------------------------------------------------------------------

/** POST /auth/magic-link/request — always 202, never reveals if the email exists. */
export async function magicLinkRequest(env, request) {
  const body = await jsonBody(request)
  const email = (body?.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) return httpError(400, 'Invalid email address')
  const token = randomToken(32)
  await env.DB.prepare(
    `INSERT INTO magic_tokens (id, email, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`
  ).bind(uuid(), email, token, iso(Date.now() + MAGIC_TTL_MS), now()).run()
  const langRow = await env.DB.prepare(`SELECT native_language FROM profiles WHERE email = ?`).bind(email).first()
  const link = `${env.FRONTEND_URL || 'https://cercol.team'}/auth/callback?type=magic&token=${token}`
  try {
    await sendMagicLink(env, email, link, langRow?.native_language || 'en')
  } catch (e) {
    console.log(`[auth] magic link email failed for ${email}: ${e.message}`)
  }
  return Response.json({ detail: 'Magic link sent' }, { status: 202 })
}

/** POST /auth/magic-link/verify — consume the token, sign the user in. */
export async function magicLinkVerify(env, request) {
  const body = await jsonBody(request)
  const token = (body?.token || '').trim()
  const row = await env.DB.prepare(
    `SELECT id, email, expires_at, used_at FROM magic_tokens WHERE token = ?`
  ).bind(token).first()
  if (!row) return httpError(401, 'Invalid or expired magic link')
  if (row.used_at) return httpError(401, 'Magic link already used')
  if (new Date(row.expires_at) < new Date()) return httpError(401, 'Magic link has expired')
  await env.DB.prepare(`UPDATE magic_tokens SET used_at = ? WHERE id = ?`).bind(now(), row.id).run()
  const user = await findOrCreateUser(env.DB, row.email)
  const rt = await issueRefreshToken(env.DB, user.id)
  return tokenResponse(env, user.id, user.email, rt)
}

// ---------------------------------------------------------------------------
// Refresh / signout
// ---------------------------------------------------------------------------

/** POST /auth/refresh — rotate: revoke the old refresh token, issue both anew. */
export async function refresh(env, request) {
  const body = await jsonBody(request)
  const row = await env.DB.prepare(
    `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at, au.email
       FROM refresh_tokens rt JOIN auth_users au ON au.id = rt.user_id
      WHERE rt.token = ?`
  ).bind(body?.refresh_token || '').first()
  if (!row || row.revoked_at || new Date(row.expires_at) < new Date()) {
    return httpError(401, 'Invalid or expired refresh token')
  }
  await env.DB.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE id = ?`).bind(now(), row.id).run()
  const rt = await issueRefreshToken(env.DB, row.user_id)
  return tokenResponse(env, row.user_id, row.email, rt)
}

/** POST /auth/signout — revoke; 204 either way. */
export async function signout(env, request) {
  const body = await jsonBody(request)
  await env.DB.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE token = ?`)
    .bind(now(), body?.refresh_token || '').run()
  return new Response(null, { status: 204 })
}

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------

const backendUrl = (env) => env.BACKEND_URL || 'https://api.cercol.team'
const redirectTo = (url) => new Response(null, { status: 302, headers: { location: url } })

/** GET /auth/google — stash a CSRF state, bounce to Google. */
export async function googleStart(env) {
  if (!env.GOOGLE_CLIENT_ID) return httpError(500, 'Google OAuth not configured')
  const state = randomToken(24)
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO oauth_states (state, expires_at, created_at) VALUES (?, ?, ?)`)
      .bind(state, iso(Date.now() + STATE_TTL_MS), now()),
    env.DB.prepare(`DELETE FROM oauth_states WHERE expires_at < ?`).bind(now()),
  ])
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${backendUrl(env)}/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  })
  return redirectTo(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}

/** GET /auth/google/callback — exchange the code, sign in, bounce to the SPA. */
export async function googleCallback(env, request) {
  const url = new URL(request.url)
  const front = env.FRONTEND_URL || 'https://cercol.team'
  if (url.searchParams.get('error')) return redirectTo(`${front}/auth?error=google_denied`)
  const code = url.searchParams.get('code'), state = url.searchParams.get('state')
  if (!code || !state) return httpError(422, 'Missing code or state')

  const st = await env.DB.prepare(`SELECT expires_at FROM oauth_states WHERE state = ?`).bind(state).first()
  if (!st || new Date(st.expires_at) < new Date()) return redirectTo(`${front}/auth?error=invalid_state`)
  await env.DB.prepare(`DELETE FROM oauth_states WHERE state = ?`).bind(state).run()

  let userinfo
  try {
    const tokRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${backendUrl(env)}/auth/google/callback`, grant_type: 'authorization_code',
      }),
    })
    if (!tokRes.ok) throw new Error(`token ${tokRes.status}`)
    const tok = await tokRes.json()
    const uiRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { authorization: `Bearer ${tok.access_token}` },
    })
    if (!uiRes.ok) throw new Error(`userinfo ${uiRes.status}`)
    userinfo = await uiRes.json()
  } catch {
    return redirectTo(`${front}/auth?error=google_exchange_failed`)
  }

  const googleId = userinfo.id, email = (userinfo.email || '').toLowerCase()
  if (!email || !googleId) return redirectTo(`${front}/auth?error=missing_google_email`)

  const user = await findOrCreateUser(env.DB, email, {
    googleId, firstName: userinfo.given_name, lastName: userinfo.family_name,
  })
  const rt = await issueRefreshToken(env.DB, user.id)
  const access = await issueAccessToken(env.JWT_SECRET, user.id, user.email)
  return redirectTo(`${front}/auth/callback?${new URLSearchParams({ access_token: access, refresh_token: rt })}`)
}

// ---------------------------------------------------------------------------
// /me
// ---------------------------------------------------------------------------

/** GET /me */
export async function me(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  return Response.json({ user_id: user.sub, email: user.email ?? null })
}

/** GET /me/profile — full profile, with the beta grant applied first. */
export async function getProfile(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  await ensureProfile(env.DB, user.sub, user.email)
  const p = await env.DB.prepare(
    `SELECT id, premium, is_admin, is_beta, first_name, last_name, country, native_language, onboarding_seen
       FROM profiles WHERE id = ?`
  ).bind(user.sub).first()
  return Response.json({
    id: p.id, premium: bool(p.premium), is_admin: bool(p.is_admin), is_beta: bool(p.is_beta),
    first_name: p.first_name, last_name: p.last_name, country: p.country,
    native_language: p.native_language, onboarding_seen: bool(p.onboarding_seen),
    // Passwords are retired: nobody has one on this backend. Kept in the
    // shape so the frontend's has_password branch keeps type-checking.
    has_password: false,
  })
}

const PROFILE_FIELDS = new Set(['first_name', 'last_name', 'country', 'native_language', 'onboarding_seen'])

/** PATCH /me/profile — only the five mutable fields, only those present. */
export async function patchProfile(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const body = (await jsonBody(request)) || {}
  const updates = Object.entries(body).filter(([k, v]) => PROFILE_FIELDS.has(k) && v != null)
  if (!updates.length) return httpError(400, 'No fields to update')
  await ensureProfile(env.DB, user.sub, user.email)
  const set = updates.map(([k]) => `${k} = ?`).join(', ')
  const vals = updates.map(([k, v]) => (k === 'onboarding_seen' ? (v ? 1 : 0) : String(v)))
  await env.DB.prepare(`UPDATE profiles SET ${set}, updated_at = ? WHERE id = ?`)
    .bind(...vals, now(), user.sub).run()
  return Response.json({ ok: true })
}

/** GET /me/results — newest first. */
export async function myResults(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const { results } = await env.DB.prepare(
    `SELECT id, created_at, instrument, language, presence, bond, discipline, depth, vision, facets
       FROM results WHERE user_id = ? ORDER BY created_at DESC`
  ).bind(user.sub).all()
  return Response.json(results.map((r) => ({ ...r, facets: r.facets == null ? null : JSON.parse(r.facets) })))
}

/** DELETE /me/results/<id> — anonymise, keep the scores for the norms. */
export async function anonymiseResult(env, request, resultId) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const row = await env.DB.prepare(`SELECT id FROM results WHERE id = ? AND user_id = ?`).bind(resultId, user.sub).first()
  if (!row) return httpError(404, 'Result not found')
  await env.DB.prepare(`UPDATE results SET user_id = NULL WHERE id = ?`).bind(resultId).run()
  return Response.json({ ok: true })
}

/** GET /beta — public, drives the launch banner. */
export async function betaStatus(env) {
  const { n } = await env.DB.prepare(`SELECT COUNT(*) AS n FROM profiles WHERE is_beta = 1`).first()
  const remaining = Math.max(0, 500 - n)
  return Response.json({ remaining, total: 500, active: remaining > 0 })
}

/** The retired password endpoints. 410 says "gone on purpose", not "broken". */
export const passwordGone = () =>
  httpError(410, 'Password sign-in has been retired. Use the magic link or Google.')

// ---------------------------------------------------------------------------
// Email change
// ---------------------------------------------------------------------------

/**
 * POST /auth/email/change-request — nothing moves until the token mailed to
 * the new address comes back. Without passwords the "re-enter it" branch is
 * gone; the two emails (confirm to new, notice to old) are the safeguard.
 */
export async function emailChangeRequest(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const body = await jsonBody(request)
  const newEmail = String(body?.new_email || '').trim().toLowerCase()
  if (!newEmail || !newEmail.includes('@')) return httpError(400, 'Invalid email address')
  const db = env.DB
  const row = await db.prepare(`SELECT email FROM auth_users WHERE id = ?`).bind(user.sub).first()
  if (!row) return httpError(404, 'User not found')
  if (newEmail === row.email) return httpError(400, 'That is already your email address')
  if (await db.prepare(`SELECT 1 AS x FROM auth_users WHERE email = ?`).bind(newEmail).first()) return httpError(409, 'Email already registered')
  const token = randomToken(32)
  await db.prepare(`INSERT INTO email_change_tokens (id, user_id, new_email, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(uuid(), user.sub, newEmail, token, iso(Date.now() + MAGIC_TTL_MS), now()).run()
  const lr = await db.prepare(`SELECT native_language FROM profiles WHERE id = ?`).bind(user.sub).first()
  const l = lr?.native_language || 'en'
  const link = `${env.FRONTEND_URL || 'https://cercol.team'}/auth/callback?type=email-change&token=${token}`
  const { sendEmailChangeConfirm, sendEmailChangeNotice } = await import('./emails.js')
  try { await sendEmailChangeConfirm(env, newEmail, link, l) } catch (e) { console.log(`[auth] email change confirm failed: ${e.message}`) }
  try { await sendEmailChangeNotice(env, row.email, newEmail, l) } catch (e) { console.log(`[auth] email change notice failed: ${e.message}`) }
  return Response.json({ detail: 'Confirmation sent to the new address' }, { status: 202 })
}

/** POST /auth/email/change-confirm — move the account, revoke every session, issue a fresh pair. */
export async function emailChangeConfirm(env, request) {
  const body = await jsonBody(request)
  const token = String(body?.token || '').trim()
  const db = env.DB
  const row = await db.prepare(`SELECT id, user_id, new_email, expires_at, used_at FROM email_change_tokens WHERE token = ?`).bind(token).first()
  if (!row) return httpError(401, 'Invalid or expired confirmation link')
  if (row.used_at) return httpError(401, 'Confirmation link already used')
  if (new Date(row.expires_at) < new Date()) return httpError(401, 'Confirmation link has expired')
  const taken = await db.prepare(`SELECT 1 AS x FROM auth_users WHERE email = ? AND id <> ?`).bind(row.new_email, row.user_id).first()
  if (taken) return httpError(409, 'Email already registered')
  const ts = now()
  await db.batch([
    db.prepare(`UPDATE email_change_tokens SET used_at = ? WHERE id = ?`).bind(ts, row.id),
    db.prepare(`UPDATE auth_users SET email = ?, email_verified = 1 WHERE id = ?`).bind(row.new_email, row.user_id),
    db.prepare(`UPDATE profiles SET email = ?, updated_at = ? WHERE id = ?`).bind(row.new_email, ts, row.user_id),
    db.prepare(`UPDATE group_members SET user_id = ? WHERE invited_email = ? AND user_id IS NULL AND status = 'pending'`).bind(row.user_id, row.new_email),
    db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`).bind(ts, row.user_id),
  ])
  const rt = await issueRefreshToken(db, row.user_id)
  return tokenResponse(env, row.user_id, row.new_email, rt)
}
