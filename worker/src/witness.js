/**
 * Witness (Testimoni): sessions, public completion, aggregate reporting.
 *
 * # Spec: docs/architecture/backend.md
 *
 * Mirrors the five /witness routes in api/main.py. The one rule that
 * matters is preserved word for word: individual witness scores never leave
 * the server. /witness/my-sessions returns an aggregate, and only once
 * MIN_WITNESSES_FOR_REPORT sessions are complete, because with one the
 * aggregate is that person's answer.
 */

import { requireUser } from './auth.js'
import { optionalUser } from './writes.js'
import { ensureProfile, httpError, jsonBody, now, uuid, bool } from './db.js'
import { sendWitnessAssigned, sendWitnessCompleted } from './emails.js'

// api/main.py: MIN_WITNESSES_FOR_REPORT. Mirrored in FullMoonResultsPage.
const MIN_WITNESSES_FOR_REPORT = 2
const DOMAINS = ['presence', 'bond', 'discipline', 'depth', 'vision']
const front = (env) => env.FRONTEND_URL || 'https://cercol.team'

/** Bearer + premium-or-beta, or a 401/403 Response. Same as deps.require_premium. */
export async function requirePremium(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  if (!user.sub) return httpError(401, 'Invalid token')
  const p = await env.DB.prepare(`SELECT premium, is_beta FROM profiles WHERE id = ?`).bind(user.sub).first()
  if (!p || !(bool(p.premium) || bool(p.is_beta))) return httpError(403, 'Forbidden')
  return user
}

const hex16 = () => {
  const b = new Uint8Array(16); crypto.getRandomValues(b)
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

/** POST /witness/sessions — up to 12 sessions; emails a link where an address is given. */
export async function createSessions(env, request, ctx) {
  const user = await requirePremium(env, request)
  if (user instanceof Response) return user
  const body = await jsonBody(request)
  if (!body || !Array.isArray(body.witnesses)) return httpError(422, 'Invalid body')

  const db = env.DB
  await ensureProfile(db, user.sub, null)
  const prof = await db.prepare(`SELECT first_name, last_name FROM profiles WHERE id = ?`).bind(user.sub).first()
  const full = `${prof?.first_name || ''} ${prof?.last_name || ''}`.trim()
  const subjectDisplay = full || user.email || user.sub

  const created = []
  for (const w of body.witnesses.slice(0, 12)) {
    const name = (w?.name || '').trim()
    if (!name) continue
    const email = (w?.email || '').trim() || null
    const token = hex16()
    await db.prepare(
      `INSERT INTO witness_sessions (id, subject_id, subject_display, token, witness_name, witness_email, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(uuid(), user.sub, subjectDisplay, token, name, email, now()).run()
    const link = `${front(env)}/witness/${token}`
    created.push({ token, name, link })
    if (email) {
      const lr = await db.prepare(`SELECT native_language FROM profiles WHERE email = ?`).bind(email.toLowerCase()).first()
      // Fire and forget, like asyncio.create_task on the server: the response
      // does not wait on Resend, and a send failure never fails the request.
      ctx.waitUntil(sendWitnessAssigned(env, email, name, subjectDisplay, link, lr?.native_language || 'en').catch((e) =>
        console.log(`[witness] assigned email failed: ${e.message}`)))
    }
  }
  return Response.json(created)
}

/** GET /witness/session/<token> — public. */
export async function getSession(env, token) {
  const row = await env.DB.prepare(
    `SELECT witness_name, subject_display, completed_at FROM witness_sessions WHERE token = ?`
  ).bind(token).first()
  if (!row) return httpError(404, 'Session not found')
  return Response.json({
    witness_name: row.witness_name,
    subject_display: row.subject_display || '',
    completed: row.completed_at != null,
  })
}

/** POST /witness/session/<token>/complete — anonymous or signed-in witness. */
export async function completeSession(env, request, token, ctx) {
  const body = await jsonBody(request)
  const s = body?.scores
  if (!s || typeof s !== 'object') return httpError(422, 'Invalid body')
  for (const d of DOMAINS) {
    const v = s[d]
    if (typeof v !== 'number' || Number.isNaN(v) || v < 1 || v > 5) return httpError(422, `Invalid ${d}`)
  }
  const db = env.DB
  const row = await db.prepare(`SELECT id, completed_at FROM witness_sessions WHERE token = ?`).bind(token).first()
  if (!row) return httpError(404, 'Session not found')
  if (row.completed_at != null) return httpError(409, 'Session already completed')

  const user = await optionalUser(env, request)
  const scores = Object.fromEntries(DOMAINS.map((d) => [d, s[d]]))
  const ts = now()
  await db.batch([
    db.prepare(`INSERT INTO witness_responses (id, session_id, domain_scores, created_at) VALUES (?, ?, ?, ?)`)
      .bind(uuid(), row.id, JSON.stringify(scores), ts),
    db.prepare(`UPDATE witness_sessions SET completed_at = ?, witness_user_id = ? WHERE id = ?`)
      .bind(ts, user?.sub ?? null, row.id),
  ])
  const subj = await db.prepare(
    `SELECT ws.witness_name, ws.subject_display, p.email AS subject_email, p.native_language
       FROM witness_sessions ws JOIN profiles p ON p.id = ws.subject_id WHERE ws.id = ?`
  ).bind(row.id).first()
  if (subj?.subject_email) {
    ctx.waitUntil(sendWitnessCompleted(env, subj.subject_email, subj.witness_name, subj.native_language || 'en')
      .catch((e) => console.log(`[witness] completed email failed: ${e.message}`)))
  }
  return Response.json({ ok: true })
}

const ROLE_RE = /^R(0[1-9]|1[0-2])$/

/**
 * POST /witness/session/<token>/role-check
 *
 * After finishing, the Witness is shown three role descriptions, one of them
 * the role their own answers produced, and asked which sounds most like the
 * person they just described. This records the answer.
 *
 * It measures the instrument, not the person. Nothing in scoring, in the
 * norms or in any report reads this table, and it is deliberately not a
 * column on witness_responses so that staying true is the path of least
 * resistance.
 *
 * Why three options rather than two: the two nearest roles are neighbours on
 * the circumplex by construction, so a witness failing to separate them is
 * not evidence the instrument is broken, and detecting a real 60% against a
 * 50% chance line needs about 153 completed sessions. With a distant third
 * option the chance line is 33%, the question becomes the one that cannot be
 * answered today (is this better than random at all), and about 22 sessions
 * settle it.
 *
 * computed_role is what the client reports its own answers produced. The
 * server keeps witness_responses.domain_scores, so it is recorded rather than
 * trusted: a disagreement can be found later by recomputing.
 */
export async function roleCheck(env, request, token) {
  const body = await jsonBody(request)
  const roles = ['computed_role', 'rival_role', 'distant_role', 'chosen_role']
  for (const k of roles) {
    if (typeof body?.[k] !== 'string' || !ROLE_RE.test(body[k])) return httpError(422, `Invalid ${k}`)
  }
  const shown = [body.computed_role, body.rival_role, body.distant_role]
  if (new Set(shown).size !== 3) return httpError(422, 'The three roles shown must differ')
  if (!shown.includes(body.chosen_role)) return httpError(422, 'chosen_role was not one of the three shown')
  const agreement = body.agreement
  if (agreement != null && !(Number.isInteger(agreement) && agreement >= 1 && agreement <= 7)) {
    return httpError(422, 'Invalid agreement')
  }

  const db = env.DB
  const row = await db.prepare(`SELECT id, completed_at FROM witness_sessions WHERE token = ?`).bind(token).first()
  if (!row) return httpError(404, 'Session not found')
  if (row.completed_at == null) return httpError(409, 'Session is not complete')

  // One per session. A reload must not become a second data point.
  await db.prepare(
    `INSERT INTO witness_role_checks
       (id, session_id, computed_role, rival_role, distant_role, chosen_role, agreement, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
     ON CONFLICT (session_id) DO NOTHING`
  ).bind(uuid(), row.id, body.computed_role, body.rival_role, body.distant_role,
         body.chosen_role, agreement ?? null, now()).run()
  return Response.json({ ok: true })
}

/** GET /witness/my-sessions — the subject's sessions plus the guarded aggregate. */
/**
 * DELETE /witness/sessions — the reset button: remove every Witness session
 * the caller has created, completed or not, responses included. Their
 * invitation links die with them. Scoped hard to the caller's subject_id;
 * the responses go explicitly rather than trusting cascade enforcement.
 */
export async function resetSessions(env, request) {
  const user = await requirePremium(env, request)
  if (user instanceof Response) return user
  const db = env.DB
  await db.prepare(
    `DELETE FROM witness_responses WHERE session_id IN
       (SELECT id FROM witness_sessions WHERE subject_id = ?)`
  ).bind(user.sub).run()
  const { meta } = await db.prepare(
    `DELETE FROM witness_sessions WHERE subject_id = ?`
  ).bind(user.sub).run()
  return Response.json({ deleted: meta?.changes ?? 0 })
}

export async function mySessions(env, request) {
  const user = await requirePremium(env, request)
  if (user instanceof Response) return user
  const { results: rows } = await env.DB.prepare(
    `SELECT s.id, s.token, s.witness_name, s.witness_email, s.completed_at, s.created_at, r.domain_scores
       FROM witness_sessions s LEFT JOIN witness_responses r ON r.session_id = s.id
      WHERE s.subject_id = ? ORDER BY s.created_at DESC`
  ).bind(user.sub).all()
  const completed = rows.filter((s) => s.completed_at && s.domain_scores).map((s) => JSON.parse(s.domain_scores))
  let aggregate = null
  if (completed.length >= MIN_WITNESSES_FOR_REPORT) {
    aggregate = {}
    for (const d of DOMAINS) {
      if (completed.every((c) => d in (c || {}))) {
        aggregate[d] = completed.reduce((a, c) => a + Number(c[d]), 0) / completed.length
      }
    }
  }
  return Response.json({
    sessions: rows.map((s) => ({
      id: s.id, token: s.token, witness_name: s.witness_name, witness_email: s.witness_email,
      completed_at: s.completed_at, created_at: s.created_at, link: `${front(env)}/witness/${s.token}`,
    })),
    completed: completed.length,
    min_required: MIN_WITNESSES_FOR_REPORT,
    aggregate,
  })
}

/** GET /witness/my-contributions — sessions this user completed as a witness. */
export async function myContributions(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const { results } = await env.DB.prepare(
    `SELECT subject_display, completed_at FROM witness_sessions WHERE witness_user_id = ? ORDER BY completed_at DESC`
  ).bind(user.sub).all()
  return Response.json(results.map((r) => ({ subject_display: r.subject_display, completed_at: r.completed_at })))
}
