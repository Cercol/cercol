/**
 * PageSpeed ingest: PSI v5 for the top GSC URLs, both devices, into
 * cercol_seo.pagespeed_runs. Mirrors api/jobs/pagespeed_ingest.py.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Budget: 20 URLs x 2 devices = 40 PSI calls plus one BigQuery query and
 * one insert, inside the free plan's 50 subrequests per invocation. TOP_N
 * is therefore capped at 20 here on purpose; raising it needs the run
 * split across two cron firings.
 */

import { query, insertRows } from '../bigquery.js'

const PSI = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const DEVICES = ['mobile', 'desktop']
const TOP_N = 20
export const SEED_URLS = [
  'https://cercol.team/', 'https://cercol.team/science/', 'https://cercol.team/instruments/',
  'https://cercol.team/roles/', 'https://cercol.team/about/', 'https://cercol.team/faq/',
  'https://cercol.team/blog/', 'https://cercol.team/blog/critiques-of-big-five-what-critics-say/',
  'https://cercol.team/blog/personality-science-evidence-based-hr-why-it-matters/',
]

export async function selectTopUrls(env, { topN = TOP_N, days = 14 } = {}) {
  const gsc = `${env.BIGQUERY_PROJECT || 'cercol'}.${env.BIGQUERY_DATASET_GSC || 'searchconsole'}.searchdata_url_impression`
  try {
    const rows = await query(env, `SELECT url, SUM(impressions) AS impressions FROM \`${gsc}\` WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY) GROUP BY url ORDER BY impressions DESC LIMIT ${topN}`)
    const urls = rows.map((r) => r.url)
    return urls.length ? urls : SEED_URLS
  } catch (e) {
    console.log(`[pagespeed] GSC top-URL query failed (${e.message}); seed list`)
    return SEED_URLS
  }
}

async function fetchPsi(url, device, key, retries = 3) {
  const params = new URLSearchParams({ url, strategy: device, key })
  for (const c of ['performance', 'accessibility', 'seo', 'best-practices']) params.append('category', c)
  let last
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(`${PSI}?${params}`)
    if (res.ok) return res.json()
    last = res.status
    if (![429, 500, 502, 503, 504].includes(res.status) || attempt === retries) break
    await new Promise((r) => setTimeout(r, 2 ** attempt * 1000))
  }
  throw new Error(`PSI ${url} (${device}) failed: ${last}`)
}

/** api/jobs/pagespeed_ingest.py:parse_psi, same fields, same rounding. */
export function parsePsi(payload, url, device, runTs) {
  const lh = payload.lighthouseResult || {}, audits = lh.audits || {}, cats = lh.categories || {}
  const loading = payload.loadingExperience?.metrics || {}
  const num = (n) => { const v = audits[n]?.numericValue; return v == null ? null : Math.round(Number(v)) }
  const score = (c) => { const v = cats[c]?.score; return v == null ? null : Math.round(Number(v) * 100) }
  const p75 = (m) => { const v = loading[m]?.percentile; return typeof v === 'number' ? Math.trunc(v) : null }
  const cls = audits['cumulative-layout-shift']?.numericValue
  return {
    run_ts: runTs, run_date: runTs.slice(0, 10), url, device,
    lcp_ms: num('largest-contentful-paint'), fid_ms: p75('FIRST_INPUT_DELAY_MS'), inp_ms: p75('INTERACTION_TO_NEXT_PAINT'),
    cls: cls == null ? null : Number(cls), fcp_ms: num('first-contentful-paint'), ttfb_ms: num('server-response-time'),
    performance_score: score('performance'), accessibility_score: score('accessibility'),
    seo_score: score('seo'), best_practices_score: score('best-practices'),
  }
}

export async function runPagespeed(env, { urls } = {}) {
  const key = env.PAGESPEED_API_KEY
  if (!key) throw new Error('PAGESPEED_API_KEY missing')
  const now = new Date().toISOString()
  const targets = urls || (await selectTopUrls(env))
  const rows = [], errors = []
  for (const url of targets) {
    for (const device of DEVICES) {
      try {
        rows.push({ ...parsePsi(await fetchPsi(url, device, key), url, device, now), ingested_at: now })
      } catch (e) {
        console.log(`[pagespeed] ${e.message}`)
        errors.push(`${url} ${device}: ${e.message}`.slice(0, 200))
      }
    }
  }
  if (rows.length) await insertRows(env, env.BIGQUERY_DATASET_SEO || 'cercol_seo', 'pagespeed_runs', rows)
  return { pagespeed_runs: rows.length, urls: targets.length, errors: errors.slice(0, 4) }
}
