/**
 * Admin: stats, users, results, norms, activity, feedback, maintenance.
 *
 * # Spec: docs/architecture/backend.md
 *
 * Mirrors the twelve /admin routes in api/main.py. All behind require_admin,
 * which is the bearer check plus profiles.is_admin, 401 then 403 in that
 * order like deps.require_admin.
 */

import { requireUser } from './auth.js'
import { httpError, jsonBody, now, bool } from './db.js'
import { computeRole } from '../../src/utils/role-scoring.js'
import { getNorms, resolveNorm, NORM_MIN_SAMPLE, NORM_REFRESH_DAYS } from './norms.js'
import { NAMED } from './scheduled.js'

const DOMAINS = ['presence', 'bond', 'discipline', 'depth', 'vision']
const INSTRUMENTS = ['newMoon', 'firstQuarter', 'fullMoon']
const LANGS = ['en', 'ca', 'es', 'fr', 'de', 'da']

export async function requireAdmin(env, request) {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user
  if (!user.sub) return httpError(401, 'Invalid token')
  const p = await env.DB.prepare(`SELECT is_admin FROM profiles WHERE id = ?`).bind(user.sub).first()
  if (!p || !bool(p.is_admin)) return httpError(403, 'Forbidden')
  return user
}

/** api/main.py:_csv_val — minimal quoting. Python str(True) is "True". */
const csv = (v) => {
  if (v == null) return ''
  const s = typeof v === 'boolean' ? (v ? 'True' : 'False') : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const csvResponse = (text, filename) =>
  new Response(text, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename=${filename}` } })

/** Role for a raw result row via the norm cache; mirrors resolve_norm + z + role. */
function roleFor(row, normCache) {
  if (row.presence == null) return null
  const [norm] = resolveNorm(row.instrument, row.language, normCache)
  // The frontend's computeRole z-scores against priorFor(instrument); when
  // an empirical norm applies we must z-score with it instead, so use the
  // centroid distance directly through computeRole on pre-normalised input.
  // Simplest faithful path: transform raw -> z with `norm`, then feed a
  // synthetic score set that priorFor maps back to that same z.
  const { mean, sd } = priorForFlat(row.instrument)
  const synthetic = {}
  for (const d of DOMAINS) {
    const z = (Number(row[d]) - norm[d].mean) / norm[d].sd
    synthetic[d] = z * sd[d] + mean[d]
  }
  return computeRole(synthetic, row.instrument).role
}
// priorFor keyed by domain rather than factor letter, for the transform above.
import { priorFor, DOMAIN_MAP } from '../../src/utils/role-scoring.js'
import { usableCorpus } from './norms.js'
function priorForFlat(instrument) {
  const p = priorFor(instrument)
  const mean = {}, sd = {}
  for (const [f, d] of Object.entries(DOMAIN_MAP)) { mean[d] = p.mean[f]; sd[d] = p.sd[f] }
  return { mean, sd }
}

/** GET /admin/stats */
export async function stats(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const p = await env.DB.prepare(
    `SELECT COUNT(*) AS total, SUM(premium = 1) AS premium, SUM(is_admin = 1) AS admins FROM profiles`).first()
  const r = await env.DB.prepare(
    `SELECT COUNT(*) AS total, SUM(user_id IS NULL) AS anonymous,
            SUM(instrument = 'newMoon') AS new_moon, SUM(instrument = 'firstQuarter') AS first_quarter,
            SUM(instrument = 'fullMoon') AS full_moon FROM results`).first()
  // Rows ever recorded, and rows that count toward norming. They are not the
  // same number and have not been since the instruments changed: a response
  // to a different item set on a different scale is real data about a
  // different instrument. Reporting only the first would overstate how close
  // the project is to every threshold in the plan.
  const usable = await usableCorpus(env.DB)
  return Response.json({
    users: { total: p.total, premium: p.premium || 0, admins: p.admins || 0 },
    usable,
    results: { total: r.total, anonymous: r.anonymous || 0,
      by_instrument: { newMoon: r.new_moon || 0, firstQuarter: r.first_quarter || 0, fullMoon: r.full_moon || 0 } },
  })
}

/** GET /admin/users?offset&limit&search */
export async function users(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const u = new URL(request.url)
  const offset = Math.max(0, parseInt(u.searchParams.get('offset') || '0', 10) || 0)
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get('limit') || '25', 10) || 25))
  const search = u.searchParams.get('search') || ''
  const like = `%${search}%`
  const { results: rows } = await env.DB.prepare(
    `SELECT p.id, p.email, p.first_name, p.last_name, p.premium, p.is_admin, p.created_at, COUNT(r.id) AS result_count
       FROM profiles p LEFT JOIN results r ON r.user_id = p.id
      WHERE ?3 = '' OR p.email LIKE ?4 OR p.first_name LIKE ?4 OR p.last_name LIKE ?4
      GROUP BY p.id ORDER BY p.created_at IS NULL, p.created_at DESC LIMIT ?1 OFFSET ?2`
  ).bind(limit + 1, offset, search, like).all()
  const { n: total } = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM profiles WHERE ?1 = '' OR email LIKE ?2 OR first_name LIKE ?2 OR last_name LIKE ?2`
  ).bind(search, like).first()
  const items = rows.slice(0, limit).map((r) => ({
    email: r.email, first_name: r.first_name, last_name: r.last_name, premium: bool(r.premium), is_admin: bool(r.is_admin),
    id: r.id, created_at: r.created_at, result_count: r.result_count,
  }))
  return Response.json({ total, has_more: rows.length > limit, items })
}

/** GET /admin/users/export.csv */
export async function usersCsv(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const { results: rows } = await env.DB.prepare(
    `SELECT p.id, p.email, p.first_name, p.last_name, p.premium, p.is_admin, p.created_at, COUNT(r.id) AS result_count
       FROM profiles p LEFT JOIN results r ON r.user_id = p.id GROUP BY p.id ORDER BY p.created_at IS NULL, p.created_at DESC`).all()
  let out = 'id,email,first_name,last_name,premium,is_admin,created_at,result_count\n'
  for (const r of rows) out += [r.id, r.email, r.first_name, r.last_name, bool(r.premium), bool(r.is_admin), r.created_at, r.result_count].map(csv).join(',') + '\n'
  return csvResponse(out, 'cercol_users.csv')
}

/** GET /admin/results?offset&limit&instrument */
export async function results(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const u = new URL(request.url)
  const offset = Math.max(0, parseInt(u.searchParams.get('offset') || '0', 10) || 0)
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get('limit') || '25', 10) || 25))
  const instrument = u.searchParams.get('instrument') || ''
  const { results: rows } = await env.DB.prepare(
    `SELECT r.id, r.created_at, r.instrument, r.language, r.user_id, r.presence, r.bond, r.discipline, r.depth, r.vision, p.email AS user_email
       FROM results r LEFT JOIN profiles p ON p.id = r.user_id
      WHERE ?3 = '' OR r.instrument = ?3 ORDER BY r.created_at DESC LIMIT ?1 OFFSET ?2`
  ).bind(limit + 1, offset, instrument).all()
  const { n: total } = await env.DB.prepare(`SELECT COUNT(*) AS n FROM results WHERE ?1 = '' OR instrument = ?1`).bind(instrument).first()
  const { cache } = await getNorms(env)
  const items = rows.slice(0, limit).map((r) => ({
    id: r.id, created_at: r.created_at, instrument: r.instrument, language: r.language,
    user_id: r.user_id, user_email: r.user_email, role: roleFor(r, cache),
  }))
  return Response.json({ total, has_more: rows.length > limit, items })
}

/** GET /admin/results/export.csv?instrument */
export async function resultsCsv(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const instrument = new URL(request.url).searchParams.get('instrument') || ''
  const { results: rows } = await env.DB.prepare(
    `SELECT r.id, r.created_at, r.instrument, r.language, r.user_id, r.presence, r.bond, r.discipline, r.depth, r.vision, p.email AS user_email
       FROM results r LEFT JOIN profiles p ON p.id = r.user_id WHERE ?1 = '' OR r.instrument = ?1 ORDER BY r.created_at DESC`).bind(instrument).all()
  const { cache } = await getNorms(env)
  let out = 'id,created_at,instrument,language,user_id,user_email,presence,bond,discipline,depth,vision,role\n'
  for (const r of rows) out += [r.id, r.created_at, r.instrument, r.language, r.user_id, r.user_email, r.presence, r.bond, r.discipline, r.depth, r.vision, roleFor(r, cache) || ''].map(csv).join(',') + '\n'
  return csvResponse(out, 'cercol_results.csv')
}

/** PATCH /admin/users/<id> — toggle premium / is_admin. */
export async function patchUser(env, request, userId) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const body = (await jsonBody(request)) || {}
  const updates = Object.entries(body).filter(([k, v]) => (k === 'premium' || k === 'is_admin') && v != null)
  if (!updates.length) return httpError(400, 'No fields to update')
  const set = updates.map(([k]) => `${k} = ?`).join(', ')
  await env.DB.prepare(`UPDATE profiles SET ${set} WHERE id = ?`).bind(...updates.map(([, v]) => (v ? 1 : 0)), userId).run()
  const row = await env.DB.prepare(`SELECT id, email, premium, is_admin FROM profiles WHERE id = ?`).bind(userId).first()
  if (!row) return httpError(404, 'User not found')
  return Response.json({ id: row.id, email: row.email, premium: bool(row.premium), is_admin: bool(row.is_admin) })
}

/** GET /admin/norms */
export async function norms(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const { cache, computedAt } = await getNorms(env)
  const tiers = {}
  for (const instr of INSTRUMENTS) {
    tiers[instr] = {}
    for (const lang of LANGS) {
      const [, label] = resolveNorm(instr, lang, cache)
      const ic = cache[instr] || {}
      const entry = ic[lang] || ic.__all__
      tiers[instr][lang] = { tier: label, n: entry ? entry[Object.keys(entry)[0]]?.n ?? null : null }
    }
    const all = (cache[instr] || {}).__all__
    tiers[instr].__all__ = { tier: all ? `empirical:${instr}:*` : 'prior', n: all ? all[Object.keys(all)[0]]?.n ?? null : null }
  }
  return Response.json({ computed_at: computedAt, norm_min_sample: NORM_MIN_SAMPLE, norm_refresh_days: NORM_REFRESH_DAYS, tiers })
}

/** POST /admin/norms/refresh */
export async function normsRefresh(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const { computedAt } = await getNorms(env, { force: true })
  return Response.json({ ok: true, computed_at: computedAt })
}

/** GET /admin/activity?days */
export async function activity(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const days = Math.min(90, Math.max(7, parseInt(new URL(request.url).searchParams.get('days') || '30', 10) || 30))
  const since = new Date(Date.now() - days * 86400e3).toISOString()
  const q = (t) => env.DB.prepare(`SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM ${t} WHERE created_at >= ? GROUP BY day ORDER BY day`).bind(since).all()
  const [reg, res] = await Promise.all([q('profiles'), q('results')])
  return Response.json({ days, registrations: reg.results, results: res.results })
}

/** GET /admin/translation-feedback?language&include_resolved&limit */
export async function feedbackList(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const u = new URL(request.url)
  const language = u.searchParams.get('language')
  const includeResolved = ['1', 'true', 'True'].includes(u.searchParams.get('include_resolved') || '')
  const limit = Math.min(500, Math.max(1, parseInt(u.searchParams.get('limit') || '100', 10) || 100))
  const clauses = [], args = []
  if (language) { clauses.push('language = ?'); args.push(language) }
  if (!includeResolved) clauses.push('resolved_at IS NULL')
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const { results } = await env.DB.prepare(
    `SELECT id, created_at, language, instrument, context, suggestion, item_id, item_text, resolved_at
       FROM translation_feedback ${where} ORDER BY created_at DESC LIMIT ?`).bind(...args, limit).all()
  return Response.json(results)
}

/** POST /admin/translation-feedback/<id>/resolve */
export async function feedbackResolve(env, request, id) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const r = await env.DB.prepare(`UPDATE translation_feedback SET resolved_at = ? WHERE id = ? AND resolved_at IS NULL`).bind(now(), id).run()
  if (!r.meta?.changes) return httpError(404, 'Not found or already resolved')
  return Response.json({ ok: true })
}

/** POST /admin/maintenance/purge-tokens */
export async function purgeTokens(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const ago = (d) => new Date(Date.now() - d * 86400e3).toISOString()
  const [m, e, r, o] = await env.DB.batch([
    env.DB.prepare(`DELETE FROM magic_tokens WHERE used_at IS NOT NULL OR expires_at < ?`).bind(ago(1)),
    env.DB.prepare(`DELETE FROM email_change_tokens WHERE used_at IS NOT NULL OR expires_at < ?`).bind(ago(1)),
    env.DB.prepare(`DELETE FROM refresh_tokens WHERE (revoked_at IS NOT NULL AND revoked_at < ?1) OR expires_at < ?1`).bind(ago(7)),
    env.DB.prepare(`DELETE FROM oauth_states WHERE expires_at < ?`).bind(ago(1)),
  ])
  return Response.json({
    magic_tokens_purged: m.meta?.changes || 0, email_change_tokens_purged: e.meta?.changes || 0,
    refresh_tokens_purged: r.meta?.changes || 0, oauth_states_purged: o.meta?.changes || 0,
  })
}

/**
 * POST /admin/jobs/<name>?dry_run=1 — run one scheduled job now.
 *
 * The server had `python -m jobs.<name>` for this. A Worker has no shell,
 * so the same lever is an admin endpoint. dry_run is honoured by the jobs
 * that have one (nudge, digest with send=false).
 */
export async function runJob(env, request, name) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const fn = NAMED[name]
  if (!fn) return httpError(404, `Unknown job. Known: ${Object.keys(NAMED).join(', ')}`)
  const u = new URL(request.url)
  const dry = ['1', 'true'].includes(u.searchParams.get('dry_run') || '')
  // ?urls=a,b limits pagespeed-ingest to a few targets: a full run of 20
  // analyses is longer than an HTTP client waits, fine for the cron.
  const urls = u.searchParams.get('urls')?.split(',').filter(Boolean)
  const t0 = Date.now()
  try {
    const result = await fn(env, ['weekly-digest', 'daily-brief'].includes(name) ? { send: !dry } : { dryRun: dry, urls })
    return Response.json({ job: name, dry_run: dry, ms: Date.now() - t0, result })
  } catch (e) {
    return Response.json({ job: name, dry_run: dry, ms: Date.now() - t0, error: e.message }, { status: 500 })
  }
}

/** GET /admin/probe?url= — one link probe, with the raw error, for debugging the sweep. */
export async function probeUrl(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const url = new URL(request.url).searchParams.get('url')
  if (!url) return httpError(400, 'url required')
  const out = {}
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': 'cercol-link-check/1.0' } })
      out[method] = r.status
    } catch (e) { out[method] = `ERR ${e.name}: ${e.message}` }
  }
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: { 'user-agent': 'cercol-link-check/1.0' }, signal: AbortSignal.timeout(10000) })
    out.HEAD_timeout = r.status
  } catch (e) { out.HEAD_timeout = `ERR ${e.name}: ${e.message}` }
  return Response.json(out)
}

/** GET /admin/bq?sql= — run one read query and return rows or the raw error. Admin debugging. */
export async function bqDebug(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const sql = new URL(request.url).searchParams.get('sql') || ''
  if (!/^\s*(select|with)\b/i.test(sql)) return httpError(400, 'SELECT/WITH only')
  try {
    const { query } = await import('./bigquery.js')
    const rows = await query(env, sql)
    return Response.json({ rows: rows.slice(0, 50), n: rows.length })
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }) }
}
