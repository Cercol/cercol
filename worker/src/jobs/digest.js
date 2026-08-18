/**
 * Weekly internal metrics digest, mirroring api/jobs/weekly_digest.py and
 * emails.weekly_digest_html. Sent every Monday for the prior Mon-Sun week.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * D1 replaces the Postgres reads; the BigQuery reads are the same SQL. Every
 * section degrades to a placeholder rather than aborting, so the email
 * always sends. Rendering reproduces the Python helpers character for
 * character: the digest is the one email the operator reads every week,
 * and it should not look different the Monday after the cutover.
 */

import { query } from '../bigquery.js'
import { priorFor, DOMAIN_MAP, computeRole } from '../../../src/utils/role-scoring.js'
import { NORM_MIN_SAMPLE } from '../norms.js'
import { crawlerHits } from './crawlers.js'
import { C, DISPLAY, h1, p, label, section, empty, table, delta, stat, statRow, shell } from '../email-ui.js'

const DOMAINS = ['presence', 'bond', 'discipline', 'depth', 'vision']
const LABELS = { newMoon: 'New Moon', firstQuarter: 'First Quarter', fullMoon: 'Full Moon' }
const LANG_ORDER = ['en', 'ca', 'es', 'fr', 'de', 'da']
const BLUE = C.blue, RED = C.red, GREEN = C.green, GRAY = C.muted
const ROLE_DISPLAY = {
  R01: ['\u{1F42C}', 'Dolphin'], R02: ['\u{1F43A}', 'Wolf'], R03: ['\u{1F418}', 'Elephant'], R04: ['\u{1F989}', 'Owl'],
  R05: ['\u{1F985}', 'Eagle'], R06: ['\u{1F985}', 'Falcon'], R07: ['\u{1F419}', 'Octopus'], R08: ['\u{1F422}', 'Tortoise'],
  R09: ['\u{1F41D}', 'Bee'], R10: ['\u{1F43B}', 'Bear'], R11: ['\u{1F98A}', 'Fox'], R12: ['\u{1F9A1}', 'Badger'],
}

// ---------------------------------------------------------------------------
// Week bounds and formatting
// ---------------------------------------------------------------------------

export function weekBounds(now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const dow = (today.getUTCDay() + 6) % 7 // Monday = 0
  const thisMonday = new Date(today.getTime() - dow * 86400e3)
  const ws = new Date(thisMonday.getTime() - 7 * 86400e3), we = thisMonday
  const ps = new Date(ws.getTime() - 7 * 86400e3), pe = ws
  return { ws, we, ps, pe }
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const md = (d) => `${MON[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')}`
export const weekLabel = (ws, we) => { const last = new Date(we.getTime() - 86400e3); return `${md(ws)}–${md(last)}, ${last.getUTCFullYear()}` }
const iso = (d) => d.toISOString().replace('Z', '+00:00')
const fmt = (n) => Number(n).toLocaleString('en-US')

// ---------------------------------------------------------------------------
// D1
// ---------------------------------------------------------------------------

async function count(db, sql, ...args) {
  const r = await db.prepare(sql).bind(...args).first()
  return Number(r?.n || 0)
}

export async function gatherD1(db, { ws, we, ps, pe }) {
  const W = [iso(ws), iso(we)], P = [iso(ps), iso(pe)]
  const c2 = async (sql) => [await count(db, sql, ...W), await count(db, sql, ...P)]
  const signups = await c2(`SELECT COUNT(*) AS n FROM auth_users WHERE created_at >= ? AND created_at < ?`)
  const tests = await c2(`SELECT COUNT(*) AS n FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ?`)
  const m4s = new Date(ws.getTime() - 21 * 86400e3), m4p = new Date(m4s.getTime() - 28 * 86400e3)
  const tests4w = [
    await count(db, `SELECT COUNT(*) AS n FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ?`, iso(m4s), iso(we)),
    await count(db, `SELECT COUNT(*) AS n FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ?`, iso(m4p), iso(m4s)),
  ]
  const pageViews = await c2(`SELECT COUNT(*) AS n FROM events WHERE name='page_view' AND created_at >= ? AND created_at < ?`)
  const visitors = await c2(`SELECT COUNT(DISTINCT anon_id) AS n FROM events WHERE name='page_view' AND anon_id IS NOT NULL AND created_at >= ? AND created_at < ?`)

  const q = async (sql, ...a) => (await db.prepare(sql).bind(...a).all()).results
  const instruments = (await q(`SELECT instrument, COUNT(*) AS n FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ? GROUP BY instrument ORDER BY n DESC`, ...W))
    .map((r) => [LABELS[r.instrument] || r.instrument || 'unknown', r.n])
  const weekIl = await q(`SELECT instrument, language, COUNT(*) AS n FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ? GROUP BY instrument, language ORDER BY n DESC`, ...W)
  const roleRows = await q(`SELECT instrument, presence, bond, discipline, depth, vision FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ? AND presence IS NOT NULL AND bond IS NOT NULL AND discipline IS NOT NULL AND depth IS NOT NULL AND vision IS NOT NULL`, ...W)
  const funnelRaw = Object.fromEntries((await q(`SELECT name, COUNT(*) AS n FROM events WHERE created_at >= ? AND created_at < ? AND name IN ('page_view','article_view','test_start','cta_click') GROUP BY name`, ...W)).map((r) => [r.name, r.n]))
  const people = Object.fromEntries((await q(`SELECT name, COUNT(DISTINCT anon_id) AS n FROM events WHERE created_at >= ? AND created_at < ? AND anon_id IS NOT NULL AND name IN ('page_view','article_view','test_start','cta_click') GROUP BY name`, ...W)).map((r) => [r.name, r.n]))
  people.test_complete = await count(db, `SELECT COUNT(DISTINCT anon_id) AS n FROM results WHERE is_seed = 0 AND anon_id IS NOT NULL AND created_at >= ? AND created_at < ?`, ...W)
  const chanRows = await q(`SELECT utm_source, referrer FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ?`, ...W)
  const topArticles = (await q(`SELECT e.slug AS slug, COUNT(*) AS reads, (SELECT json_extract(b.title, '$.en') FROM blog_posts b WHERE b.slug = e.slug) AS title FROM events e WHERE e.name='article_view' AND e.slug IS NOT NULL AND e.created_at >= ? AND e.created_at < ? GROUP BY e.slug ORDER BY reads DESC LIMIT 10`, ...W))
    .map((r) => [r.title || r.slug, r.reads])
  const cumRows = await q(`SELECT instrument, language, COUNT(*) AS n FROM results WHERE is_seed = 0 GROUP BY instrument, language ORDER BY n DESC`)
  const aggs = DOMAINS.map((d) => `SUM(${d}) AS ${d}_s, SUM(${d}*${d}) AS ${d}_ss`).join(', ')
  const normRows = (await q(`SELECT instrument, language, COUNT(*) AS n, ${aggs} FROM results WHERE is_seed = 0 AND ${DOMAINS.map((d) => `${d} IS NOT NULL`).join(' AND ')} GROUP BY instrument, language ORDER BY instrument, language`))
    .map((r) => ({ ...r, ...Object.fromEntries(DOMAINS.map((d) => [`${d}_mean`, r.n ? r[`${d}_s`] / r.n : null])) }))
  return {
    kpis: { signups, tests, tests_4w: tests4w, page_views: pageViews, unique_visitors: visitors },
    instruments, weekIl, roleRows, funnelRaw, people, chanRows, testsTotal: tests[0], topArticles, cumRows, normRows,
  }
}

// ---------------------------------------------------------------------------
// Pure builders (same as the Python ones)
// ---------------------------------------------------------------------------

export function computeRoleCounts(roleRows) {
  const c = {}
  for (const r of roleRows) c[computeRole(r, r.instrument).role] = (c[computeRole(r, r.instrument).role] || 0) + 1
  return Object.entries(c).sort((a, b) => b[1] - a[1])
}

export function buildCumulative(cumRows) {
  const matrix = {}, instrTotal = {}, colTotal = {}, langsPresent = new Set()
  let grand = 0
  for (const r of cumRows) {
    const lbl = LABELS[r.instrument] || r.instrument || 'unknown', lang = r.language || '—', n = Number(r.n)
    ;(matrix[lbl] ||= {})[lang] = (matrix[lbl][lang] || 0) + n
    instrTotal[lbl] = (instrTotal[lbl] || 0) + n; colTotal[lang] = (colTotal[lang] || 0) + n
    langsPresent.add(lang); grand += n
  }
  const langs = [...LANG_ORDER.filter((l) => langsPresent.has(l)), ...[...langsPresent].filter((l) => !LANG_ORDER.includes(l)).sort()]
  const rows = Object.entries(instrTotal).sort((a, b) => b[1] - a[1]).map(([instrument, total]) => ({ instrument, per_lang: matrix[instrument], total }))
  return { languages: langs, rows, col_totals: Object.fromEntries(langs.map((l) => [l, colTotal[l]])), grand_total: grand }
}

export function buildNorms(normRows) {
  const prior = priorFor('firstQuarter')
  const inv = Object.fromEntries(Object.entries(DOMAIN_MAP).map(([f, d]) => [d, f]))
  return normRows.map((r) => {
    const n = Number(r.n), empirical = n >= NORM_MIN_SAMPLE
    const drift = empirical ? DOMAINS.map((d) => [d, Number(r[`${d}_mean`]), Number(r[`${d}_mean`]) - prior.mean[inv[d]]]) : null
    return { instrument: LABELS[r.instrument] || r.instrument || 'unknown', lang: r.language || '—', n, threshold: NORM_MIN_SAMPLE, empirical, drift }
  })
}

const SEARCH = ['google.', 'bing.', 'duckduckgo.', 'yahoo.', 'yandex.', 'ecosia.', 'baidu.', 'startpage.']
const SOCIAL = ['facebook.', 'instagram.', 'twitter.', 't.co', 'x.com', 'linkedin.', 'lnkd.in', 'tiktok.', 'reddit.', 'youtube.', 'youtu.be', 'pinterest.', 'threads.', 'mastodon.']
export function classifyChannel(utmSource, referrer) {
  if (utmSource && utmSource.trim()) return utmSource.trim().toLowerCase()
  const ref = (referrer || '').trim().toLowerCase()
  if (!ref) return 'direct'
  let host = ref.includes('://') ? ref.split('://')[1] : ref
  host = host.split('/')[0]
  if (SEARCH.some((d) => host.includes(d))) return 'search'
  if (SOCIAL.some((d) => host.includes(d))) return 'social'
  return 'referral'
}
export function buildChannels(chanRows) {
  const c = {}
  for (const r of chanRows) { const k = classifyChannel(r.utm_source, r.referrer); c[k] = (c[k] || 0) + 1 }
  return Object.entries(c).sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? -1 : 1))
}

export function buildFunnel(raw, testsTotal, people = {}) {
  const rate = (n, d) => (d ? `${((n / d) * 100).toFixed(1)}%` : '—')
  const visitors = people.page_view || 0, starters = people.test_start || 0, finishers = people.test_complete || 0
  return {
    page_view: raw.page_view || 0, article_view: raw.article_view || 0, test_start: raw.test_start || 0, cta_click: raw.cta_click || 0,
    test_complete: testsTotal, visitors, starters, finishers,
    conversions: [['Visitors → test starters', rate(starters, visitors)], ['Reads → CTA clicks', rate(raw.cta_click || 0, raw.article_view || 0)], ['Starters → finishers', rate(finishers, starters)]],
  }
}

// ---------------------------------------------------------------------------
// BigQuery
// ---------------------------------------------------------------------------

async function bq(env, sql) { try { return await query(env, sql) } catch (e) { console.log(`[digest] BigQuery query failed (${e.message})`); return [] } }

export async function gatherBigQuery(env, { ws, we, ps, pe }) {
  const p = env.BIGQUERY_PROJECT || 'cercol', sg = env.BIGQUERY_DATASET_GSC || 'searchconsole', sd = env.BIGQUERY_DATASET_SEO || 'cercol_seo'
  const d = (x) => x.toISOString().slice(0, 10)
  const cwS = d(ws), cwE = d(new Date(we.getTime() - 86400e3)), pwS = d(ps), pwE = d(new Date(pe.getTime() - 86400e3))
  const seo = { source: null, impressions: 0, clicks: 0, top_queries: [], top_pages: [], movers: [], pending: true }
  const gscPresent = (await bq(env, `SELECT 1 AS x FROM \`${p}.${sg}.INFORMATION_SCHEMA.TABLES\` WHERE table_name = 'searchdata_url_impression' LIMIT 1`)).length > 0
  if (gscPresent) {
    const gt = `\`${p}.${sg}.searchdata_url_impression\``
    const totals = await bq(env, `SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks FROM ${gt} WHERE data_date BETWEEN '${cwS}' AND '${cwE}'`)
    const tq = await bq(env, `SELECT query, SUM(impressions) AS impressions, SUM(clicks) AS clicks, AVG(sum_position/impressions) AS pos FROM ${gt} WHERE data_date BETWEEN '${cwS}' AND '${cwE}' AND query IS NOT NULL GROUP BY query ORDER BY impressions DESC LIMIT 10`)
    const movers = await bq(env, `WITH cur AS (SELECT url, SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) AS pos FROM ${gt} WHERE data_date BETWEEN '${cwS}' AND '${cwE}' GROUP BY url),
      prev AS (SELECT url, SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) AS pos FROM ${gt} WHERE data_date BETWEEN '${pwS}' AND '${pwE}' GROUP BY url)
      SELECT cur.url AS url, prev.pos AS before, cur.pos AS now, prev.pos - cur.pos AS improvement FROM cur JOIN prev USING (url)
      WHERE cur.pos IS NOT NULL AND prev.pos IS NOT NULL ORDER BY ABS(prev.pos - cur.pos) DESC LIMIT 8`)
    const t = totals[0] || {}
    Object.assign(seo, { source: 'gsc', impressions: Number(t.impressions || 0), clicks: Number(t.clicks || 0),
      top_queries: tq.map((r) => [r.query, Number(r.impressions), Number(r.clicks), r.pos == null ? null : Number(r.pos)]),
      movers: movers.map((r) => [r.url, Number(r.before), Number(r.now), Number(r.improvement)]), pending: !(totals.length || tq.length) })
  } else {
    const bt = `\`${p}.${sd}.bing_query_stats\``
    const totals = await bq(env, `SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks FROM ${bt} WHERE date BETWEEN '${cwS}' AND '${cwE}'`)
    const tq = await bq(env, `SELECT query, SUM(impressions) AS impressions, SUM(clicks) AS clicks, AVG(avg_position) AS pos FROM ${bt} WHERE date BETWEEN '${cwS}' AND '${cwE}' GROUP BY query ORDER BY impressions DESC LIMIT 10`)
    const t = totals[0] || {}
    Object.assign(seo, { source: 'bing', impressions: Number(t.impressions || 0), clicks: Number(t.clicks || 0),
      top_queries: tq.map((r) => [r.query, Number(r.impressions), Number(r.clicks), r.pos == null ? null : Number(r.pos)]), pending: !tq.length })
  }
  const psi = await bq(env, `SELECT url, ANY_VALUE(performance_score HAVING MAX run_ts) AS score, ANY_VALUE(lcp_ms HAVING MAX run_ts) AS lcp_ms FROM \`${p}.${sd}.pagespeed_runs\` WHERE device='mobile' GROUP BY url ORDER BY score ASC LIMIT 8`)
  const elt = `\`${p}.${sd}.external_links_status\``
  const bl = await bq(env, `SELECT url, ANY_VALUE(status_code) AS status_code, STRING_AGG(DISTINCT article_slug, ', ' ORDER BY article_slug) AS slugs, COUNT(DISTINCT CONCAT(article_slug, '|', lang)) AS instances FROM ${elt} WHERE broken = TRUE AND ts = (SELECT MAX(ts) FROM ${elt}) GROUP BY url ORDER BY url LIMIT 100`)
  return { seo, pagespeed: psi.map((r) => [r.url, r.score, r.lcp_ms]), broken_links: bl.map((r) => [r.url, r.slugs, r.instances, r.status_code]) }
}

// ---------------------------------------------------------------------------
// HTML (mirrors emails.py helpers)
// ---------------------------------------------------------------------------

const pyPct = (x) => { const s = (x * 100).toFixed(0); return `${x >= 0 ? '+' : ''}${s}%` }
const deltaSpan = (cur, prev) => delta(cur, prev, prev ? ` (${pyPct((cur - prev) / prev)})` : '')
const statCard = (label, value, d = '') => stat(label, value, d)
const metricRow = statRow
function pivotTable(cum) {
  const langs = cum.languages
  const rows = cum.rows.map((r) => [r.instrument, ...langs.map((l) => fmt(r.per_lang[l] || 0)), `<strong>${fmt(r.total)}</strong>`])
  rows.push(['<strong>Total</strong>', ...langs.map((l) => `<strong>${fmt(cum.col_totals[l] || 0)}</strong>`), `<strong>${fmt(cum.grand_total || 0)}</strong>`])
  return table(['Model', ...langs, 'Total'], rows, ['left', ...langs.map(() => 'right'), 'right'])
}
function channelSplit(channels) {
  const heading = `<div style="margin-top:18px;">${label('Source / channel split', C.gray500)}</div>`
  if (!channels.length) return heading + empty('No attributable sessions this week.')
  return heading + table(['Channel', 'Tests'], channels.map(([c, n]) => [c, fmt(n)]), ['left', 'right'])
}
function northStar(kpis, weeklyPivot, channels) {
  const [cur, prev] = kpis.tests || [0, 0]
  const [cur4, prev4] = kpis.tests_4w || [cur, prev]
  let block = `<div style="text-align:center;padding:12px 0 4px;">${label('Completed tests, last 4 weeks', C.gray500)}<div style="font-family:${DISPLAY};font-size:48px;font-weight:700;color:${BLUE};line-height:1.1;margin:4px 0;">${fmt(cur4)}</div><div style="font-size:13px;color:${GRAY};">${deltaSpan(cur4, prev4)} &nbsp;vs the 4 weeks before (${fmt(prev4)})</div><div style="font-size:12px;color:${GRAY};margin-top:6px;">${fmt(cur)} this week</div></div>`
  block += weeklyPivot?.rows?.length ? pivotTable(weeklyPivot) : empty('No tests completed this week.')
  block += channelSplit(channels || [])
  return block
}
const baseEn = (content, frontendUrl) => shell(content, { frontendUrl, footer: 'Weekly digest from the Cèrcol Worker, Mondays 09:00 UTC.' })

export function weeklyDigestHtml(data, frontendUrl = 'https://cercol.team') {
  const kpis = data.kpis || {}
  const card = (name, label) => { const [cur, prev] = kpis[name] || [0, 0]; return statCard(label, fmt(cur), deltaSpan(cur, prev)) }
  const parts = [
    h1(`Weekly digest &mdash; ${data.week_label || ''}`),
    northStar(kpis, data.weekly_pivot || {}, data.channels || []),
    p('How cercol.team performed last week (Mon&ndash;Sun, UTC).', true),
    metricRow([card('signups', 'Signups'), card('tests', 'Tests'), card('page_views', 'Page views'), card('unique_visitors', 'Visitors')]),
  ]
  const instruments = data.instruments || []
  parts.push(section('Tests by instrument', instruments.length ? table(['Instrument', 'Count'], instruments.map(([l, n]) => [l, fmt(n)]), ['left', 'right']) : empty('No tests completed this week.')))
  const roles = data.roles || []
  parts.push(section('Tests by cluster', roles.length ? table(['Cluster', 'Count'], roles.map(([id, n]) => { const [e, nm] = ROLE_DISPLAY[id] || ['', id]; return [`${e} ${nm}`, fmt(n)] }), ['left', 'right']) : empty('No completed tests to cluster.')))
  const cum = data.cumulative || {}
  parts.push(section('Cumulative tests (all-time)', cum.rows?.length ? pivotTable(cum) : empty('No tests recorded yet.')))
  const norms = data.norms || []
  if (norms.length) {
    let body = table(['Instrument', 'Lang', 'N', 'Norms'], norms.map((nm) => [nm.instrument, nm.lang, fmt(nm.n), nm.empirical ? '&#10003; empirical' : `${fmt(nm.n)} / ${fmt(nm.threshold)}`]), ['left', 'left', 'right', 'right'])
    for (const nm of norms.filter((n) => n.drift)) {
      const ds = nm.drift.map(([d, , delta]) => `${d[0].toUpperCase()}${d.slice(1)} ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}`).join(' &middot; ')
      body += p(`<strong>${nm.instrument} &middot; ${nm.lang}</strong> mean drift vs prior: ${ds}`, true)
    }
    parts.push(section('Population norms (validity)', body))
  } else parts.push(section('Population norms (validity)', empty('No completed-profile data yet.')))
  const f = data.funnel
  if (f) {
    const stages = [['Page views', f.page_view, f.visitors], ['Article reads', f.article_view, null], ['Test starts', f.test_start, f.starters], ['Tests completed', f.test_complete, f.finishers], ['CTA clicks', f.cta_click, null]]
    const rows = stages.map(([l, n, pp]) => [l, fmt(n), pp != null ? fmt(pp) : '—'])
    const conv = (f.conversions || []).map(([l, v]) => p(`${l}: <strong>${v}</strong>`, true)).join('')
    parts.push(section('Funnel', table(['Stage', 'Events', 'People'], rows, ['left', 'right', 'right']) + conv))
  } else parts.push(section('Funnel', empty('No funnel events this week.')))
  const arts = data.top_articles || []
  parts.push(section('Top articles (reads)', arts.length ? table(['Article', 'Reads'], arts.map(([t, n]) => [t, fmt(n)]), ['left', 'right']) : empty('No article reads recorded this week.')))
  const seo = data.seo || {}
  if (seo && !seo.pending && (seo.top_queries?.length || seo.impressions)) {
    const src = (seo.source || 'search').toUpperCase()
    let body = metricRow([statCard('Impressions', fmt(seo.impressions || 0)), statCard('Clicks', fmt(seo.clicks || 0))])
    if (seo.top_queries?.length) body += "<div style='margin-top:12px;'></div>" + table(['Query', 'Impr.', 'Clicks', 'Pos.'], seo.top_queries.map(([q, i, c, pos]) => [q, fmt(i), fmt(c), pos != null ? pos.toFixed(1) : '&ndash;']), ['left', 'right', 'right', 'right'])
    if (seo.movers?.length) body += "<div style='margin-top:12px;'></div>" + table(['Page', 'Was', 'Now', '&Delta;pos'], seo.movers.map(([u, b, n, impr]) => [u, b.toFixed(1), n.toFixed(1), impr === 0 ? deltaSpan(0, 0) : `<span style="color:${impr > 0 ? GREEN : RED};">${impr >= 0 ? '+' : ''}${impr.toFixed(1)}</span>`]), ['left', 'right', 'right', 'right'])
    parts.push(section(`Search (${src})`, body))
  } else parts.push(section('Search', empty('Search data pending (export not yet populated).')))
  const cr = data.crawlers
  if (cr && !cr.pending) {
    parts.push(section('Crawlers (cercol.team, Cloudflare)', cr.byBot.length
      ? table(['Crawler', 'Requests'], cr.byBot.slice(0, 15).map(([n, h]) => [n, fmt(h)]), ['left', 'right'])
        + p(`${fmt(cr.total)} crawler requests in the week, across the whole site.`, true)
      : empty('No crawler traffic recorded this week.')))
  }
  const ps = data.pagespeed || []
  parts.push(section('PageSpeed (mobile, lowest scores)', ps.length ? table(['URL', 'Score', 'LCP'], ps.map(([u, s, lcp]) => [u, s != null ? String(s) : '&ndash;', lcp != null ? `${fmt(Math.trunc(lcp))} ms` : '&ndash;']), ['left', 'right', 'right']) : empty('No PageSpeed runs.')))
  const bl = data.broken_links || []
  parts.push(section('Broken external links', bl.length ? table(['URL', 'In articles', 'Lang versions', 'Code'], bl.map(([u, slugs, inst, st]) => [u, slugs, inst ? `${inst}&times;` : '&ndash;', st != null ? String(st) : 'conn']), ['left', 'left', 'right', 'right']) : empty('No broken external links. ✓')))
  if (data.gsc_lag_note) parts.push(p('Note: search data has up to ~48h export lag, so the last days of the week may be partial.', true))
  return baseEn(parts.join(''), frontendUrl)
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

export async function runDigest(env, { send = true } = {}) {
  const b = weekBounds()
  const pg = await gatherD1(env.DB, b)
  const bqd = await gatherBigQuery(env, b)
  const crawlers = await crawlerHits(env, b.ws.toISOString(), b.we.toISOString()).catch(() => ({ byBot: [], total: 0, pending: true }))
  const data = {
    week_label: weekLabel(b.ws, b.we), kpis: pg.kpis, instruments: pg.instruments,
    weekly_pivot: buildCumulative(pg.weekIl), roles: computeRoleCounts(pg.roleRows),
    funnel: buildFunnel(pg.funnelRaw, pg.testsTotal, pg.people), channels: buildChannels(pg.chanRows),
    top_articles: pg.topArticles, cumulative: buildCumulative(pg.cumRows), norms: buildNorms(pg.normRows),
    seo: bqd.seo, pagespeed: bqd.pagespeed, broken_links: bqd.broken_links, gsc_lag_note: bqd.seo.source === 'gsc', crawlers,
  }
  if (send) {
    const to = env.DIGEST_EMAIL || 'hello@cercol.team'
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: 'Cèrcol <noreply@cercol.team>', to: [to], subject: `Cèrcol weekly digest — ${data.week_label}`, html: weeklyDigestHtml(data, env.FRONTEND_URL) }),
    })
    if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
  }
  return { week: data.week_label, signups: pg.kpis.signups[0], tests: pg.testsTotal, clusters: data.roles.length, broken_links: bqd.broken_links.length, data }
}
