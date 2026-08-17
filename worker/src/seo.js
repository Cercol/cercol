/**
 * Admin SEO read endpoints, mirroring api/seo.py: the six /admin/seo/*
 * routes the dashboard calls, on BigQuery, cached in KV for an hour.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Every query returns [] on failure so "no data" and "unavailable" look
 * the same to the UI, which sets data_pending from row counts. Same
 * behaviour as the server's _query.
 */

import { requireAdmin } from './admin.js'
import { query } from './bigquery.js'

const CACHE_TTL_S = 3600
const cfg = (env) => ({ p: env.BIGQUERY_PROJECT || 'cercol', sd: env.BIGQUERY_DATASET_SEO || 'cercol_seo', sg: env.BIGQUERY_DATASET_GSC || 'searchconsole' })

async function q(env, sql) { try { return await query(env, sql) } catch (e) { console.log(`[seo] query failed: ${e.message}`); return [] } }

async function cached(env, key, producer) {
  const k = `seo:${key}`
  if (env.NORMS) { const hit = await env.NORMS.get(k, 'json'); if (hit) return hit }
  const v = await producer()
  if (env.NORMS) await env.NORMS.put(k, JSON.stringify(v), { expirationTtl: CACHE_TTL_S })
  return v
}

const gscPresent = async (env) => (await q(env, `SELECT 1 AS x FROM \`${cfg(env).p}.${cfg(env).sg}.INFORMATION_SCHEMA.TABLES\` WHERE table_name = 'searchdata_url_impression' LIMIT 1`)).length > 0
const int = (v) => (v == null ? 0 : parseInt(v, 10))
const ctr = (c, i) => (int(i) ? int(c) / int(i) : 0)
const clamp = (v, lo, hi, d) => { if (v == null || v === '') return d; const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d }

/** GET /admin/seo/sources */
export async function sources(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  return Response.json(await cached(env, 'sources', async () => {
    const { p, sd, sg } = cfg(env)
    const one = async (name, table, dateCol) => {
      const rows = await q(env, `SELECT COUNT(*) AS n, MAX(${dateCol}) AS last FROM \`${table}\``)
      return { name, table, row_count: int(rows[0]?.n), last_update: rows[0]?.last ?? null }
    }
    const out = { sources: [
      await one('bing_query_stats', `${p}.${sd}.bing_query_stats`, 'date'),
      await one('bing_page_stats', `${p}.${sd}.bing_page_stats`, 'date'),
      await one('bing_crawl_stats', `${p}.${sd}.bing_crawl_stats`, 'date'),
      await one('pagespeed_runs', `${p}.${sd}.pagespeed_runs`, 'run_date'),
      await one('crawl_logs', `${p}.${sd}.crawl_logs`, 'ts_date'),
    ] }
    const gsc = await q(env, `SELECT table_name FROM \`${p}.${sg}.INFORMATION_SCHEMA.TABLES\` WHERE table_name LIKE 'searchdata_%'`)
    out.gsc = { dataset: `${p}.${sg}`, tables_present: gsc.map((r) => r.table_name), bulk_export_ready: gsc.length > 0 }
    return out
  }))
}

/** GET /admin/seo/health */
export async function health(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  return Response.json(await cached(env, 'health', async () => {
    const { p, sd, sg } = cfg(env)
    const out = { data_pending: false }
    const bing = (await q(env, `SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks FROM \`${p}.${sd}.bing_query_stats\` WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)`))[0] || {}
    out.bing_28d = { impressions: int(bing.impressions), clicks: int(bing.clicks) }
    if (await gscPresent(env)) {
      const g = (await q(env, `SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks FROM \`${p}.${sg}.searchdata_url_impression\` WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)`))[0] || {}
      out.gsc_28d = { impressions: int(g.impressions), clicks: int(g.clicks), available: true }
    } else { out.gsc_28d = { available: false }; out.data_pending = true }
    const psi = await q(env, `SELECT url, MAX(run_ts) AS last_run, ANY_VALUE(performance_score HAVING MAX run_ts) AS performance_score, ANY_VALUE(lcp_ms HAVING MAX run_ts) AS lcp_ms FROM \`${p}.${sd}.pagespeed_runs\` WHERE device = 'mobile' GROUP BY url ORDER BY last_run DESC LIMIT 20`)
    out.pagespeed_latest_mobile = psi.map((r) => ({ url: r.url, score: r.performance_score ?? null, lcp_ms: r.lcp_ms ?? null }))
    const crawl = await q(env, `SELECT bot_name, COUNT(*) AS hits FROM \`${p}.${sd}.crawl_logs\` WHERE ts_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) GROUP BY bot_name ORDER BY hits DESC`)
    out.crawl_7d_by_bot = crawl.map((r) => ({ bot: r.bot_name, hits: int(r.hits) }))
    return out
  }))
}

/**
 * GET /admin/seo/queries?period_days&min_impressions&limit
 *
 * Two departures from api/seo.py, both deliberate. The server's HAVING
 * SUM(impressions) is an aggregation of an aggregation, which BigQuery
 * rejects; the server's _query swallowed that and returned [], so this
 * endpoint had never returned a row. HAVING now names the alias. And
 * query IS NOT NULL drops Google's anonymised bucket, which otherwise
 * sits at the top with most of the impressions and no text, the same
 * fix the weekly digest got in #136.
 */
export async function queries(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const u = new URL(request.url)
  const periodDays = clamp(u.searchParams.get('period_days'), 1, 180, 28), minImpr = clamp(u.searchParams.get('min_impressions'), 0, 1e9, 0), limit = clamp(u.searchParams.get('limit'), 1, 500, 50)
  return Response.json(await cached(env, `queries:${periodDays}:${minImpr}:${limit}`, async () => {
    const { p, sd, sg } = cfg(env)
    const out = { period_days: periodDays, queries: [], data_pending: false }
    const shape = (r) => ({ query: r.query, impressions: int(r.impressions), clicks: int(r.clicks), avg_position: r.avg_position == null ? null : Number(r.avg_position), ctr: ctr(r.clicks, r.impressions) })
    if (await gscPresent(env)) {
      const rows = await q(env, `SELECT query, SUM(impressions) AS impressions, SUM(clicks) AS clicks, AVG(sum_position/impressions) AS avg_position FROM \`${p}.${sg}.searchdata_url_impression\` WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${periodDays} DAY) AND query IS NOT NULL GROUP BY query HAVING impressions >= ${minImpr} ORDER BY impressions DESC LIMIT ${limit}`)
      out.source = 'gsc'; out.queries = rows.map(shape); return out
    }
    const rows = await q(env, `SELECT query, SUM(impressions) AS impressions, SUM(clicks) AS clicks, AVG(avg_position) AS avg_position FROM \`${p}.${sd}.bing_query_stats\` WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${periodDays} DAY) GROUP BY query HAVING impressions >= ${minImpr} ORDER BY impressions DESC LIMIT ${limit}`)
    out.source = 'bing'; out.data_pending = !rows.length; out.queries = rows.map(shape); return out
  }))
}

/** GET /admin/seo/pages?period_days&limit */
export async function pages(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const u = new URL(request.url)
  const periodDays = clamp(u.searchParams.get('period_days'), 1, 180, 28), limit = clamp(u.searchParams.get('limit'), 1, 500, 100)
  return Response.json(await cached(env, `pages:${periodDays}:${limit}`, async () => {
    const { p, sd, sg } = cfg(env)
    const out = { period_days: periodDays, pages: [], data_pending: false }
    let rows
    if (await gscPresent(env)) {
      rows = await q(env, `SELECT url AS page, SUM(impressions) AS impressions, SUM(clicks) AS clicks FROM \`${p}.${sg}.searchdata_url_impression\` WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${periodDays} DAY) GROUP BY url ORDER BY impressions DESC LIMIT ${limit}`)
      out.source = 'gsc'
    } else {
      rows = await q(env, `SELECT page, SUM(impressions) AS impressions, SUM(clicks) AS clicks FROM \`${p}.${sd}.bing_page_stats\` WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${periodDays} DAY) GROUP BY page ORDER BY impressions DESC LIMIT ${limit}`)
      out.source = 'bing'
    }
    out.pages = rows.map((r) => ({ url: r.page, impressions: int(r.impressions), clicks: int(r.clicks), ctr: ctr(r.clicks, r.impressions) }))
    out.data_pending = !rows.length
    return out
  }))
}

/** GET /admin/seo/anomalies?threshold_pct */
export async function anomalies(env, request) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  const th = clamp(new URL(request.url).searchParams.get('threshold_pct'), 5, 200, 30)
  return Response.json(await cached(env, `anomalies:${th}`, async () => {
    const { p, sg } = cfg(env)
    const out = { threshold_pct: th, anomalies: [], data_pending: false }
    if (!(await gscPresent(env))) { out.data_pending = true; return out }
    const rows = await q(env, `WITH recent AS (SELECT url, SUM(impressions) AS impressions FROM \`${p}.${sg}.searchdata_url_impression\` WHERE data_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE() GROUP BY url),
      prior AS (SELECT url, SUM(impressions) AS impressions FROM \`${p}.${sg}.searchdata_url_impression\` WHERE data_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY) GROUP BY url)
      SELECT r.url, r.impressions AS recent, p.impressions AS prior, SAFE_DIVIDE(r.impressions - p.impressions, p.impressions) * 100 AS change_pct
      FROM recent r JOIN prior p USING (url) WHERE ABS(SAFE_DIVIDE(r.impressions - p.impressions, p.impressions) * 100) >= ${th} ORDER BY ABS(change_pct) DESC LIMIT 50`)
    out.anomalies = rows.map((r) => ({ url: r.url, recent_impressions: int(r.recent), prior_impressions: int(r.prior), change_pct: Number(r.change_pct) }))
    return out
  }))
}

/** GET /admin/seo/page/<slug...>/lifecycle */
export async function pageLifecycle(env, request, slug) {
  const a = await requireAdmin(env, request); if (a instanceof Response) return a
  slug = decodeURIComponent(slug)
  return Response.json(await cached(env, `lifecycle:${slug}`, async () => {
    const { p, sg } = cfg(env)
    const url = slug.startsWith('http') ? slug : `https://cercol.team/${slug.replace(/^\/+/, '')}`
    const out = { url, days: [], data_pending: false }
    if (!(await gscPresent(env))) { out.data_pending = true; return out }
    const rows = await q(env, `SELECT data_date, SUM(impressions) AS impressions, SUM(clicks) AS clicks FROM \`${p}.${sg}.searchdata_url_impression\` WHERE url = '${url.replace(/'/g, "\\'")}' GROUP BY data_date ORDER BY data_date`)
    out.days = rows.map((r) => ({ date: r.data_date, impressions: int(r.impressions), clicks: int(r.clicks), ctr: ctr(r.clicks, r.impressions) }))
    return out
  }))
}
