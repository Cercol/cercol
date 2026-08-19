/**
 * Public write endpoints: funnel events, view counts, results, feedback.
 *
 * # Spec: docs/architecture/backend.md
 *
 * Each one mirrors its api/main.py or api/blog.py counterpart, including
 * the parts that look incidental and are not: the automated-client filter
 * that keeps Lighthouse out of the visitor count, the ten-minute
 * idempotency window on results, the Full Moon entitlement gate.
 */

import { bearerFrom, verifyAccessToken } from './jwt.js'
import { ensureProfile, httpError, jsonBody, now, uuid } from './db.js'

// api/blog.py: _EVENT_NAMES, plus test_progress, which the FastAPI never had.
// test_progress carries the milestone in `slug` as a bare percentage
// ('10'..'90'): it is the only free text column on `events`, one number does
// not earn a D1 migration, and no other event name uses slug for anything but
// an article. See src/hooks/useTrackTestStart.js.
const EVENT_NAMES = new Set(['article_view', 'cta_click', 'test_start', 'test_progress', 'page_view'])

// api/blog.py: _AUTOMATED_UA. Every entry is a self-identifying token; a bare
// "bot" is deliberately absent because it matches the CUBOT phone brand.
const AUTOMATED_UA = [
  'chrome-lighthouse', 'pagespeed', 'headless',
  'crawler', 'spider', 'slurp',
  'googlebot', 'bingbot', 'duckduckbot', 'yandexbot', 'baiduspider',
  'applebot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'slackbot', 'telegrambot', 'discordbot', 'whatsapp', 'petalbot',
  'google-notebooklm', 'gptbot', 'oai-searchbot', 'chatgpt-user',
  'claudebot', 'claude-web', 'anthropic-ai', 'perplexitybot', 'ccbot',
  'amazonbot', 'bytespider', 'meta-externalagent',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'screaming frog',
  'curl/', 'wget', 'python-requests', 'go-http-client', 'httpx', 'axios',
]

export function isAutomated(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase()
  return AUTOMATED_UA.some((t) => ua.includes(t))
}

/** The bearer's payload when present and valid, else null. Never throws. */
export async function optionalUser(env, request) {
  const tok = bearerFrom(request)
  return tok ? verifyAccessToken(env.JWT_SECRET, tok) : null
}

/** POST /events — one first-party funnel event, anonymous by design. */
export async function recordEvent(env, request) {
  const body = await jsonBody(request)
  if (!body || typeof body.name !== 'string') return httpError(422, 'Invalid body')
  if (!EVENT_NAMES.has(body.name)) return httpError(400, 'Unknown event name')
  if (isAutomated(request)) return Response.json({ ok: true, stored: false })
  await env.DB.prepare(
    `INSERT INTO events (id, name, slug, instrument, lang, path, anon_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(uuid(), body.name, body.slug ?? null, body.instrument ?? null, body.lang ?? null,
         body.path ?? null, body.anon_id ?? null, now()).run()
  return Response.json({ ok: true, stored: true })
}

/** POST /blog/<slug>/view — bump the reader counter, silent on unknown slug. */
export async function incrementView(env, request, slug) {
  if (!isAutomated(request)) {
    await env.DB.prepare(`UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = ?`)
      .bind(slug).run()
  }
  return Response.json({ ok: true })
}

const INSTRUMENTS = new Set(['newMoon', 'firstQuarter', 'fullMoon'])
const LANGS = new Set(['en', 'ca', 'es', 'fr', 'de', 'da'])
const DOMAINS = ['presence', 'bond', 'discipline', 'depth', 'vision']

/**
 * Validate a result body the way LogResultBody does: known instrument,
 * known language, and scores inside the instrument's own range
 * (New Moon is a 1..7 scale, the other two are 1..5). Returns an error
 * string or null.
 */
function validateResult(b) {
  if (!b || !INSTRUMENTS.has(b.instrument)) return 'instrument'
  if (b.language != null && !LANGS.has(b.language)) return 'language'
  const hi = b.instrument === 'newMoon' ? 7 : 5
  for (const d of DOMAINS) {
    const v = b[d]
    if (v == null) continue
    if (typeof v !== 'number' || Number.isNaN(v) || v < 1 || v > hi) return d
  }
  if (b.facets != null && (typeof b.facets !== 'object' || Array.isArray(b.facets))) return 'facets'
  return null
}

/** POST /results — log an instrument completion, anonymous or signed in. */
export async function logResult(env, request) {
  const body = await jsonBody(request)
  const bad = validateResult(body)
  if (bad) return httpError(422, `Invalid ${bad}`)

  const user = await optionalUser(env, request)
  const userId = user?.sub ?? null
  const db = env.DB

  if (userId) await ensureProfile(db, userId, user.email)

  // Full Moon persistence is premium-only (ADR 0018); beta accounts keep it.
  if (body.instrument === 'fullMoon') {
    const p = userId
      ? await db.prepare(`SELECT premium, is_beta FROM profiles WHERE id = ?`).bind(userId).first()
      : null
    if (!p || !(p.premium || p.is_beta)) return httpError(403, 'Forbidden')
  }

  // Idempotency: same identity, same instrument, same five scores inside ten
  // minutes is a resubmission (double click, reload), not a retest.
  if (userId || body.anon_id) {
    const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString().replace('Z', '+00:00')
    const dup = await db.prepare(
      `SELECT id FROM results
        WHERE instrument = ?1
          AND user_id IS ?2 AND anon_id IS ?3
          AND presence IS ?4 AND bond IS ?5 AND discipline IS ?6 AND depth IS ?7 AND vision IS ?8
          AND created_at > ?9
        ORDER BY created_at DESC LIMIT 1`
    ).bind(body.instrument, userId, body.anon_id ?? null,
           body.presence ?? null, body.bond ?? null, body.discipline ?? null,
           body.depth ?? null, body.vision ?? null, cutoff).first()
    if (dup) return Response.json({ id: dup.id, duplicate: true })
  }

  const id = uuid()
  await db.prepare(
    `INSERT INTO results (id, created_at, instrument, language, presence, bond, discipline, depth,
                          vision, facets, user_id, anon_id, utm_source, utm_medium, utm_campaign, referrer)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, now(), body.instrument, body.language ?? null,
         body.presence ?? null, body.bond ?? null, body.discipline ?? null, body.depth ?? null,
         body.vision ?? null, body.facets == null ? null : JSON.stringify(body.facets),
         userId, body.anon_id ?? null, body.utm_source ?? null, body.utm_medium ?? null,
         body.utm_campaign ?? null, body.referrer ?? null).run()
  return Response.json({ id })
}

/** POST /translation-feedback — a reader's suggested correction. */
export async function translationFeedback(env, request) {
  const body = await jsonBody(request)
  if (!body || typeof body.language !== 'string' || typeof body.suggestion !== 'string') {
    return httpError(422, 'Invalid body')
  }
  const suggestion = body.suggestion.trim().slice(0, 4000)
  if (!suggestion) return httpError(400, 'suggestion is required')
  const user = await optionalUser(env, request)
  await env.DB.prepare(
    `INSERT INTO translation_feedback
       (id, created_at, language, instrument, context, suggestion, item_id, item_text, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(uuid(), now(), body.language.slice(0, 12), body.instrument ?? null,
         (body.context || '').slice(0, 300), suggestion,
         Number.isInteger(body.itemId) ? body.itemId : null,
         (body.itemText || '').slice(0, 500) || null, user?.sub ?? null).run()
  return Response.json({ ok: true })
}

/** POST /results/<id>/accuracy — write-once 1..5, anonymous by design. */
export async function rateAccuracy(env, request, resultId) {
  const body = await jsonBody(request)
  const rating = body?.rating
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return httpError(400, 'rating must be between 1 and 5')
  const r = await env.DB.prepare(
    `UPDATE results SET accuracy_rating = ?, accuracy_rated_at = ? WHERE id = ? AND accuracy_rating IS NULL`
  ).bind(rating, now(), resultId).run()
  if (!r.meta?.changes) return httpError(409, 'Already rated')
  return Response.json({ ok: true })
}
