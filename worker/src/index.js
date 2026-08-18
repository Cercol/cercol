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

// The Hetzner box, by a name of its own. Workers refuse to fetch a bare IP
// (error 1003), and api.cercol.team is about to be this Worker, so fetching
// it would be fetching ourselves. origin.cercol.team is DNS-only, points at
// 188.245.60.20, and Caddy holds a certificate for it (api/deploy/caddy):
// a plain TLS connection, no header tricks. Requests are proxied with the
// Host of the origin name, which is in the same Caddy site block as api.
const ORIGIN = 'https://origin.cercol.team'

import { recordEvent, incrementView, logResult, translationFeedback } from './writes.js'
import {
  magicLinkRequest, magicLinkVerify, refresh, signout, googleStart, googleCallback,
  me, getProfile, patchProfile, myResults, anonymiseResult, betaStatus, passwordGone,
} from './auth.js'
import { createSessions, getSession, completeSession, mySessions, myContributions } from './witness.js'
import {
  createGroup, inviteToGroup, removeMember, startWitnessRound, myGroups, pendingInvitations,
  acceptInvitation, declineInvitation, reportData,
} from './groups.js'
import { createCheckout, stripeWebhook } from './stripe.js'
import * as admin from './admin.js'
import * as seo from './seo.js'
import { createPost, updatePost, patchStatus, health, robots } from './blog-admin.js'
import { scheduled } from './scheduled.js'
import { rateAccuracy } from './writes.js'
import { emailChangeRequest, emailChangeConfirm } from './auth.js'

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
  { method: 'GET', pattern: /^\/health$/, handler: () => health() },
  { method: 'GET', pattern: /^\/robots\.txt$/, handler: () => robots() },
  { method: 'POST', pattern: /^\/blog$/, handler: (env, m, req) => createPost(env, req), gated: true },
  { method: 'PUT', pattern: /^\/blog\/([^/]+)$/, handler: (env, m, req) => updatePost(env, req, decodeURIComponent(m[1])), gated: true },
  { method: 'PATCH', pattern: /^\/blog\/([^/]+)\/status$/, handler: (env, m, req) => patchStatus(env, req, decodeURIComponent(m[1])), gated: true },
  { method: 'POST', pattern: /^\/events$/, handler: (env, m, req) => recordEvent(env, req), gated: true },
  { method: 'POST', pattern: /^\/blog\/([^/]+)\/view$/, handler: (env, m, req) => incrementView(env, req, decodeURIComponent(m[1])), gated: true },
  { method: 'POST', pattern: /^\/results$/, handler: (env, m, req) => logResult(env, req), gated: true },
  { method: 'POST', pattern: /^\/translation-feedback$/, handler: (env, m, req) => translationFeedback(env, req), gated: true },
  // Auth and the /me family. Same gate: they write to auth tables that are
  // only authoritative once the user rows have been copied across.
  { method: 'POST', pattern: /^\/auth\/magic-link\/request$/, handler: (env, m, req) => magicLinkRequest(env, req), gated: true },
  { method: 'POST', pattern: /^\/auth\/magic-link\/verify$/, handler: (env, m, req) => magicLinkVerify(env, req), gated: true },
  { method: 'POST', pattern: /^\/auth\/refresh$/, handler: (env, m, req) => refresh(env, req), gated: true },
  { method: 'POST', pattern: /^\/auth\/signout$/, handler: (env, m, req) => signout(env, req), gated: true },
  { method: 'GET', pattern: /^\/auth\/google$/, handler: (env) => googleStart(env), gated: true },
  { method: 'GET', pattern: /^\/auth\/google\/callback$/, handler: (env, m, req) => googleCallback(env, req), gated: true },
  { method: 'POST', pattern: /^\/auth\/password\/(signup|signin)$/, handler: () => passwordGone(), gated: true },
  { method: 'POST', pattern: /^\/me\/password$/, handler: () => passwordGone(), gated: true },
  { method: 'GET', pattern: /^\/me$/, handler: (env, m, req) => me(env, req), gated: true },
  { method: 'GET', pattern: /^\/me\/profile$/, handler: (env, m, req) => getProfile(env, req), gated: true },
  { method: 'PATCH', pattern: /^\/me\/profile$/, handler: (env, m, req) => patchProfile(env, req), gated: true },
  { method: 'GET', pattern: /^\/me\/results$/, handler: (env, m, req) => myResults(env, req), gated: true },
  { method: 'DELETE', pattern: /^\/me\/results\/([^/]+)$/, handler: (env, m, req) => anonymiseResult(env, req, m[1]), gated: true },
  { method: 'GET', pattern: /^\/beta$/, handler: (env) => betaStatus(env), gated: true },
  // Witness (Testimoni).
  { method: 'POST', pattern: /^\/witness\/sessions$/, handler: (env, m, req, ctx) => createSessions(env, req, ctx), gated: true },
  { method: 'GET', pattern: /^\/witness\/session\/([^/]+)$/, handler: (env, m) => getSession(env, m[1]), gated: true },
  { method: 'POST', pattern: /^\/witness\/session\/([^/]+)\/complete$/, handler: (env, m, req, ctx) => completeSession(env, req, m[1], ctx), gated: true },
  { method: 'GET', pattern: /^\/witness\/my-sessions$/, handler: (env, m, req) => mySessions(env, req), gated: true },
  { method: 'GET', pattern: /^\/witness\/my-contributions$/, handler: (env, m, req) => myContributions(env, req), gated: true },
  // Groups. /mine and /pending must precede the /<id>/... matchers only in
  // spirit; the patterns are anchored so 'mine' never matches as an id here.
  { method: 'POST', pattern: /^\/groups$/, handler: (env, m, req, ctx) => createGroup(env, req, ctx), gated: true },
  { method: 'GET', pattern: /^\/groups\/mine$/, handler: (env, m, req) => myGroups(env, req), gated: true },
  { method: 'GET', pattern: /^\/groups\/pending$/, handler: (env, m, req) => pendingInvitations(env, req), gated: true },
  { method: 'POST', pattern: /^\/groups\/([^/]+)\/invite$/, handler: (env, m, req, ctx) => inviteToGroup(env, req, m[1], ctx), gated: true },
  { method: 'DELETE', pattern: /^\/groups\/([^/]+)\/members$/, handler: (env, m, req) => removeMember(env, req, m[1]), gated: true },
  { method: 'POST', pattern: /^\/groups\/([^/]+)\/witness-round$/, handler: (env, m, req, ctx) => startWitnessRound(env, req, m[1], ctx), gated: true },
  { method: 'POST', pattern: /^\/groups\/([^/]+)\/accept$/, handler: (env, m, req) => acceptInvitation(env, req, m[1]), gated: true },
  { method: 'POST', pattern: /^\/groups\/([^/]+)\/decline$/, handler: (env, m, req) => declineInvitation(env, req, m[1]), gated: true },
  { method: 'GET', pattern: /^\/groups\/([^/]+)\/report-data$/, handler: (env, m, req) => reportData(env, req, m[1]), gated: true },
  // Remaining public writes and auth.
  { method: 'POST', pattern: /^\/results\/([^/]+)\/accuracy$/, handler: (env, m, req) => rateAccuracy(env, req, m[1]), gated: true },
  { method: 'POST', pattern: /^\/auth\/email\/change-request$/, handler: (env, m, req) => emailChangeRequest(env, req), gated: true },
  { method: 'POST', pattern: /^\/auth\/email\/change-confirm$/, handler: (env, m, req) => emailChangeConfirm(env, req), gated: true },
  // Stripe.
  { method: 'POST', pattern: /^\/checkout$/, handler: (env, m, req) => createCheckout(env, req), gated: true },
  { method: 'POST', pattern: /^\/webhooks\/stripe$/, handler: (env, m, req) => stripeWebhook(env, req), gated: true },
  // Admin.
  { method: 'GET', pattern: /^\/admin\/stats$/, handler: (env, m, req) => admin.stats(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/users$/, handler: (env, m, req) => admin.users(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/users\/export\.csv$/, handler: (env, m, req) => admin.usersCsv(env, req), gated: true },
  { method: 'PATCH', pattern: /^\/admin\/users\/([^/]+)$/, handler: (env, m, req) => admin.patchUser(env, req, m[1]), gated: true },
  { method: 'GET', pattern: /^\/admin\/results$/, handler: (env, m, req) => admin.results(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/results\/export\.csv$/, handler: (env, m, req) => admin.resultsCsv(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/norms$/, handler: (env, m, req) => admin.norms(env, req), gated: true },
  { method: 'POST', pattern: /^\/admin\/norms\/refresh$/, handler: (env, m, req) => admin.normsRefresh(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/activity$/, handler: (env, m, req) => admin.activity(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/translation-feedback$/, handler: (env, m, req) => admin.feedbackList(env, req), gated: true },
  { method: 'POST', pattern: /^\/admin\/translation-feedback\/([^/]+)\/resolve$/, handler: (env, m, req) => admin.feedbackResolve(env, req, m[1]), gated: true },
  { method: 'POST', pattern: /^\/admin\/maintenance\/purge-tokens$/, handler: (env, m, req) => admin.purgeTokens(env, req), gated: true },
  { method: 'POST', pattern: /^\/admin\/jobs\/([a-z-]+)$/, handler: (env, m, req) => admin.runJob(env, req, m[1]), gated: true },
  { method: 'GET', pattern: /^\/admin\/probe$/, handler: (env, m, req) => admin.probeUrl(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/bq$/, handler: (env, m, req) => admin.bqDebug(env, req), gated: true },
  // Admin SEO (api/seo.py).
  { method: 'GET', pattern: /^\/admin\/seo\/sources$/, handler: (env, m, req) => seo.sources(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/seo\/health$/, handler: (env, m, req) => seo.health(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/seo\/queries$/, handler: (env, m, req) => seo.queries(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/seo\/pages$/, handler: (env, m, req) => seo.pages(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/seo\/anomalies$/, handler: (env, m, req) => seo.anomalies(env, req), gated: true },
  { method: 'GET', pattern: /^\/admin\/seo\/page\/(.+)\/lifecycle$/, handler: (env, m, req) => seo.pageLifecycle(env, req, m[1]), gated: true },
]

const JSON_HEADERS = { 'content-type': 'application/json' }

// api/main.py: ALLOWED_ORIGINS. Same three, credentials allowed, any
// method and header. Applied to every response the Worker produces itself;
// proxied responses already carry the server's, which is the same policy.
const ALLOWED_ORIGINS = new Set(['https://cercol.team', 'http://localhost:5173', 'http://localhost:4173'])

function withCors(response, request) {
  const origin = request.headers.get('origin')
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return response
  const h = new Headers(response.headers)
  h.set('access-control-allow-origin', origin)
  h.set('access-control-allow-credentials', 'true')
  h.append('vary', 'Origin')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: h })
}

function preflight(request) {
  const origin = request.headers.get('origin')
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return new Response(null, { status: 400 })
  return new Response(null, {
    status: 200,
    headers: {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT',
      'access-control-allow-headers': request.headers.get('access-control-request-headers') || '*',
      'access-control-max-age': '600',
      vary: 'Origin',
    },
  })
}

export default {
  scheduled,
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    for (const route of MIGRATED) {
      if (route.gated && env.WRITES_LIVE !== '1') continue
      const m = url.pathname.match(route.pattern)
      if (!m) continue
      if (request.method === 'OPTIONS') return preflight(request)
      if (request.method !== route.method) continue
      return withCors(await route.handler(env, m, request, ctx), request)
    }
    return proxyToOrigin(request, url)
  },
}

/**
 * Forward to the Hetzner box, unchanged. Method, headers, body and query
 * pass through; redirects are not followed so a 308 from the origin reaches
 * the client as a 308.
 */
function proxyToOrigin(request, url) {
  const target = new URL(url.pathname + url.search, ORIGIN)
  const headers = new Headers(request.headers)
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
  // `languages` used to be derived by JSON.parsing every article body in
  // all six languages on every request (~10 MB of JSON per call), which put
  // CPU p90 at 69 ms and p99 at 111 ms against a 10 ms free budget. Doing
  // it in SQLite with json_each fails on one row whose content is not
  // strictly valid JSON for the engine (SQLITE_ERROR malformed JSON), so
  // the check is a cheap string test instead: a language key is present
  // when the JSON object holds it with a non-empty string value. Regex over
  // the raw column, no parse; the bodies never leave the database.
  const langs = ['en', 'ca', 'es', 'fr', 'de', 'da']
  const cases = langs.map((l) =>
    `CASE WHEN b.content GLOB '*"${l}":"[^"]*' AND b.content NOT GLOB '*"${l}":""*' AND b.content NOT GLOB '*"${l}":" *' THEN '${l}' END AS has_${l}`
  ).join(', ')
  const { results } = await env.DB.prepare(
    `SELECT b.slug, b.status, b.title, b.description, b.cover_url, b.author, b.published_at,
            b.view_count, b.category, b.complexity, ${cases}
       FROM blog_posts b
      WHERE b.status = 'published'
      ORDER BY b.published_at IS NULL, b.published_at DESC, b.id DESC`
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
    // Alphabetical: Postgres jsonb stores object keys sorted, so the server
    // always emitted ca, da, de, en, es, fr in that order.
    languages: langs.filter((l) => row[`has_${l}`]).sort(),
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

