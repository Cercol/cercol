/**
 * Blog admin writes (create, update, status), plus /health and /robots.txt.
 *
 * # Spec: docs/architecture/backend.md
 *
 * The DOI gate is preserved: a body that cites a DOI doi.org reports as
 * 404 is refused with 422 and the list of offenders. Only a definitive
 * 404 is fatal; 302 (registered), 5xx and an unreachable resolver all
 * pass, because a doi.org outage must not block publishing. Same rule as
 * api/doi_check.py, and DOI_CHECK_SKIP=1 is the same escape hatch.
 */

import { requireAdmin } from './admin.js'
import { httpError, jsonBody, now, uuid } from './db.js'
import { extractDois, langsWithContent, RESOLVER } from './links.js'

/**
 * Drop what a write invalidates from the edge cache the two blog reads sit
 * behind (see `cached` in index.js). Best effort and colo-local: the Cache
 * API only reaches the colo serving this request, which is why the TTL there
 * is a minute rather than an hour.
 */
async function purgeBlogCache(request, slug) {
  try {
    const { origin } = new URL(request.url)
    await caches.default.delete(`${origin}/blog`)
    if (slug) await caches.default.delete(`${origin}/blog/${encodeURIComponent(slug)}`)
  } catch {
    // A cache miss on delete is not a failed publish.
  }
}

const POST_COLS = 'slug, status, title, description, content, cover_url, author, published_at, created_at, updated_at, view_count, category, complexity'

function rowToPost(row) {
  return {
    slug: row.slug, status: row.status, title: JSON.parse(row.title), description: JSON.parse(row.description),
    content: JSON.parse(row.content), coverUrl: row.cover_url, author: row.author, publishedAt: row.published_at,
    createdAt: row.created_at, updatedAt: row.updated_at, viewCount: row.view_count,
    category: row.category ?? 'general', complexity: row.complexity ?? 'intermediate',
  }
}

/** [(doi, langs)] for every DOI in content that doi.org answers 404 for. */
async function unresolvableDois(content) {
  const found = {}
  for (const lang of langsWithContent(content)) for (const d of extractDois(content[lang])) (found[d] ||= []).push(lang)
  const dead = []
  for (const [doi, langs] of Object.entries(found)) {
    let status = null
    try { status = (await fetch(`${RESOLVER}${doi}`, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(10000) })).status } catch { status = null }
    if (status === 404) dead.push([doi, langs])
  }
  return dead
}

async function rejectDeadDois(env, content) {
  if (env.DOI_CHECK_SKIP === '1' || !content) return null
  const dead = await unresolvableDois(content)
  if (!dead.length) return null
  return new Response(JSON.stringify({ detail: {
    error: 'unresolvable_doi',
    message: 'These DOIs do not resolve at doi.org. Verify the citation against Crossref and correct the digits.',
    dois: dead.map(([doi, langs]) => ({ doi, langs })),
  } }), { status: 422, headers: { 'content-type': 'application/json' } })
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)

/** POST /blog */
export async function createPost(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const b = await jsonBody(request)
  if (!b || typeof b.slug !== 'string' || !isObj(b.title) || !isObj(b.description) || !isObj(b.content)) return httpError(422, 'Invalid body')
  const bad = await rejectDeadDois(env, b.content); if (bad) return bad
  const status = b.status || 'draft', ts = now()
  const publishedAt = status === 'published' ? ts : null
  await env.DB.prepare(
    `INSERT INTO blog_posts (id, slug, status, title, description, content, cover_url, author, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(uuid(), b.slug, status, JSON.stringify(b.title), JSON.stringify(b.description), JSON.stringify(b.content),
         b.cover_url ?? null, b.author ?? null, publishedAt, ts, ts).run()
  const row = await env.DB.prepare(`SELECT ${POST_COLS} FROM blog_posts WHERE slug = ?`).bind(b.slug).first()
  await purgeBlogCache(request, b.slug)
  return Response.json(rowToPost(row))
}

/** PUT /blog/<slug> */
export async function updatePost(env, request, slug) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const b = (await jsonBody(request)) || {}
  const bad = await rejectDeadDois(env, b.content); if (bad) return bad
  const existing = await env.DB.prepare(`SELECT status, published_at FROM blog_posts WHERE slug = ?`).bind(slug).first()
  if (!existing) return httpError(404, 'Post not found')
  const updates = {}
  for (const k of ['title', 'description', 'content']) if (isObj(b[k])) updates[k] = JSON.stringify(b[k])
  for (const k of ['cover_url', 'author', 'status']) if (b[k] != null) updates[k] = String(b[k])
  if (!Object.keys(updates).length) return httpError(400, 'No fields to update')
  const newStatus = updates.status ?? existing.status
  if (newStatus === 'published' && existing.published_at == null) updates.published_at = now()
  const cols = Object.keys(updates)
  await env.DB.prepare(`UPDATE blog_posts SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = ? WHERE slug = ?`)
    .bind(...cols.map((c) => updates[c]), now(), slug).run()
  const row = await env.DB.prepare(`SELECT ${POST_COLS} FROM blog_posts WHERE slug = ?`).bind(slug).first()
  await purgeBlogCache(request, slug)
  return Response.json(rowToPost(row))
}

/** PATCH /blog/<slug>/status */
export async function patchStatus(env, request, slug) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const b = await jsonBody(request)
  if (!b || !['published', 'draft'].includes(b.status)) return httpError(400, "status must be 'published' or 'draft'")
  const existing = await env.DB.prepare(`SELECT published_at FROM blog_posts WHERE slug = ?`).bind(slug).first()
  if (!existing) return httpError(404, 'Post not found')
  const publishedAt = b.status === 'published' && existing.published_at == null ? now() : existing.published_at
  await env.DB.prepare(`UPDATE blog_posts SET status = ?, published_at = ?, updated_at = ? WHERE slug = ?`).bind(b.status, publishedAt, now(), slug).run()
  const row = await env.DB.prepare(`SELECT ${POST_COLS} FROM blog_posts WHERE slug = ?`).bind(slug).first()
  await purgeBlogCache(request, slug)
  return Response.json(rowToPost(row))
}

/** GET /health */
export const health = () => Response.json({ status: 'ok', version: '0.5.0' })

/** GET /robots.txt — the API hostname has nothing to index. */
export const robots = () => new Response('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } })
