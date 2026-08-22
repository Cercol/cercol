/**
 * Progress against the authority catalogue, and the one button that files it.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * The catalogue of targets lives in the frontend bundle
 * (src/data/authority-targets.js) because it is research and belongs under
 * review. This module owns only the parts that change: what state each target
 * is in, and whether it has been filed as a GitHub issue.
 *
 * Filing reuses the queue the daily brief already writes to, so a target sent
 * to be done arrives in the same place as everything else the routine works
 * from. That is the whole point of the button: the panel does not become a
 * second to-do list nobody reads.
 */

import { requireAdmin } from './admin.js'
import { httpError, jsonBody, now } from './db.js'

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
    `Filed from the authority panel. Catalogue entry \`${id}\` in \`src/data/authority-targets.js\`.`,
  ].filter(Boolean).join('\n')

  const repo = env.GITHUB_REPO || 'Cercol/cercol'
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'user-agent': 'cercol-api', 'content-type': 'application/json' },
    body: JSON.stringify({ title: `Authority: ${b.name}`, body }),
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
