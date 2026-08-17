/**
 * Cèrcol API on Workers — the strangler proxy.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Everything in MIGRATED is answered here from D1. Everything else is
 * forwarded, unchanged, to the FastAPI server that still runs on Hetzner.
 * The migration is therefore a list that grows, and rolling any endpoint
 * back is removing it from that list and redeploying.
 *
 * The response shapes are not "close enough": they are byte-compared
 * against the live API by scripts/diff-api.mjs, so every projection here
 * mirrors api/blog.py exactly, including the camelCase keys, the null
 * handling and the ordering.
 */

// The Hetzner box, reached through a proxied hostname of our own zone.
// Workers refuse to fetch a bare IP (error 1003), and api.cercol.team is
// about to be this Worker, so fetching it would be fetching ourselves.
// origin.cercol.team is orange-clouded and points at 188.245.60.20; the
// Host header below is what makes Cloudflare present api.cercol.team as
// SNI to Caddy, which holds no certificate for any other name. Verified
// empirically: with the Host header the origin answers 200, without it 525.
const ORIGIN = 'https://origin.cercol.team'

import { recordEvent, incrementView, logResult, translationFeedback } from './writes.js'

// Paths this Worker owns. Order matters only for readability; each entry is
// tested with its own matcher below.
//
// The write endpoints are behind WRITES_LIVE, a plain env var flipped with
// `wrangler secret put` or the dashboard, no redeploy. Until it is "1" they
// keep proxying to Hetzner, which is what makes the cutover a single switch:
// flip it, and in the same minute copy the counters and results written on
// the server since the last sync. Reads and the view-count write must move
// together or the counters diverge (see scripts/diff-api.mjs, which caught
// exactly that drift during the first comparison).
const MIGRATED = [
  { method: 'GET', pattern: /^\/blog$/, handler: listPosts },
  { method: 'GET', pattern: /^\/blog\/([^/]+)$/, handler: getPost },
  { method: 'POST', pattern: /^\/events$/, handler: (env, m, req) => recordEvent(env, req), gated: true },
  { method: 'POST', pattern: /^\/blog\/([^/]+)\/view$/, handler: (env, m, req) => incrementView(env, req, decodeURIComponent(m[1])), gated: true },
  { method: 'POST', pattern: /^\/results$/, handler: (env, m, req) => logResult(env, req), gated: true },
  { method: 'POST', pattern: /^\/translation-feedback$/, handler: (env, m, req) => translationFeedback(env, req), gated: true },
]

const JSON_HEADERS = { 'content-type': 'application/json' }

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    for (const route of MIGRATED) {
      if (request.method !== route.method) continue
      if (route.gated && env.WRITES_LIVE !== '1') continue
      const m = url.pathname.match(route.pattern)
      if (m) return route.handler(env, m, request)
    }
    return proxyToOrigin(request, url)
  },
}

/**
 * Forward to the Hetzner box. The Host header has to say api.cercol.team or
 * Caddy answers with the wrong site block, so the request goes to the IP
 * with the hostname preserved.
 */
function proxyToOrigin(request, url) {
  const target = new URL(url.pathname + url.search, ORIGIN)
  const headers = new Headers(request.headers)
  headers.set('Host', 'api.cercol.team')
  return fetch(target, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  })
}

/**
 * GET /blog — every published post, list projection.
 *
 * `languages` is the set of language keys whose body is non-empty once
 * trimmed, which is what api/blog.py computes with jsonb_object_keys plus a
 * length(trim(...)) filter. SQLite has no trim-and-filter over a JSON object
 * in one expression, so the filtering happens here, over json_each.
 *
 * The ordering is published_at DESC NULLS LAST, id DESC. The id tiebreak is
 * load-bearing and not cosmetic: 25 articles share one published_at to the
 * microsecond, so dropping it reshuffles most of the index.
 */
async function listPosts(env) {
  const { results } = await env.DB.prepare(
    `SELECT slug, status, title, description, cover_url, author, published_at,
            view_count, category, complexity, content
       FROM blog_posts
      WHERE status = 'published'
      ORDER BY published_at IS NULL, published_at DESC, id DESC`
  ).all()

  const posts = results.map((row) => ({
    slug: row.slug,
    status: row.status,
    title: JSON.parse(row.title),
    description: JSON.parse(row.description),
    coverUrl: row.cover_url,
    author: row.author,
    publishedAt: row.published_at,
    viewCount: row.view_count,
    category: row.category ?? 'general',
    complexity: row.complexity ?? 'intermediate',
    languages: nonEmptyLanguages(row.content),
  }))
  return Response.json(posts)
}

/**
 * GET /blog/<slug> — one post, or a single-hop 308 to its successor.
 *
 * The successor must itself be a live post: that is what stops a chain
 * (B is only a redirect) and a cycle (A->B->A) from resolving. A redirect
 * whose target does not exist is a 404, same as api/blog.py.
 */
async function getPost(env, match) {
  const slug = decodeURIComponent(match[1])

  const row = await env.DB.prepare(
    `SELECT slug, status, title, description, content, cover_url, author,
            published_at, created_at, updated_at, view_count, category, complexity
       FROM blog_posts WHERE slug = ?`
  ).bind(slug).first()

  if (row) {
    return Response.json({
      slug: row.slug,
      status: row.status,
      title: JSON.parse(row.title),
      description: JSON.parse(row.description),
      content: JSON.parse(row.content),
      coverUrl: row.cover_url,
      author: row.author,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      viewCount: row.view_count,
      category: row.category ?? 'general',
      complexity: row.complexity ?? 'intermediate',
    })
  }

  const redirect = await env.DB.prepare(
    `SELECT slug_new FROM blog_slug_redirects WHERE slug_old = ?`
  ).bind(slug).first()

  if (redirect) {
    const target = await env.DB.prepare(
      `SELECT 1 AS ok FROM blog_posts WHERE slug = ?`
    ).bind(redirect.slug_new).first()
    if (target) {
      return new Response(null, {
        status: 308,
        headers: { location: `/blog/${redirect.slug_new}` },
      })
    }
  }

  return new Response(JSON.stringify({ detail: 'Post not found' }), {
    status: 404,
    headers: JSON_HEADERS,
  })
}

/** Language keys whose body has something other than whitespace in it. */
function nonEmptyLanguages(contentJson) {
  const content = JSON.parse(contentJson || '{}')
  return Object.keys(content).filter(
    (k) => typeof content[k] === 'string' && content[k].trim().length > 0
  )
}
