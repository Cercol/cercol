/**
 * Progress through the distribution plan, and the one button that files a step.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * The plan lives in the private ops repo (plan-sections.json)
 * because it is content and belongs under review. This module owns only the
 * parts that change: what state each step is in, and whether it has been filed
 * as a GitHub issue.
 *
 * Filing reuses the queue the daily brief already writes to, so a step sent to
 * be done arrives in the same place as everything else the routine works from.
 * That is the whole point of the button: the panel does not become a second
 * to-do list nobody reads.
 */

import { requireAdmin } from './admin.js'
import { httpError, jsonBody, now } from './db.js'
import { sendAsMiquel } from './emails.js'

export const STATUSES = ['todo', 'doing', 'done', 'dropped']

/** GET /admin/authority — every row that has ever been touched. */
export async function list(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const { results } = await env.DB.prepare(
    `SELECT id, status, notes, issue_number, updated_at FROM authority_status`
  ).all()
  return Response.json({ items: results })
}

/** PATCH /admin/authority/<id> — set the state, the notes, or both. */
export async function patch(env, request, id) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const b = (await jsonBody(request)) || {}
  if (b.status != null && !STATUSES.includes(b.status)) return httpError(400, `status must be one of ${STATUSES.join(', ')}`)
  if (b.status == null && b.notes === undefined) return httpError(400, 'Nothing to update')
  const ts = now()
  // One statement: the row may not exist yet, and a PATCH that only sets
  // notes must not reset a status the operator already chose.
  await env.DB.prepare(
    `INSERT INTO authority_status (id, status, notes, updated_at) VALUES (?1, COALESCE(?2, 'todo'), ?3, ?4)
     ON CONFLICT(id) DO UPDATE SET
       status = COALESCE(?2, status),
       notes = CASE WHEN ?5 = 1 THEN ?3 ELSE notes END,
       updated_at = ?4`
  ).bind(id, b.status ?? null, b.notes ?? null, ts, b.notes === undefined ? 0 : 1).run()
  const row = await env.DB.prepare(
    `SELECT id, status, notes, issue_number, updated_at FROM authority_status WHERE id = ?`
  ).bind(id).first()
  return Response.json(row)
}

/**
 * POST /admin/authority/<id>/issue — file this target as a GitHub issue.
 *
 * The body carries the target's own text rather than the Worker holding a
 * copy of the catalogue: one source, in the repository, and the Worker stays
 * ignorant of what the targets are.
 */
export async function file(env, request, id) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  if (!env.GITHUB_TOKEN) return httpError(503, 'No GITHUB_TOKEN on the Worker')
  const b = (await jsonBody(request)) || {}
  if (!b.name) return httpError(422, 'Invalid body')

  const existing = await env.DB.prepare(`SELECT issue_number FROM authority_status WHERE id = ?`).bind(id).first()
  if (existing?.issue_number) return Response.json({ number: existing.issue_number, alreadyFiled: true })

  const body = [
    b.why || '',
    '',
    b.ask ? `**What it takes:** ${b.ask}` : '',
    b.url ? `**Where:** ${b.url}` : '',
    b.contact ? `**Who:** ${b.contact}` : '',
    '',
    `Filed from the plan panel. Plan step \`${id}\` in the ops repo plan (plan-sections.json).`,
  ].filter(Boolean).join('\n')

  const repo = env.GITHUB_REPO || 'Cercol/cercol'
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'user-agent': 'cercol-api', 'content-type': 'application/json' },
    body: JSON.stringify({ title: `Pla: ${b.name}`, body, labels: ['pla'] }),
  })
  if (!res.ok) return httpError(502, `github ${res.status}`)
  const { number } = await res.json()
  const ts = now()
  await env.DB.prepare(
    `INSERT INTO authority_status (id, status, issue_number, updated_at) VALUES (?1, 'doing', ?2, ?3)
     ON CONFLICT(id) DO UPDATE SET issue_number = ?2, status = CASE WHEN status = 'todo' THEN 'doing' ELSE status END, updated_at = ?3`
  ).bind(id, number, ts).run()
  return Response.json({ number })
}

/**
 * POST /admin/plan/<id>/email — send a step's drafted message.
 *
 * The plan holds several steps whose action is a letter to a named person.
 * Until now the panel could only hand them to a mail client, which meant they
 * left from whatever address that client happened to be configured with. This
 * sends them from miquel@cercol.team, the address the recipients already have
 * a thread with.
 *
 * The body travels in the request rather than living here, same as filing an
 * issue: one copy of the plan, in the repository, and the Worker stays
 * ignorant of what it says. Admin-gated, and the send is recorded on the step
 * so the panel can show it went and never offers to send it twice.
 */
export async function email(env, request, id) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  if (!env.RESEND_API_KEY) return httpError(503, 'No RESEND_API_KEY on the Worker')
  const b = (await jsonBody(request)) || {}
  if (!b.to || !b.subject || !b.text) return httpError(422, 'Invalid body')

  const row = await env.DB.prepare(`SELECT notes FROM authority_status WHERE id = ?`).bind(id).first()
  if (row?.notes?.startsWith('sent ')) return Response.json({ alreadySent: true, notes: row.notes })

  await sendAsMiquel(env, { to: b.to, subject: b.subject, text: b.text })
  const ts = now()
  const note = `sent ${ts} to ${Array.isArray(b.to) ? b.to.join(', ') : b.to}`
  await env.DB.prepare(
    `INSERT INTO authority_status (id, status, notes, updated_at) VALUES (?1, 'doing', ?2, ?3)
     ON CONFLICT(id) DO UPDATE SET notes = ?2, status = CASE WHEN status = 'todo' THEN 'doing' ELSE status END, updated_at = ?3`
  ).bind(id, note, ts).run()
  return Response.json({ sent: true, notes: note })
}

/**
 * Close the loop: a filed step whose issue is closed becomes done.
 *
 * Filing a step opened an issue and then nothing ever read it back, so the
 * panel's count only moved when a human clicked. The work would be finished,
 * the issue closed, and the plan would still say "en marxa".
 *
 * One request, not one per step: ask GitHub for the closed issues carrying the
 * label and match them against the numbers already stored. The Worker has 50
 * subrequests per invocation and 90 steps, so per-step polling was never an
 * option.
 *
 * Only 'doing' rows advance. A step someone deliberately dropped, or already
 * marked done, is left alone.
 */
export async function syncFiledIssues(env) {
  if (!env.GITHUB_TOKEN) return { skipped: 'no token' }
  const { results } = await env.DB.prepare(
    `SELECT id, issue_number FROM authority_status WHERE issue_number IS NOT NULL AND status = 'doing'`
  ).all()
  if (!results.length) return { checked: 0, closed: 0 }

  const repo = env.GITHUB_REPO || 'Cercol/cercol'
  const res = await fetch(`https://api.github.com/repos/${repo}/issues?state=closed&labels=pla&per_page=100`, {
    headers: { authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'user-agent': 'cercol-api' },
  })
  if (!res.ok) return { error: `github ${res.status}` }
  const closed = new Set((await res.json()).map((i) => i.number))

  const done = results.filter((r) => closed.has(r.issue_number))
  if (done.length) {
    const ts = now()
    await env.DB.batch(done.map((r) => env.DB.prepare(
      `UPDATE authority_status SET status = 'done', updated_at = ?2 WHERE id = ?1 AND status = 'doing'`
    ).bind(r.id, ts)))
  }
  return { checked: results.length, closed: done.length, ids: done.map((r) => r.id) }
}
