/**
 * Bing Webmaster Tools ingest into cercol_seo.bing_*, mirroring
 * api/jobs/bing_ingest.py: three GETs, parse, DELETE the day partitions
 * the new rows cover, INSERT. Re-running on the same day yields the same
 * state; older partitions are never touched.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 */

import { execute, insertRows } from '../bigquery.js'

const BASE = 'https://ssl.bing.com/webmaster/api.svc/json'

/** Bing dates come as "/Date(1716163200000)/" (epoch ms) or ISO. */
export function normaliseDate(raw) {
  raw = String(raw || '')
  if (raw.startsWith('/Date(') && raw.endsWith(')/')) {
    const ms = parseInt(raw.slice(6, -2).split('+')[0].split('-')[0], 10)
    return new Date(ms).toISOString().slice(0, 10)
  }
  return raw.includes('T') ? raw.split('T')[0] : raw
}
const maybeFloat = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v))

export const parseQueryStats = (p) => (p.d || []).map((e) => ({
  date: normaliseDate(e.Date), query: e.Query || '', impressions: parseInt(e.Impressions || 0, 10),
  clicks: parseInt(e.Clicks || 0, 10), avg_position: maybeFloat(e.AvgImpressionPosition),
}))
export const parsePageStats = (p) => (p.d || []).map((e) => ({
  date: normaliseDate(e.Date), page: e.Page || '', impressions: parseInt(e.Impressions || 0, 10),
  clicks: parseInt(e.Clicks || 0, 10), avg_position: maybeFloat(e.AvgImpressionPosition),
}))
export const parseCrawlStats = (p) => (p.d || []).map((e) => ({
  date: normaliseDate(e.Date), crawled_pages: parseInt(e.CrawledPages || 0, 10),
  crawl_errors: parseInt(e.CrawlErrors || 0, 10), blocked: parseInt(e.Blocked || 0, 10),
}))

async function fetchBing(method, key, siteUrl, retries = 3) {
  const url = `${BASE}/${method}?siteUrl=${encodeURIComponent(siteUrl)}&apikey=${encodeURIComponent(key)}`
  let last
  for (let a = 1; a <= retries; a++) {
    const res = await fetch(url)
    if (res.ok) return res.json()
    last = res.status
    if (![429, 500, 502, 503, 504].includes(res.status) || a === retries) break
    await new Promise((r) => setTimeout(r, 2 ** a * 1000))
  }
  throw new Error(`bing ${method} failed: ${last}`)
}

async function replaceDay(env, table, rows, now) {
  const dates = [...new Set(rows.map((r) => r.date))].sort()
  if (!dates.length) return
  const ds = env.BIGQUERY_DATASET_SEO || 'cercol_seo', pj = env.BIGQUERY_PROJECT || 'cercol'
  await execute(env, `DELETE FROM \`${pj}.${ds}.${table}\` WHERE date IN (${dates.map((d) => `DATE '${d}'`).join(', ')})`)
  await insertRows(env, ds, table, rows.map((r) => ({ ...r, ingested_at: now })))
}

export async function runBing(env) {
  const key = env.BING_WMT_API_KEY
  if (!key) throw new Error('BING_WMT_API_KEY missing')
  const site = env.SEO_SITE_URL || 'https://cercol.team/'
  const now = new Date().toISOString()
  const [q, p, c] = await Promise.all([fetchBing('GetQueryStats', key, site), fetchBing('GetPageStats', key, site), fetchBing('GetCrawlStats', key, site)])
  const qr = parseQueryStats(q), pr = parsePageStats(p), cr = parseCrawlStats(c)
  await replaceDay(env, 'bing_query_stats', qr, now)
  await replaceDay(env, 'bing_page_stats', pr, now)
  await replaceDay(env, 'bing_crawl_stats', cr, now)
  return { bing_query_stats: qr.length, bing_page_stats: pr.length, bing_crawl_stats: cr.length }
}
