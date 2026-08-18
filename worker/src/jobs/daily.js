/**
 * Daily brief: what happened yesterday, and whether anything is near a
 * limit. Short on purpose. The weekly digest is the full picture; this is
 * the glance that says "signups, tests, one article moving, and the
 * platform is fine" or flags the one thing that is not.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Sections, in order of how fast you want to know:
 *   1. Yesterday: signups, tests (by instrument), page views, visitors,
 *      each with the same weekday a week ago for a sense of scale.
 *   2. Articles: top reads yesterday, and any article whose reads jumped
 *      against its own 7-day daily average (an article "taking off").
 *   3. Platform limits: D1 rows read/written vs the free-plan daily caps,
 *      Worker requests and CPU p99, Purelymail credit, cron health (each
 *      job's last run). A line turns into a warning at 70% of a cap.
 *   4. New signups by name/email, if any, because on a project this size
 *      you want to know who arrived.
 *
 * Runs on the 04:00 UTC trigger, after purge-tokens, and reads D1 for the
 * product numbers and Cloudflare GraphQL for the platform numbers. It
 * sends to DIGEST_EMAIL like the weekly one.
 */

const LABELS = { newMoon: 'New Moon', firstQuarter: 'First Quarter', fullMoon: 'Full Moon' }
const BLUE = '#0047ba', RED = '#cf3339', DARK = '#111111', GRAY = '#6b7280', LIGHT = '#f9fafb', WHITE = '#ffffff', GREEN = '#16a34a', BORDER = '#e5e7eb', AMBER = '#b45309'
const fmt = (n) => Number(n || 0).toLocaleString('en-US')
const iso = (d) => d.toISOString().replace('Z', '+00:00')

// Free-plan caps this deployment lives under (developers.cloudflare.com, Aug 2026).
export const CAPS = { d1RowsRead: 5_000_000, d1RowsWritten: 100_000, workerRequests: 100_000, workerCpuMs: 10 }
const WARN_AT = 0.7

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
  const byInstrument = (await q(`SELECT instrument, language, COUNT(*) AS n FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ? GROUP BY instrument, language ORDER BY n DESC`, ...Y))
    .map((r) => [LABELS[r.instrument] || r.instrument, r.language || '—', r.n])
  const newUsers = await q(`SELECT u.email, p.first_name, p.last_name, p.native_language, u.created_at FROM auth_users u LEFT JOIN profiles p ON p.id = u.id WHERE u.created_at >= ? AND u.created_at < ? ORDER BY u.created_at`, ...Y)
  // Reads yesterday vs the article's own 7-day daily average.
  const reads = await q(`
    SELECT slug,
           SUM(CASE WHEN created_at >= ?1 AND created_at < ?2 THEN 1 ELSE 0 END) AS y,
           SUM(CASE WHEN created_at >= ?3 AND created_at < ?1 THEN 1 ELSE 0 END) / 7.0 AS avg7
      FROM events WHERE name='article_view' AND slug IS NOT NULL AND created_at >= ?3 AND created_at < ?2
     GROUP BY slug ORDER BY y DESC LIMIT 40`, iso(b.y0), iso(b.y1), iso(b.avg0))
  const titles = Object.fromEntries((await q(`SELECT slug, json_extract(title, '$.en') AS t FROM blog_posts`)).map((r) => [r.slug, r.t]))
  const top = reads.filter((r) => r.y > 0).slice(0, 8).map((r) => [titles[r.slug] || r.slug, r.y, r.avg7])
  const takingOff = reads.filter((r) => r.y >= 5 && r.avg7 > 0 && r.y >= 3 * r.avg7).map((r) => [titles[r.slug] || r.slug, r.y, r.avg7])
  const totals = { users: await count(db, `SELECT COUNT(*) AS n FROM auth_users`), tests: await count(db, `SELECT COUNT(*) AS n FROM results WHERE is_seed = 0`) }
  return { signups, tests, pageViews, visitors, byInstrument, newUsers, top, takingOff, totals }
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
  const day = b.y0.toISOString().slice(0, 10)
  try {
    const d = await gql(env, `{ viewer { accounts(filter:{accountTag:"${env.CF_ACCOUNT_ID}"}) {
      d1: d1AnalyticsAdaptiveGroups(limit:1, filter:{date:"${day}"}) { sum { rowsRead rowsWritten } }
      w: workersInvocationsAdaptive(limit:1, filter:{date:"${day}", scriptName:"cercol-api"}) { sum { requests errors } quantiles { cpuTimeP50 cpuTimeP99 } }
    } } }`)
    const a = d.viewer.accounts[0]
    const d1 = a.d1?.[0]?.sum || {}, w = a.w?.[0] || {}
    out.d1 = { rowsRead: d1.rowsRead || 0, rowsWritten: d1.rowsWritten || 0 }
    out.worker = { requests: w.sum?.requests || 0, errors: w.sum?.errors || 0, cpuP50: (w.quantiles?.cpuTimeP50 || 0) / 1000, cpuP99: (w.quantiles?.cpuTimeP99 || 0) / 1000 }
  } catch (e) { out.error = e.message }
  try {
    const r = await fetch('https://purelymail.com/api/v0/checkAccountCredit', { method: 'POST', headers: { 'Purelymail-Api-Token': env.PURELYMAIL_API_KEY || '', 'content-type': 'application/json' }, body: '{}' })
    const j = await r.json(); out.mailCredit = j?.result?.credit != null ? Number(j.result.credit) : null
  } catch { out.mailCredit = null }
  return out
}

/** Warnings, each a short sentence, from the platform numbers. */
export function warnings(pl) {
  const w = []
  if (pl.pending) return ['Platform metrics not configured (CF_ANALYTICS_TOKEN / CF_ACCOUNT_ID).']
  if (pl.error) w.push(`Cloudflare analytics query failed: ${pl.error}`)
  if (pl.d1) {
    if (pl.d1.rowsRead >= CAPS.d1RowsRead * WARN_AT) w.push(`D1 rows read yesterday ${fmt(pl.d1.rowsRead)} — ${Math.round(pl.d1.rowsRead / CAPS.d1RowsRead * 100)}% of the 5M/day free cap.`)
    if (pl.d1.rowsWritten >= CAPS.d1RowsWritten * WARN_AT) w.push(`D1 rows written yesterday ${fmt(pl.d1.rowsWritten)} — ${Math.round(pl.d1.rowsWritten / CAPS.d1RowsWritten * 100)}% of the 100k/day free cap.`)
  }
  if (pl.worker) {
    if (pl.worker.requests >= CAPS.workerRequests * WARN_AT) w.push(`Worker requests yesterday ${fmt(pl.worker.requests)} — ${Math.round(pl.worker.requests / CAPS.workerRequests * 100)}% of the 100k/day free cap.`)
    if (pl.worker.cpuP99 > CAPS.workerCpuMs) w.push(`Worker CPU p99 ${pl.worker.cpuP99.toFixed(1)} ms, above the 10 ms free budget.`)
    if (pl.worker.errors > 0) w.push(`${fmt(pl.worker.errors)} Worker error(s) yesterday.`)
  }
  if (pl.mailCredit != null && pl.mailCredit < 0.15) w.push(`Purelymail credit is $${pl.mailCredit.toFixed(2)}: top up.`)
  return w
}

// -- HTML ------------------------------------------------------------------
const h1 = (t) => `<h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:${DARK};">${t}</h1>`
const p = (t, muted = false) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${muted ? GRAY : DARK};">${t}</p>`
const section = (title, body) => `<div style="margin-top:24px;padding-top:16px;border-top:2px solid ${BLUE};"><h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${DARK};">${title}</h2>${body}</div>`
const empty = (t) => `<p style="margin:0;font-size:13px;color:${GRAY};font-style:italic;">${t}</p>`
function table(headers, rows, aligns) {
  aligns = aligns || headers.map(() => 'left')
  const head = headers.map((h, i) => `<th style="padding:6px 10px;text-align:${aligns[i]};font-size:12px;color:${GRAY};background:${LIGHT};border-bottom:1px solid ${BORDER};font-weight:600;">${h}</th>`).join('')
  const body = rows.map((r) => `<tr>${r.map((c, i) => `<td style="padding:6px 10px;text-align:${aligns[i]};font-size:13px;color:${DARK};border-bottom:1px solid ${BORDER};">${c}</td>`).join('')}</tr>`).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}
const card = (label, cur, prev) => {
  const d = cur - prev, col = d > 0 ? GREEN : d < 0 ? RED : GRAY, arrow = d > 0 ? '&#9650;' : d < 0 ? '&#9660;' : '&#8211;'
  return `<td style="padding:10px 8px;text-align:center;vertical-align:top;background:${LIGHT};border:1px solid ${BORDER};border-radius:8px;"><div style="font-size:26px;font-weight:700;color:${DARK};line-height:1.1;">${fmt(cur)}</div><div style="font-size:12px;color:${GRAY};margin-top:2px;">${label}</div><div style="font-size:11px;color:${col};margin-top:2px;">${arrow} ${d >= 0 ? '+' : ''}${d} vs same day last week</div></td>`
}
const bar = (v, cap) => { const pct = Math.min(100, Math.round(v / cap * 100)); const col = pct >= 70 ? RED : pct >= 40 ? AMBER : GREEN; return `<div style="background:${BORDER};height:6px;border-radius:3px;overflow:hidden;width:120px;display:inline-block;vertical-align:middle;"><div style="width:${pct}%;height:100%;background:${col};"></div></div> <span style="font-size:12px;color:${GRAY};">${pct}%</span>` }

export function dailyHtml(data, frontendUrl = 'https://cercol.team') {
  const { day, product: pr, platform: pl, warns } = data
  const parts = [h1(`Daily brief &mdash; ${day}`)]
  if (warns.length) parts.push(`<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;margin:0 0 12px;">${warns.map((w) => `<div style="font-size:13px;color:${RED};">&#9888; ${w}</div>`).join('')}</div>`)
  else parts.push(p('&#10003; Platform within limits.', true))
  parts.push(`<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;"><tr>${[card('Signups', ...pr.signups), card('Tests', ...pr.tests), card('Page views', ...pr.pageViews), card('Visitors', ...pr.visitors)].join('<td style="width:8px;"></td>')}</tr></table>`)
  parts.push(p(`All-time: ${fmt(pr.totals.users)} accounts, ${fmt(pr.totals.tests)} tests.`, true))
  if (pr.byInstrument.length) parts.push(section('Tests yesterday', table(['Instrument', 'Lang', 'N'], pr.byInstrument.map(([i, l, n]) => [i, l, fmt(n)]), ['left', 'left', 'right'])))
  if (pr.newUsers.length) parts.push(section('New accounts', table(['Email', 'Name', 'Lang', 'At (UTC)'], pr.newUsers.map((u) => [u.email, `${u.first_name || ''} ${u.last_name || ''}`.trim() || '—', u.native_language || '—', String(u.created_at).slice(11, 16)]))))
  if (pr.takingOff.length) parts.push(section('&#128293; Taking off', table(['Article', 'Reads', '7-day avg'], pr.takingOff.map(([t, y, a]) => [t, fmt(y), a.toFixed(1)]), ['left', 'right', 'right'])))
  parts.push(section('Top articles yesterday', pr.top.length ? table(['Article', 'Reads', '7-day avg'], pr.top.map(([t, y, a]) => [t, fmt(y), a.toFixed(1)]), ['left', 'right', 'right']) : empty('No article reads recorded yesterday.')))
  if (!pl.pending && !pl.error) {
    const rows = [
      ['D1 rows read', fmt(pl.d1.rowsRead), bar(pl.d1.rowsRead, CAPS.d1RowsRead)],
      ['D1 rows written', fmt(pl.d1.rowsWritten), bar(pl.d1.rowsWritten, CAPS.d1RowsWritten)],
      ['Worker requests', fmt(pl.worker.requests), bar(pl.worker.requests, CAPS.workerRequests)],
      ['Worker CPU p50 / p99', `${pl.worker.cpuP50.toFixed(1)} / ${pl.worker.cpuP99.toFixed(1)} ms`, bar(pl.worker.cpuP99, CAPS.workerCpuMs)],
      ['Worker errors', fmt(pl.worker.errors), ''],
    ]
    if (pl.mailCredit != null) rows.push(['Purelymail credit', `$${pl.mailCredit.toFixed(2)}`, ''])
    parts.push(section('Platform (free-plan caps)', table(['Metric', 'Yesterday', 'Of cap'], rows, ['left', 'right', 'left'])))
  }
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Cèrcol</title></head>
<body style="margin:0;padding:0;background:${LIGHT};font-family:Arial,Helvetica,sans-serif;color:${DARK};"><table width="100%" cellpadding="0" cellspacing="0" style="background:${LIGHT};padding:32px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:${BLUE};border-radius:12px 12px 0 0;padding:20px 32px;"><img src="${frontendUrl}/email-logo.png" alt="Cèrcol" width="160" height="67" style="display:block;border:0;" /></td></tr>
<tr><td style="background:${WHITE};padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">${parts.join('')}</td></tr>
<tr><td style="background:${LIGHT};border-radius:0 0 12px 12px;padding:20px 32px;border:1px solid #e5e7eb;border-top:none;"><p style="margin:0;font-size:12px;color:${GRAY};line-height:1.5;">Daily brief from the Cèrcol Worker. The weekly digest on Monday has the full picture.</p></td></tr>
</table></td></tr></table></body></html>`
}

export async function runDaily(env, { send = true } = {}) {
  const b = dayBounds()
  const product = await gatherProduct(env.DB, b)
  const platform = await gatherPlatform(env, b)
  const warns = warnings(platform)
  const data = { day: b.y0.toISOString().slice(0, 10), product, platform, warns }
  if (send) {
    const to = env.DIGEST_EMAIL || 'hello@cercol.team'
    const subject = `Cèrcol daily — ${data.day}: ${fmt(product.signups[0])} signups, ${fmt(product.tests[0])} tests${warns.length ? ` · ${warns.length} warning${warns.length > 1 ? 's' : ''}` : ''}`
    const res = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: 'Cèrcol <noreply@cercol.team>', to: [to], subject, html: dailyHtml(data, env.FRONTEND_URL) }) })
    if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
  }
  return { day: data.day, signups: product.signups[0], tests: product.tests[0], warnings: warns.length, data }
}
