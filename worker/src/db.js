/**
 * Data helpers shared by every handler. Thin on purpose: D1 is SQLite and
 * the SQL is written out where it is used, so nothing here hides a query.
 *
 * # Spec: docs/architecture/backend.md
 */

export const BETA_TOTAL = 500          // api/main.py: BETA_TOTAL

export const now = () => new Date().toISOString().replace('Z', '+00:00')
export const uuid = () => crypto.randomUUID()

/** SQLite stores booleans as 0/1; the API contract speaks true/false. */
export const bool = (v) => v === 1 || v === true

/**
 * Create or update a profile, claim a beta slot if one remains, and link
 * pending invitations. Mirrors api/main.py:ensure_profile line for line,
 * including the part that matters: the grant fires on the UPDATE branch
 * too, because the sign-in path creates the row before this ever runs.
 * The grant needs a free slot, a row that is neither premium nor beta, and
 * a verified email. It never revokes and never relabels a paid user.
 */
export async function ensureProfile(db, userId, email) {
  const ts = now()
  const verified = `COALESCE((SELECT email_verified FROM auth_users WHERE id = ?1), 0) = 1`
  const slot = `(SELECT COUNT(*) < ${BETA_TOTAL} FROM profiles WHERE is_beta = 1)`
  const grant = `(${slot} AND ${verified})`
  if (email) {
    await db.prepare(
      `INSERT INTO profiles (id, email, premium, is_beta, created_at, updated_at)
       SELECT ?1, ?2, ${grant}, ${grant}, ?3, ?3
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         premium = profiles.premium OR (profiles.premium = 0 AND profiles.is_beta = 0 AND ${grant}),
         is_beta = profiles.is_beta OR (profiles.premium = 0 AND profiles.is_beta = 0 AND ${grant}),
         updated_at = ?3`
    ).bind(userId, email.toLowerCase(), ts).run()
    await db.prepare(
      `UPDATE group_members SET user_id = ?1
        WHERE invited_email = ?2 AND user_id IS NULL AND status = 'pending'`
    ).bind(userId, email.toLowerCase()).run()
  } else {
    await db.prepare(
      `INSERT INTO profiles (id, premium, is_beta, created_at, updated_at)
       SELECT ?1, ${grant}, ${grant}, ?2, ?2
       ON CONFLICT(id) DO UPDATE SET
         premium = profiles.premium OR (profiles.premium = 0 AND profiles.is_beta = 0 AND ${grant}),
         is_beta = profiles.is_beta OR (profiles.premium = 0 AND profiles.is_beta = 0 AND ${grant}),
         updated_at = ?2`
    ).bind(userId, ts).run()
  }
}

/** JSON response with the same shape FastAPI produces for HTTPException. */
export const httpError = (status, detail) =>
  new Response(JSON.stringify({ detail }), { status, headers: { 'content-type': 'application/json' } })

/** Parse a JSON body, or null when it is not JSON. */
export async function jsonBody(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}
