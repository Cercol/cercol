/**
 * Group nudge: email a group owner whose team stalled, once, after
 * NUDGE_AFTER_DAYS, with the actual state of their team.
 *
 * # Spec: docs/decisions/0019-witness-instrument-scoring.md
 *
 * Mirrors api/jobs/group_nudge.py including the two rules learned from
 * production: "finished" needs two completed witnesses per member (with
 * one, the aggregate is that person's answer and is not released), and one
 * email per owner, about their largest incomplete group, with the owner's
 * other stalled groups marked suppressed so they are never written again.
 */

import { sendGroupNudge } from '../emails.js'
import { now } from '../db.js'

const NUDGE_AFTER_DAYS = 15
const MIN_WITNESSES = 2

export async function gather(db, afterDays = NUDGE_AFTER_DAYS) {
  const cutoff = new Date(Date.now() - afterDays * 86400e3).toISOString()
  const { results: rows } = await db.prepare(
    `SELECT g.id, g.name, g.created_at, (g.created_at < ?1) AS due,
            p.email AS owner_email, p.first_name AS owner_first_name, p.native_language AS owner_lang,
            SUM(m.status = 'active') AS members,
            SUM(m.status = 'pending') AS pending,
            SUM(m.status = 'active' AND EXISTS (SELECT 1 FROM results r WHERE r.user_id = m.user_id AND r.instrument = 'fullMoon' AND r.is_seed = 0)) AS completed_fullmoon,
            SUM(m.status = 'active' AND (SELECT COUNT(*) FROM witness_sessions w WHERE w.subject_id = m.user_id AND w.is_seed = 0 AND w.completed_at IS NOT NULL) >= ?2) AS have_witnesses
       FROM groups g
       JOIN profiles p ON p.id = g.created_by
       JOIN group_members m ON m.group_id = g.id
      WHERE g.nudged_at IS NULL AND g.is_seed = 0
      GROUP BY g.id`
  ).bind(cutoff, MIN_WITNESSES).all()
  const incomplete = rows.filter((r) => r.members > 0 && !(r.completed_fullmoon === r.members && r.have_witnesses === r.members))
  return choosePerOwner(incomplete)
}

/** At most one group per owner: the largest, once any of theirs is due. */
export function choosePerOwner(incomplete) {
  const byOwner = {}
  for (const r of incomplete) (byOwner[r.owner_email] ||= []).push(r)
  const chosen = []
  for (const rows of Object.values(byOwner)) {
    if (!rows.some((r) => r.due)) continue
    rows.sort((a, b) => (b.members - a.members) || (b.created_at > a.created_at ? 1 : -1))
    const [best, ...rest] = rows
    best.suppress_ids = rest.map((r) => r.id)
    chosen.push(best)
  }
  return chosen
}

export function buildStatus(row) {
  const members = row.members
  return {
    group_name: row.name, members, pending: row.pending, completed: row.completed_fullmoon,
    missing_test: members - row.completed_fullmoon, with_witnesses: row.have_witnesses,
    no_witnesses: members - row.have_witnesses,
    days: Math.floor((Date.now() - Date.parse(row.created_at)) / 86400e3),
  }
}

export async function runNudge(env, { dryRun = false } = {}) {
  const sent = []
  for (const row of await gather(env.DB)) {
    const status = buildStatus(row)
    sent.push({ group: row.name, owner: row.owner_email, ...status })
    if (dryRun) continue
    try {
      await sendGroupNudge(env, row.owner_email, row.owner_first_name || '', status, row.id, row.owner_lang || 'en')
    } catch (e) {
      console.log(`[nudge] failed for ${row.owner_email}: ${e.message}`)
      continue
    }
    const ids = [row.id, ...(row.suppress_ids || [])]
    await env.DB.prepare(`UPDATE groups SET nudged_at = ? WHERE id IN (${ids.map(() => '?').join(',')})`).bind(now(), ...ids).run()
  }
  return sent
}
