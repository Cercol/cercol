/**
 * Groups: create, invite, remove, witness round, list, accept, decline,
 * and the Last Quarter report data.
 *
 * # Spec: docs/architecture/backend.md
 *
 * Mirrors the nine /groups routes in api/main.py. Two things a reader
 * should know are preserved from the server:
 *   - the report is premium-gated on top of the membership check;
 *   - the witness round is idempotent per (subject, witness) pair, so
 *     re-running it chases stragglers instead of duplicating everyone.
 */

import { requireUser } from './auth.js'
import { requirePremium } from './witness.js'
import { ensureProfile, httpError, jsonBody, now, uuid } from './db.js'
import { sendGroupInvitation, sendWitnessRoundAssigned } from './emails.js'
import { scoreForReport } from './scoring.js'
import { randomToken } from './jwt.js'

const front = (env) => env.FRONTEND_URL || 'https://cercol.team'
const fullName = (r) => `${r?.first_name || ''} ${r?.last_name || ''}`.trim()

async function displayName(db, userId, fallbackEmail) {
  const r = await db.prepare(`SELECT first_name, last_name FROM profiles WHERE id = ?`).bind(userId).first()
  return fullName(r) || fallbackEmail || 'Someone'
}

/** Insert pending memberships for `emails`; returns { invited, errors }. */
async function inviteEmails(db, groupId, emails, creatorEmail) {
  const invited = [], errors = []
  for (const raw of Array.isArray(emails) ? emails : []) {
    const email = String(raw || '').trim().toLowerCase()
    if (!email || email === creatorEmail) continue
    try {
      const existing = await db.prepare(`SELECT id FROM profiles WHERE email = ?`).bind(email).first()
      if (existing) {
        const dup = await db.prepare(`SELECT 1 AS x FROM group_members WHERE group_id = ? AND user_id = ?`).bind(groupId, existing.id).first()
        if (!dup) await db.prepare(`INSERT INTO group_members (group_id, user_id, status, invited_at) VALUES (?, ?, 'pending', ?)`).bind(groupId, existing.id, now()).run()
      } else {
        const dup = await db.prepare(`SELECT 1 AS x FROM group_members WHERE group_id = ? AND invited_email = ?`).bind(groupId, email).first()
        if (!dup) await db.prepare(`INSERT INTO group_members (group_id, status, invited_email, invited_at) VALUES (?, 'pending', ?, ?)`).bind(groupId, email, now()).run()
      }
      invited.push(email)
    } catch {
      errors.push(email)
    }
  }
  return { invited, errors }
}

async function sendInvitations(env, ctx, invited, groupName, inviterName) {
  if (!invited.length) return
  const q = invited.map(() => '?').join(',')
  const { results } = await env.DB.prepare(`SELECT email, native_language FROM profiles WHERE email IN (${q})`).bind(...invited).all()
  const langBy = Object.fromEntries(results.map((r) => [r.email, r.native_language]))
  for (const email of invited) {
    ctx.waitUntil(sendGroupInvitation(env, email, groupName, inviterName, langBy[email] || 'en')
      .catch((e) => console.log(`[groups] invitation email failed: ${e.message}`)))
  }
}

async function assertOwner(db, groupId, userId) {
  const g = await db.prepare(`SELECT name, created_by FROM groups WHERE id = ?`).bind(groupId).first()
  if (!g) return httpError(404, 'Group not found')
  if (String(g.created_by) !== String(userId)) return httpError(403, 'Forbidden')
  return g.name
}

/** POST /groups */
export async function createGroup(env, request, ctx) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const body = await jsonBody(request)
  const name = String(body?.name || '').trim()
  if (!name) return httpError(400, 'Group name is required')
  const db = env.DB
  await ensureProfile(db, user.sub, user.email)
  const id = uuid()
  await db.batch([
    db.prepare(`INSERT INTO groups (id, name, created_by, created_at) VALUES (?, ?, ?, ?)`).bind(id, name, user.sub, now()),
    db.prepare(`INSERT INTO group_members (group_id, user_id, status, invited_at, joined_at) VALUES (?, ?, 'active', ?, ?)`).bind(id, user.sub, now(), now()),
  ])
  const creatorName = await displayName(db, user.sub, user.email)
  const { invited, errors } = await inviteEmails(db, id, body.emails, (user.email || '').toLowerCase())
  await sendInvitations(env, ctx, invited, name, creatorName)
  return Response.json({ id, name, errors })
}

/** POST /groups/<id>/invite — owner only. */
export async function inviteToGroup(env, request, groupId, ctx) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const name = await assertOwner(env.DB, groupId, user.sub)
  if (name instanceof Response) return name
  const body = await jsonBody(request)
  const { invited, errors } = await inviteEmails(env.DB, groupId, body?.emails, (user.email || '').toLowerCase())
  const creatorName = await displayName(env.DB, user.sub, user.email)
  await sendInvitations(env, ctx, invited, name, creatorName)
  return Response.json({ invited, errors })
}

/** DELETE /groups/<id>/members?email=|member_id= — owner only, never self. */
export async function removeMember(env, request, groupId) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const url = new URL(request.url)
  const email = url.searchParams.get('email'), memberId = url.searchParams.get('member_id')
  if (!email && !memberId) return httpError(400, 'email or member_id is required')
  if (memberId && String(memberId) === String(user.sub)) return httpError(400, 'The group owner cannot be removed')
  const owner = await assertOwner(env.DB, groupId, user.sub)
  if (owner instanceof Response) return owner
  let r
  if (memberId) {
    r = await env.DB.prepare(`DELETE FROM group_members WHERE group_id = ? AND user_id = ?`).bind(groupId, memberId).run()
  } else {
    const e = email.trim().toLowerCase()
    r = await env.DB.prepare(
      `DELETE FROM group_members WHERE group_id = ?1 AND (user_id IS NULL OR user_id != ?3)
         AND (lower(invited_email) = ?2 OR user_id = (SELECT id FROM profiles WHERE lower(email) = ?2))`
    ).bind(groupId, e, user.sub).run()
  }
  if (!r.meta?.changes) return httpError(404, 'Member not found in this group')
  return Response.json({ ok: true })
}

/** POST /groups/<id>/witness-round — owner only; idempotent per pair. */
export async function startWitnessRound(env, request, groupId, ctx) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const db = env.DB
  const groupName = await assertOwner(db, groupId, user.sub)
  if (groupName instanceof Response) return groupName
  const { results: members } = await db.prepare(
    `SELECT p.id, p.email, p.first_name, p.last_name, p.native_language
       FROM group_members m JOIN profiles p ON p.id = m.user_id
      WHERE m.group_id = ? AND m.status = 'active' AND m.user_id IS NOT NULL`
  ).bind(groupId).all()
  if (members.length < 2) return httpError(400, 'A witness round needs at least two active members')
  const display = (m) => fullName(m) || m.email || 'A teammate'
  const assignments = {}
  let created = 0
  for (const subject of members) {
    for (const witness of members) {
      if (subject.id === witness.id) continue
      const open = await db.prepare(
        `SELECT 1 AS x FROM witness_sessions WHERE subject_id = ? AND lower(witness_email) = ? AND completed_at IS NULL`
      ).bind(subject.id, (witness.email || '').toLowerCase()).first()
      if (open) continue
      const token = randomToken(32)
      await db.prepare(
        `INSERT INTO witness_sessions (id, subject_id, subject_display, token, witness_name, witness_email, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(uuid(), subject.id, display(subject), token, display(witness), witness.email, now()).run()
      created++
      ;(assignments[witness.id] ||= []).push([display(subject), `${front(env)}/witness/${token}`])
    }
  }
  const inviterName = await displayName(db, user.sub, user.email)
  const byId = Object.fromEntries(members.map((m) => [m.id, m]))
  for (const [wid, items] of Object.entries(assignments)) {
    const w = byId[wid]
    ctx.waitUntil(sendWitnessRoundAssigned(env, w.email, fullName(w) || w.email || '', inviterName, groupName, items, w.native_language || 'en')
      .catch((e) => console.log(`[groups] round email failed: ${e.message}`)))
  }
  return Response.json({ members: members.length, sessions_created: created, witnesses_emailed: Object.keys(assignments).length })
}

/** GET /groups/mine */
export async function myGroups(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const { results } = await env.DB.prepare(
    `SELECT g.id, g.name, g.created_by, g.created_at,
            COUNT(DISTINCT CASE WHEN gm_all.status = 'active' THEN gm_all.user_id END) AS member_count,
            COUNT(DISTINCT CASE WHEN gm_all.status = 'active' AND r.instrument = 'fullMoon' THEN r.user_id END) AS completed
       FROM groups g
       JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?1 AND gm.status = 'active'
       JOIN group_members gm_all ON gm_all.group_id = g.id
       LEFT JOIN results r ON r.user_id = gm_all.user_id
      GROUP BY g.id ORDER BY g.created_at DESC`
  ).bind(user.sub).all()
  return Response.json(results.map((r) => ({
    id: r.id, name: r.name, created_by: r.created_by, created_at: r.created_at,
    member_count: r.member_count, completed: r.completed, is_creator: String(r.created_by) === user.sub,
  })))
}

/** GET /groups/pending */
export async function pendingInvitations(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const { results } = await env.DB.prepare(
    `SELECT g.id AS group_id, g.name AS group_name, gm.invited_at
       FROM group_members gm JOIN groups g ON g.id = gm.group_id
      WHERE gm.user_id = ? AND gm.status = 'pending' ORDER BY gm.invited_at DESC`
  ).bind(user.sub).all()
  return Response.json(results.map((r) => ({ group_id: r.group_id, group_name: r.group_name, invited_at: r.invited_at })))
}

/** POST /groups/<id>/accept */
export async function acceptInvitation(env, request, groupId) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const r = await env.DB.prepare(
    `UPDATE group_members SET status = 'active', joined_at = ? WHERE group_id = ? AND user_id = ? AND status = 'pending'`
  ).bind(now(), groupId, user.sub).run()
  if (!r.meta?.changes) return httpError(404, 'Pending invitation not found')
  return Response.json({ ok: true })
}

/** POST /groups/<id>/decline */
export async function declineInvitation(env, request, groupId) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  const r = await env.DB.prepare(
    `DELETE FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'pending'`
  ).bind(groupId, user.sub).run()
  if (!r.meta?.changes) return httpError(404, 'Pending invitation not found')
  return Response.json({ ok: true })
}

/** GET /groups/<id>/report-data — premium, and an active member. */
export async function reportData(env, request, groupId) {
  const user = await requirePremium(env, request)
  if (user instanceof Response) return user
  const db = env.DB
  const member = await db.prepare(`SELECT 1 AS x FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'active'`).bind(groupId, user.sub).first()
  if (!member) return httpError(403, 'Not a member of this group')
  const group = await db.prepare(`SELECT id, name, created_by FROM groups WHERE id = ?`).bind(groupId).first()
  if (!group) return httpError(404, 'Group not found')

  const { results: pending } = await db.prepare(
    `SELECT gm.invited_email, gm.user_id, p.email AS account_email
       FROM group_members gm LEFT JOIN profiles p ON p.id = gm.user_id
      WHERE gm.group_id = ? AND gm.status = 'pending' ORDER BY gm.invited_at`
  ).bind(groupId).all()

  // Latest Full Moon per active member. SQLite has no LATERAL; a correlated
  // subquery on created_at picks the same row.
  const { results: rows } = await db.prepare(
    `SELECT gm.user_id, p.first_name, p.last_name, p.email,
            r.presence, r.bond, r.discipline, r.depth, r.vision, r.language
       FROM group_members gm
       LEFT JOIN profiles p ON p.id = gm.user_id
       LEFT JOIN results r ON r.id = (
         SELECT id FROM results WHERE user_id = gm.user_id AND instrument = 'fullMoon'
          ORDER BY created_at DESC LIMIT 1)
      WHERE gm.group_id = ? AND gm.status = 'active'`
  ).bind(groupId).all()

  const memberIds = rows.map((r) => r.user_id).filter(Boolean)
  let witnessRows = []
  if (memberIds.length) {
    const q = memberIds.map(() => '?').join(',')
    witnessRows = (await db.prepare(
      `SELECT subject_id, lower(witness_email) AS witness_email, (completed_at IS NOT NULL) AS done
         FROM witness_sessions WHERE subject_id IN (${q}) AND is_seed = 0`
    ).bind(...memberIds).all()).results
  }
  const given = {}, received = {}
  for (const w of witnessRows) {
    ;(received[w.subject_id] ||= [0, 0])[1]++
    if (w.done) received[w.subject_id][0]++
    if (w.witness_email) {
      ;(given[w.witness_email] ||= [0, 0])[1]++
      if (w.done) given[w.witness_email][0]++
    }
  }

  const members = rows.map((row) => {
    const hasResult = row.presence != null
    const { zscores, role } = hasResult ? scoreForReport(row, 'fullMoon') : { zscores: null, role: null }
    const g = given[(row.email || '').toLowerCase()] || [0, 0]
    const rc = received[row.user_id] || [0, 0]
    return {
      user_id: row.user_id, display_name: fullName(row) || null, role, zscores,
      completed: hasResult, is_self: row.user_id === user.sub,
      witness_given: { done: g[0], total: g[1] }, witness_received: { done: rc[0], total: rc[1] },
    }
  })
  return Response.json({
    group_id: groupId, group_name: group.name, members,
    is_owner: String(group.created_by) === String(user.sub),
    pending: pending.map((p) => ({ email: p.invited_email || p.account_email, user_id: p.user_id || null })),
  })
}
