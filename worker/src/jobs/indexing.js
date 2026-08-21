/**
 * What Google actually thinks of the pages, from the Search Console API.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * The BigQuery export already tells the brief how a page performed. It says
 * nothing about whether Google is willing to index it, which is the failure
 * that cost 276 URLs in August 2026: the move to Cloudflare downgraded the
 * trailing-slash redirect from 301 to 307, Google kept the slashless URL and
 * dropped the canonical one, and the first anyone heard of it was a
 * validation-failed email eleven days later.
 *
 * There is no API for the "Page indexing" report itself. There are two that
 * carry the same signal:
 *
 *   - Sitemaps: when Google last downloaded it, and its error and warning
 *     counts. One request.
 *   - URL Inspection: per URL, the verdict, the coverage state and the
 *     canonical Google chose. A canonical that is not the URL asked about is
 *     precisely what a 307 looks like from Google's side. 2,000 a day are
 *     allowed; the brief spends a handful on the pages people actually
 *     landed on, because an indexing problem only costs something where
 *     there was traffic to lose.
 *
 * Silent no-op until the service account in GOOGLE_SA_JSON is added as a
 * user of the Search Console property (Settings, Users and permissions,
 * Restricted is enough). Until then every call is a 403 and the brief simply
 * says nothing, rather than nagging daily about a permission.
 *
 * Runs on the 05:00 trigger and leaves its answer in KV, rather than inside
 * the 04:00 one that sends the brief. The free plan allows 50 subrequests
 * per invocation and that trigger already carries four jobs, one of which
 * (the link sweep) is itself paced at 15 probes for exactly this reason.
 * Nine more could have taken the brief down with it. The brief reads the
 * snapshot instead, one KV get, and a verdict from Google a few hours old is
 * the same verdict.
 */

import { accessToken } from '../bigquery.js'
import { KV_KEY as LANGUAGES_KEY } from './languages.js'

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const API = 'https://searchconsole.googleapis.com'
// Pages inspected per run. Each is one subrequest and the Worker gets 50.
export const INSPECT_LIMIT = 6
// A sitemap Google has not fetched in this long is a sitemap it has lost
// interest in, or one that started answering something other than 200.
export const SITEMAP_STALE_DAYS = 7

/** Google's verdict strings, shortened for a line in an email. */
const clean = (s) => String(s || '').replace(/_/g, ' ').toLowerCase()

async function scFetch(tok, path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json', ...(init.headers || {}) },
  })
  if (!res.ok) throw new Error(`search console ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

/**
 * Inspect a handful of pages and read the sitemap's own health.
 *
 * @param {string[]} paths site-relative paths, most important first
 */
export async function gatherIndexing(env, paths = [], { now = Date.now() } = {}) {
  if (!env.GOOGLE_SA_JSON) return { pending: true }
  const site = env.GSC_SITE_URL || 'sc-domain:cercol.team'
  const origin = env.FRONTEND_URL || 'https://cercol.team'
  try {
    const tok = await accessToken(env, SCOPE)
    const out = { site, problems: [], sitemap: null }

    const list = await scFetch(tok, `/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps`)
    const sm = (list.sitemap || [])[0]
    if (sm) {
      const age = sm.lastDownloaded ? Math.floor((now - Date.parse(sm.lastDownloaded)) / 86400e3) : null
      out.sitemap = { path: sm.path, errors: Number(sm.errors || 0), warnings: Number(sm.warnings || 0), ageDays: age }
    }

    // Unique, canonical (trailing slash) forms of the pages that had traffic.
    const seen = new Set()
    const urls = []
    for (const p of paths) {
      const url = `${origin}${p.endsWith('/') ? p : `${p}/`}`
      if (seen.has(url)) continue
      seen.add(url)
      urls.push(url)
      if (urls.length >= INSPECT_LIMIT) break
    }

    for (const url of urls) {
      const r = await scFetch(tok, '/v1/urlInspection/index:inspect', {
        method: 'POST',
        body: JSON.stringify({ inspectionUrl: url, siteUrl: site }),
      })
      const s = r.inspectionResult?.indexStatusResult || {}
      // A canonical Google picked that is not the URL asked about means the
      // page is not the one competing in search, whatever the verdict says.
      const wrongCanonical = s.googleCanonical && s.googleCanonical.replace(/\/$/, '') !== url.replace(/\/$/, '')
      if (s.verdict === 'PASS' && !wrongCanonical) continue
      out.problems.push({
        url,
        state: clean(s.coverageState) || clean(s.verdict) || 'unknown',
        googleCanonical: wrongCanonical ? s.googleCanonical : null,
      })
    }
    return out
  } catch (e) {
    return { pending: true, error: e.message }
  }
}

export const KV_KEY = 'seo:indexing'

/**
 * Gather and leave the snapshot in KV for the next brief to read. The pages
 * worth inspecting are the ones that had traffic: one D1 query, rather than
 * making the caller pass them in and pay for it inside its own budget.
 */
export async function runIndexing(env) {
  // The language-gap job runs first and leaves the versions that took no
  // impressions at all. Those are where "is this even indexed" is an open
  // question, so they go to the front: a page with traffic is plainly
  // indexed, and asking Google about it confirms what we already know. Half
  // the budget at most, so a long gap list cannot crowd out the home page.
  const gaps = env.NORMS ? await env.NORMS.get(LANGUAGES_KEY, 'json') : null
  const gapPaths = (gaps?.gaps || []).slice(0, Math.floor(INSPECT_LIMIT / 2)).map((g) => `/${g.lang}/blog/${g.slug}/`)
  const since = new Date(Date.now() - 2 * 86400e3).toISOString()
  const { results } = await env.DB.prepare(
    `SELECT path, COUNT(*) AS n FROM events
      WHERE name='page_view' AND path IS NOT NULL AND created_at >= ?
      GROUP BY path ORDER BY n DESC LIMIT ?`
  ).bind(since, INSPECT_LIMIT).all()
  const out = await gatherIndexing(env, ['/', ...gapPaths, ...results.map((r) => r.path)])
  if (env.NORMS) await env.NORMS.put(KV_KEY, JSON.stringify({ ...out, at: new Date().toISOString() }), { expirationTtl: 3 * 86400 })
  return { pending: !!out.pending, error: out.error || null, problems: out.problems?.length || 0 }
}

/** The lines the brief should act on, most costly first. Empty when healthy. */
export function indexingActions(ix) {
  if (!ix || ix.pending) return []
  const out = []
  for (const p of ix.problems) {
    out.push(p.googleCanonical
      ? `Google indexes ${p.googleCanonical} instead of ${p.url} (${p.state}). Whatever points at the second one is spending its authority on a URL that is not in the index.`
      : `${p.url} is not indexed: ${p.state}.`)
  }
  const sm = ix.sitemap
  if (sm && sm.errors > 0) out.push(`The sitemap ${sm.path} has ${sm.errors} error(s) in Search Console.`)
  if (sm && sm.ageDays != null && sm.ageDays >= SITEMAP_STALE_DAYS) {
    out.push(`Google last downloaded ${sm.path} ${sm.ageDays} days ago. It fetches a healthy sitemap far more often than that.`)
  }
  return out
}
