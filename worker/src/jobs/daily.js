/**
 * Daily brief: what happened yesterday, and whether anything is near a
 * limit. Short on purpose. The weekly digest is the full picture; this is
 * the glance that says "who arrived, what they did, which article moved,
 * and the platform is fine" or flags the one thing that is not.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Sections, in order of how fast you want to know:
 *   1. Warnings, or one green line.
 *   2. Yesterday: signups, tests, page views, visitors, each against the
 *      same weekday a week ago; the start-to-finish funnel; language split.
 *   3. People: new accounts (with whether they already finished a test),
 *      Witness sessions and groups.
 *   4. Content: articles taking off, top reads with 7-day average, top
 *      pages; search clicks and impressions for the latest day Search
 *      Console has exported (about two days behind).
 *   5. Platform against the free-plan caps: D1 rows, KV writes, Worker
 *      requests, CPU p99, errors by status, Purelymail credit.
 *
 * Runs on the 04:00 UTC trigger, after purge-tokens, and sends to
 * DIGEST_EMAIL like the weekly one. Every gatherer degrades to a
 * placeholder rather than aborting, so the email always sends.
 */

import { query as bq } from '../bigquery.js'
import { C, fmt, esc, h1, sub, p, section, empty, delta, stat, statRow, table, bar, callout, shell } from '../email-ui.js'

const LABELS = { newMoon: 'New Moon', firstQuarter: 'First Quarter', fullMoon: 'Full Moon' }
const iso = (d) => d.toISOString().replace('Z', '+00:00')
const day = (d) => d.toISOString().slice(0, 10)

// Free-plan caps this deployment lives under (developers.cloudflare.com, Aug 2026).
export const CAPS = { d1RowsRead: 5_000_000, d1RowsWritten: 100_000, kvWrites: 1_000, workerRequests: 100_000, workerCpuMs: 10 }
const WARN_AT = 0.7
// Hetzner leaves after a quiet fortnight from the cutover (2026-08-17). From
// this date the brief nags until HETZNER_DECOMMISSIONED is set on the Worker.
export const DECOMMISSION_DUE = '2026-08-31'

export function dayBounds(now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const y0 = new Date(today.getTime() - 86400e3)
  return { y0, y1: today, w0: new Date(y0.getTime() - 7 * 86400e3), w1: new Date(today.getTime() - 7 * 86400e3), avg0: new Date(y0.getTime() - 7 * 86400e3) }
}

async function count(db, sql, ...a) { return Number((await db.prepare(sql).bind(...a).first())?.n || 0) }

export async function gatherProduct(db, b) {
  const Y = [iso(b.y0), iso(b.y1)], W = [iso(b.w0), iso(b.w1)]
  const pair = async (sql) => [await count(db, sql, ...Y), await count(db, sql, ...W)]
  const q = async (sql, ...a) => (await db.prepare(sql).bind(...a).all()).results
  const signups = await pair(`SELECT COUNT(*) AS n FROM auth_users WHERE created_at >= ? AND created_at < ?`)
  const tests = await pair(`SELECT COUNT(*) AS n FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ?`)
  const pageViews = await pair(`SELECT COUNT(*) AS n FROM events WHERE name='page_view' AND created_at >= ? AND created_at < ?`)
  const visitors = await pair(`SELECT COUNT(DISTINCT anon_id) AS n FROM events WHERE name='page_view' AND anon_id IS NOT NULL AND created_at >= ? AND created_at < ?`)
  const starts = await pair(`SELECT COUNT(DISTINCT anon_id) AS n FROM events WHERE name='test_start' AND created_at >= ? AND created_at < ?`)
  const byInstrument = (await q(`SELECT instrument, language, COUNT(*) AS n FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ? GROUP BY instrument, language ORDER BY n DESC`, ...Y))
    .map((r) => [LABELS[r.instrument] || r.instrument, r.language || '—', r.n])
  const byLang = (await q(`SELECT COALESCE(lang,'?') AS lang, COUNT(DISTINCT anon_id) AS n FROM events WHERE name='page_view' AND created_at >= ? AND created_at < ? GROUP BY lang ORDER BY n DESC`, ...Y)).map((r) => [r.lang, r.n])
  const topPages = (await q(`SELECT path, COUNT(*) AS n FROM events WHERE name='page_view' AND path IS NOT NULL AND created_at >= ? AND created_at < ? GROUP BY path ORDER BY n DESC LIMIT 8`, ...Y)).map((r) => [r.path, r.n])
  const newUsers = await q(`SELECT u.email, p.first_name, p.last_name, p.native_language, u.created_at,
      (SELECT COUNT(*) FROM results r WHERE r.user_id = u.id AND r.is_seed = 0) AS tests
    FROM auth_users u LEFT JOIN profiles p ON p.id = u.id WHERE u.created_at >= ? AND u.created_at < ? ORDER BY u.created_at`, ...Y)
  const witness = {
    created: await count(db, `SELECT COUNT(*) AS n FROM witness_sessions WHERE is_seed = 0 AND created_at >= ? AND created_at < ?`, ...Y),
    completed: await count(db, `SELECT COUNT(*) AS n FROM witness_sessions WHERE is_seed = 0 AND completed_at >= ? AND completed_at < ?`, ...Y),
    groups: await count(db, `SELECT COUNT(*) AS n FROM groups WHERE is_seed = 0 AND created_at >= ? AND created_at < ?`, ...Y),
  }
  // Reads yesterday vs the article's own 7-day daily average.
  const reads = await q(`
    SELECT slug,
           SUM(CASE WHEN created_at >= ?1 AND created_at < ?2 THEN 1 ELSE 0 END) AS y,
           SUM(CASE WHEN created_at >= ?3 AND created_at < ?1 THEN 1 ELSE 0 END) / 7.0 AS avg7
      FROM events WHERE name='article_view' AND slug IS NOT NULL AND created_at >= ?3 AND created_at < ?2
     GROUP BY slug ORDER BY y DESC LIMIT 40`, iso(b.y0), iso(b.y1), iso(b.avg0))
  const titles = Object.fromEntries((await q(`SELECT slug, json_extract(title, '$.en') AS t FROM blog_posts`)).map((r) => [r.slug, r.t]))
  const top = reads.filter((r) => r.y > 0).slice(0, 8).map((r) => [titles[r.slug] || r.slug, r.slug, r.y, r.avg7])
  const takingOff = reads.filter((r) => r.y >= 5 && r.avg7 > 0 && r.y >= 3 * r.avg7).map((r) => [titles[r.slug] || r.slug, r.slug, r.y, r.avg7])
  const totals = { users: await count(db, `SELECT COUNT(*) AS n FROM auth_users`), tests: await count(db, `SELECT COUNT(*) AS n FROM results WHERE is_seed = 0`) }
  return { signups, tests, pageViews, visitors, starts, byInstrument, byLang, topPages, newUsers, witness, top, takingOff, totals }
}

/** Latest day Search Console has exported (usually two days behind), and the day before it. */
export async function gatherSearch(env) {
  const pr = env.BIGQUERY_PROJECT || 'cercol', sg = env.BIGQUERY_DATASET_GSC || 'searchconsole'
  const gt = `\`${pr}.${sg}.searchdata_url_impression\``
  try {
    const [last] = await bq(env, `SELECT MAX(data_date) AS d FROM ${gt}`)
    if (!last?.d) return { pending: true }
    const d = String(last.d).slice(0, 10)
    const rows = await bq(env, `SELECT data_date, SUM(clicks) AS clicks, SUM(impressions) AS impressions FROM ${gt} WHERE data_date IN ('${d}', DATE_SUB('${d}', INTERVAL 1 DAY)) GROUP BY data_date ORDER BY data_date DESC`)
    const tq = await bq(env, `SELECT query, SUM(clicks) AS clicks, SUM(impressions) AS impressions, SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) AS pos FROM ${gt} WHERE data_date = '${d}' AND query IS NOT NULL GROUP BY query ORDER BY clicks DESC, impressions DESC LIMIT 6`)
    const cur = rows[0] || {}, prev = rows[1] || {}
    return { day: d, clicks: [Number(cur.clicks || 0), Number(prev.clicks || 0)], impressions: [Number(cur.impressions || 0), Number(prev.impressions || 0)],
      queries: tq.map((r) => [r.query, Number(r.clicks), Number(r.impressions), r.pos == null ? null : Number(r.pos)]) }
  } catch (e) { return { pending: true, error: e.message } }
}

async function gql(env, query) {
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', { method: 'POST', headers: { authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ query }) })
  const d = await res.json()
  if (d?.errors?.length) throw new Error(d.errors[0].message)
  return d.data
}

export async function gatherPlatform(env, b) {
  const out = { pending: !env.CF_ANALYTICS_TOKEN || !env.CF_ACCOUNT_ID }
  if (out.pending) return out
  const d = day(b.y0)
  try {
    const r = await gql(env, `{ viewer { accounts(filter:{accountTag:"${env.CF_ACCOUNT_ID}"}) {
      d1: d1AnalyticsAdaptiveGroups(limit:1, filter:{date:"${d}"}) { sum { rowsRead rowsWritten readQueries writeQueries } }
      kv: kvOperationsAdaptiveGroups(limit:10, filter:{date:"${d}"}) { dimensions { actionType } sum { requests } }
      w: workersInvocationsAdaptive(limit:1, filter:{date:"${d}", scriptName:"cercol-api"}) { sum { requests errors subrequests } quantiles { cpuTimeP50 cpuTimeP99 } }
      ws: workersInvocationsAdaptive(limit:20, filter:{date:"${d}", scriptName:"cercol-api"}) { dimensions { status } sum { requests } }
    } } }`)
    const a = r.viewer.accounts[0]
    const d1 = a.d1?.[0]?.sum || {}, w = a.w?.[0] || {}
    out.d1 = { rowsRead: d1.rowsRead || 0, rowsWritten: d1.rowsWritten || 0, queries: (d1.readQueries || 0) + (d1.writeQueries || 0) }
    out.kv = Object.fromEntries((a.kv || []).map((g) => [g.dimensions.actionType, g.sum.requests]))
    out.worker = { requests: w.sum?.requests || 0, errors: w.sum?.errors || 0, subrequests: w.sum?.subrequests || 0, cpuP50: (w.quantiles?.cpuTimeP50 || 0) / 1000, cpuP99: (w.quantiles?.cpuTimeP99 || 0) / 1000,
      byStatus: (a.ws || []).filter((g) => g.dimensions.status !== 'success').map((g) => [g.dimensions.status, g.sum.requests]) }
  } catch (e) { out.error = e.message }
  try {
    const r = await fetch('https://purelymail.com/api/v0/checkAccountCredit', { method: 'POST', headers: { 'Purelymail-Api-Token': env.PURELYMAIL_API_KEY || '', 'content-type': 'application/json' }, body: '{}' })
    const j = await r.json(); out.mailCredit = j?.result?.credit != null ? Number(j.result.credit) : null
  } catch { out.mailCredit = null }
  return out
}

/** Warnings, each a short sentence, from the platform numbers. */
export function warnings(pl, { today = day(new Date()), decommissioned = false } = {}) {
  const w = []
  if (!decommissioned && today >= DECOMMISSION_DUE) w.push(`Hetzner decommission is due (quiet fortnight over): run scripts/decommission-hetzner.sh, drop the gh-pages step in deploy-frontend.yml, then set HETZNER_DECOMMISSIONED=1 on the Worker to silence this.`)
  if (pl.pending) return ['Platform metrics not configured (CF_ANALYTICS_TOKEN / CF_ACCOUNT_ID).']
  if (pl.error) w.push(`Cloudflare analytics query failed: ${pl.error}`)
  const pct = (v, cap) => Math.round((v / cap) * 100)
  if (pl.d1) {
    if (pl.d1.rowsRead >= CAPS.d1RowsRead * WARN_AT) w.push(`D1 rows read ${fmt(pl.d1.rowsRead)}, ${pct(pl.d1.rowsRead, CAPS.d1RowsRead)}% of the 5M/day cap.`)
    if (pl.d1.rowsWritten >= CAPS.d1RowsWritten * WARN_AT) w.push(`D1 rows written ${fmt(pl.d1.rowsWritten)}, ${pct(pl.d1.rowsWritten, CAPS.d1RowsWritten)}% of the 100k/day cap.`)
  }
  if (pl.kv && (pl.kv.write || 0) >= CAPS.kvWrites * WARN_AT) w.push(`KV writes ${fmt(pl.kv.write)}, ${pct(pl.kv.write, CAPS.kvWrites)}% of the 1k/day cap.`)
  if (pl.worker) {
    if (pl.worker.requests >= CAPS.workerRequests * WARN_AT) w.push(`API requests ${fmt(pl.worker.requests)}, ${pct(pl.worker.requests, CAPS.workerRequests)}% of the 100k/day cap.`)
    if (pl.worker.cpuP99 > CAPS.workerCpuMs) w.push(`API CPU p99 ${pl.worker.cpuP99.toFixed(1)} ms, above the 10 ms budget.`)
    if (pl.worker.errors > 0) w.push(`${fmt(pl.worker.errors)} API error(s): ${pl.worker.byStatus.map(([s, n]) => `${s} ${fmt(n)}`).join(', ') || 'unclassified'}.`)
  }
  if (pl.mailCredit != null && pl.mailCredit < 0.15) w.push(`Purelymail credit is $${pl.mailCredit.toFixed(2)}: top up.`)
  return w
}

// -- HTML ------------------------------------------------------------------
const vs = (cur, prev) => delta(cur, prev) + `<span style="font-size:11px;color:${C.muted};"> vs last week</span>`
const pctOf = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—')

export function dailyHtml(data, frontendUrl = 'https://cercol.team') {
  const { day: d, product: pr, platform: pl, search: se, warns } = data
  const weekday = new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  const parts = [h1('Daily brief'), sub(`${weekday} &middot; ${fmt(pr.totals.users)} accounts and ${fmt(pr.totals.tests)} tests all-time`)]
  parts.push(warns.length ? callout(warns.map((w) => `&#9888; ${w}`), 'warn') : callout(['&#10003; Platform within limits.'], 'ok'))

  // 1. Yesterday
  parts.push(statRow([
    stat('Signups', fmt(pr.signups[0]), vs(...pr.signups), C.red),
    stat('Tests', fmt(pr.tests[0]), vs(...pr.tests), C.blue),
    stat('Page views', fmt(pr.pageViews[0]), vs(...pr.pageViews), C.yellow),
    stat('Visitors', fmt(pr.visitors[0]), vs(...pr.visitors), C.green),
  ]))
  const funnel = `${fmt(pr.visitors[0])} visitors &rarr; ${fmt(pr.starts[0])} started a test &rarr; ${fmt(pr.tests[0])} finished (${pctOf(pr.tests[0], pr.starts[0])} of starters, ${pctOf(pr.tests[0], pr.visitors[0])} of visitors)`
  const langs = pr.byLang.length ? ` &middot; visitors by language: ${pr.byLang.map(([l, n]) => `${l} ${fmt(n)}`).join(', ')}` : ''
  parts.push(p(funnel + langs, true))
  if (pr.byInstrument.length) parts.push(table(['Tests yesterday', 'Lang', 'N'], pr.byInstrument.map(([i, l, n]) => [i, l, fmt(n)]), ['left', 'left', 'right']))

  // 2. People
  let people = pr.newUsers.length
    ? table(['New account', 'Name', 'Lang', 'At (UTC)', 'Tests'], pr.newUsers.map((u) => [esc(u.email), esc(`${u.first_name || ''} ${u.last_name || ''}`.trim()) || '—', u.native_language || '—', String(u.created_at).slice(11, 16), u.tests ? `<span style="color:${C.green};">&#10003; ${u.tests}</span>` : '<span style="color:' + C.muted + ';">not yet</span>']), ['left', 'left', 'left', 'right', 'right'])
    : empty('No new accounts yesterday.')
  const wt = pr.witness
  if (wt.created || wt.completed || wt.groups) people += p(`Witness: ${fmt(wt.created)} invited, ${fmt(wt.completed)} completed &middot; ${fmt(wt.groups)} new group${wt.groups === 1 ? '' : 's'}`, true)
  parts.push(section('People', people, C.red))

  // 3. Content
  const art = (t, slug) => `<a href="${frontendUrl}/blog/${slug}/" style="color:${C.ink};text-decoration:none;">${esc(t)}</a>`
  let content = ''
  if (pr.takingOff.length) content += `<div style="margin-bottom:12px;">${table(['&#128293; Taking off', 'Reads', '7-day avg'], pr.takingOff.map(([t, s, y, a]) => [art(t, s), `<strong>${fmt(y)}</strong>`, a.toFixed(1)]), ['left', 'right', 'right'])}</div>`
  content += pr.top.length ? table(['Top articles', 'Reads', '7-day avg'], pr.top.map(([t, s, y, a]) => [art(t, s), fmt(y), a.toFixed(1)]), ['left', 'right', 'right']) : empty('No article reads recorded yesterday.')
  if (pr.topPages.length) content += `<div style="margin-top:12px;">${table(['Top pages', 'Views'], pr.topPages.map(([pth, n]) => [`<span style="font-size:12px;">${esc(pth)}</span>`, fmt(n)]), ['left', 'right'])}</div>`
  parts.push(section('Content', content, C.yellow))

  // 4. Search
  if (se && !se.pending) {
    let s = statRow([stat('Clicks', fmt(se.clicks[0]), delta(se.clicks[0], se.clicks[1]) + `<span style="font-size:11px;color:${C.muted};"> vs day before</span>`, C.blue), stat('Impressions', fmt(se.impressions[0]), delta(se.impressions[0], se.impressions[1]) + `<span style="font-size:11px;color:${C.muted};"> vs day before</span>`, C.green)])
    if (se.queries.length) s += table(['Query', 'Clicks', 'Impr.', 'Pos.'], se.queries.map(([q, c, i, pos]) => [esc(q), fmt(c), fmt(i), pos != null ? pos.toFixed(1) : '&ndash;']), ['left', 'right', 'right', 'right'])
    parts.push(section(`Google Search &middot; ${se.day} (latest export)`, s, C.green))
  }

  // 5. Platform
  if (!pl.pending && !pl.error) {
    // ponytail: static-asset requests (cercol-web) are free and uncounted; only the API Worker meters.
    const rows = [
      ['API requests', fmt(pl.worker.requests), bar(pl.worker.requests, CAPS.workerRequests)],
      ['API CPU p50 / p99', `${pl.worker.cpuP50.toFixed(1)} / ${pl.worker.cpuP99.toFixed(1)} ms`, bar(pl.worker.cpuP99, CAPS.workerCpuMs)],
      ['API errors', pl.worker.errors ? `<span style="color:${C.red};">${fmt(pl.worker.errors)}</span>` : '0', pl.worker.byStatus.map(([s, n]) => `<span style="font-size:12px;color:${C.muted};">${s} ${fmt(n)}</span>`).join(' ')],
      ['D1 rows read', fmt(pl.d1.rowsRead), bar(pl.d1.rowsRead, CAPS.d1RowsRead)],
      ['D1 rows written', fmt(pl.d1.rowsWritten), bar(pl.d1.rowsWritten, CAPS.d1RowsWritten)],
      ['KV writes', fmt(pl.kv.write || 0), bar(pl.kv.write || 0, CAPS.kvWrites)],
    ]
    if (pl.mailCredit != null) rows.push(['Purelymail credit', `$${pl.mailCredit.toFixed(2)}`, `<span style="font-size:12px;color:${C.muted};">pay-as-you-go</span>`])
    if (data.decommissionIn > 0) rows.push(['Hetzner decommission', `in ${data.decommissionIn} day${data.decommissionIn === 1 ? '' : 's'}`, `<span style="font-size:12px;color:${C.muted};">${DECOMMISSION_DUE}, then scripts/decommission-hetzner.sh</span>`])
    parts.push(section('Platform &middot; free-plan caps', table(['', 'Yesterday', 'Of cap'], rows, ['left', 'right', 'left']), C.blue))
  }
  return shell(parts.join(''), { frontendUrl, footer: 'Daily brief from the Cèrcol Worker, 04:00 UTC. The weekly digest on Monday has the full picture.' })
}

export async function runDaily(env, { send = true } = {}) {
  const b = dayBounds()
  const product = await gatherProduct(env.DB, b)
  const platform = await gatherPlatform(env, b)
  const search = await gatherSearch(env)
  const decommissioned = env.HETZNER_DECOMMISSIONED === '1'
  const warns = warnings(platform, { today: day(b.y1), decommissioned })
  const decommissionIn = decommissioned ? 0 : Math.ceil((Date.parse(DECOMMISSION_DUE) - b.y1.getTime()) / 86400e3)
  const data = { day: day(b.y0), product, platform, search, warns, decommissionIn }
  if (send) {
    const to = env.DIGEST_EMAIL || 'hello@cercol.team'
    const subject = `Cèrcol daily — ${data.day}: ${fmt(product.signups[0])} signups, ${fmt(product.tests[0])} tests${warns.length ? ` · ${warns.length} warning${warns.length > 1 ? 's' : ''}` : ''}`
    const res = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: 'Cèrcol <noreply@cercol.team>', to: [to], subject, html: dailyHtml(data, env.FRONTEND_URL) }) })
    if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
  }
  return { day: data.day, signups: product.signups[0], tests: product.tests[0], warnings: warns.length, data }
}
