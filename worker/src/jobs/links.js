/**
 * External link check, mirroring api/jobs/external_links_check.py, but
 * paced for the free plan's 50 subrequests per invocation.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * The corpus has ~207 unique external URLs. One invocation probes up to
 * BATCH of them and stores the cursor in KV. BATCH is 15, not 40: each
 * probe can cost up to 3 retries plus a HEAD-to-GET fallback, so 15 URLs
 * is a worst case of ~60 fetches, and the observed average lands well
 * under the 50-subrequest cap with room for the KV and D1 calls; the cron fires again and
 * continues until the sweep is done, then writes the snapshot, compares
 * against the previous snapshot's broken set, and emails newly broken
 * links. Same classification as the server: 404 or a connection failure
 * is broken, 403/429/5xx/timeouts are flaky and not.
 *
 * Reading the corpus is free of the subrequest budget: it comes from D1,
 * not from HTTP.
 */

import { query, insertRows } from '../bigquery.js'
import { extractLinkTargets, extractDois, isInternal, langsWithContent, doiUrl, RESOLVER } from '../links.js'

const BATCH = 15
const STATE_KEY = 'links:sweep'

export const classifyBroken = (code) => code == null || code === 404

const PROBE_ERRORS = []
async function probe(url) {
  let last = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      let r = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: { 'user-agent': 'cercol-link-check/1.0' }, signal: AbortSignal.timeout(10000) })
      last = r.status
      if (r.status === 405 || r.status === 501) {
        r = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'cercol-link-check/1.0' }, signal: AbortSignal.timeout(10000) })
        last = r.status
      }
      return last
    } catch (e) {
      // Log the real reason: a null status is reported as broken, and the
      // first sweep marked 100 live URLs null without saying why.
      console.log(`[links] probe ${url} attempt ${attempt + 1}: ${e.name}: ${e.message}`)
      if (PROBE_ERRORS.length < 5) PROBE_ERRORS.push(`${url}: ${e.name}: ${e.message}`)
      if (attempt === 2) return last
    }
  }
  return last
}

/** [(slug, lang, url)] for every external link and bare DOI in every body, deduped. */
export async function collectExternalLinks(db) {
  const { results } = await db.prepare(`SELECT slug, content FROM blog_posts WHERE status = 'published'`).all()
  const seen = new Set(), out = []
  for (const row of results) {
    const content = JSON.parse(row.content || '{}')
    for (const lang of langsWithContent(content)) {
      const body = content[lang]
      const items = [
        ...extractLinkTargets(body).filter((u) => !isInternal(u)).map((u) => doiUrl(u)),
        ...extractDois(body).map((d) => `${RESOLVER}${d}`),
      ]
      for (const url of items) {
        const k = `${row.slug}\t${lang}\t${url}`
        if (!seen.has(k)) { seen.add(k); out.push([row.slug, lang, url]) }
      }
    }
  }
  return out
}

/** One cron tick: continue or start a sweep. Returns { done, probed, remaining }. */
export async function runLinksTick(env) {
  const kv = env.NORMS
  let state = kv ? await kv.get(STATE_KEY, 'json') : null
  if (!state) {
    const links = await collectExternalLinks(env.DB)
    const urls = [...new Set(links.map((l) => l[2]))]
    state = { startedAt: new Date().toISOString(), links, urls, statuses: {}, next: 0 }
  }
  const slice = state.urls.slice(state.next, state.next + BATCH)
  for (const url of slice) state.statuses[url] = await probe(url)
  state.next += slice.length
  const done = state.next >= state.urls.length
  if (!done) {
    if (kv) await kv.put(STATE_KEY, JSON.stringify(state), { expirationTtl: 86400 })
    return { done, probed: state.next, remaining: state.urls.length - state.next, errors: PROBE_ERRORS.splice(0) }
  }
  await finishSweep(env, state)
  if (kv) await kv.delete(STATE_KEY)
  return { done, probed: state.next, remaining: 0 }
}

async function finishSweep(env, state) {
  const now = new Date().toISOString(), tsDate = now.slice(0, 10)
  const rows = state.links.map(([slug, lang, url]) => ({
    ts: now, ts_date: tsDate, article_slug: slug, lang, url,
    status_code: state.statuses[url] ?? null, broken: classifyBroken(state.statuses[url] ?? null),
  }))
  const ds = env.BIGQUERY_DATASET_SEO || 'cercol_seo', pj = env.BIGQUERY_PROJECT || 'cercol'
  if (rows.length) await insertRows(env, ds, 'external_links_status', rows)
  const brokenNow = new Map(rows.filter((r) => r.broken).map((r) => [r.url, r]))
  if (!brokenNow.size) return
  let previous = new Set()
  try {
    const prev = await query(env, `SELECT DISTINCT url FROM \`${pj}.${ds}.external_links_status\` WHERE broken = TRUE AND ts = (SELECT MAX(ts) FROM \`${pj}.${ds}.external_links_status\` WHERE ts < TIMESTAMP('${state.startedAt}'))`)
    previous = new Set(prev.map((r) => r.url))
  } catch (e) {
    console.log(`[links] previous-broken query failed (${e.message}); treating as none`)
  }
  const fresh = [...brokenNow.values()].filter((r) => !previous.has(r.url))
  if (fresh.length && env.LINKS_ALERT_EMAIL) {
    const li = fresh.map((b) => `<li><code>${b.url}</code> (${b.status_code}) in ${b.article_slug} [${b.lang}]</li>`).join('')
    const html = `<p>${fresh.length} newly broken external link(s) found in blog articles:</p><ul>${li}</ul>`
    await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: 'Cèrcol <noreply@cercol.team>', to: [env.LINKS_ALERT_EMAIL], subject: 'Cercol: new broken external links', html }),
    })
  }
}
