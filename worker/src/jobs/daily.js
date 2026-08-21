/**
 * Daily brief: what happened yesterday, and whether anything is near a
 * limit. Short on purpose. The weekly digest is the full picture; this is
 * the glance that says "who arrived, what they did, which article moved,
 * and the platform is fine" or flags the one thing that is not.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Sections, in order of how fast you want to know:
 *   1. What to do today: the platform warnings (each carrying its own
 *      remedy) followed by the growth signals worth a hand, at most five,
 *      numbered. When nothing crosses a line it says so in one green line.
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
 * Whether Google will index the pages at all is asked separately, in
 * jobs/indexing.js, and its answers join the to-do list at the top.
 *
 * Runs on the 04:00 UTC trigger, after purge-tokens, and sends to
 * DIGEST_EMAIL like the weekly one. Every gatherer degrades to a
 * placeholder rather than aborting, so the email always sends.
 */

import { query as bq } from '../bigquery.js'
import { KV_KEY as INDEXING_KEY, indexingActions } from './indexing.js'
import { KV_KEY as LANGUAGES_KEY, languageActions } from './languages.js'
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
// Impressions a single page needs in one day before "ranking without clicks"
// says anything. Below this it is noise, and the brief asked for a rewrite on
// the strength of three impressions.
export const ZERO_CLICK_MIN_IMPRESSIONS = 10

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
  // Clicks on the two instrument cards BlogTestCTA renders in every article,
  // by the article they were clicked from. Every article carries both cards
  // unconditionally, so "does it point at an instrument" is never the
  // question; whether anybody took the bridge is.
  const ctaBySlug = Object.fromEntries((await q(`SELECT slug, COUNT(*) AS n FROM events
      WHERE name='cta_click' AND slug IS NOT NULL AND created_at >= ? AND created_at < ? GROUP BY slug`, ...Y))
    .map((r) => [r.slug, Number(r.n)]))
  const takingOff = reads.filter((r) => r.y >= 5 && r.y >= 3 * r.avg7).map((r) => [titles[r.slug] || r.slug, r.slug, r.y, r.avg7, ctaBySlug[r.slug] || 0])
  // How far the ones who did not finish got: the deepest tenth each visitor
  // reached, from the test_progress events the instrument pages emit. The
  // slug column carries the percentage (see worker/src/writes.js).
  // ponytail: visitors with no anon_id share one bucket. At this volume that
  // is one row, and giving them ids is a privacy decision, not a fix.
  const dropOff = (await q(`SELECT instrument, MAX(CAST(slug AS INTEGER)) AS pct
      FROM events WHERE name='test_progress' AND created_at >= ? AND created_at < ?
     GROUP BY anon_id, instrument ORDER BY pct DESC LIMIT 5`, ...Y))
    .map((r) => [LABELS[r.instrument] || r.instrument, r.pct])
  // What each person who started a test actually did that day, summarised.
  // "One lone test_start" and "read two articles, then started" are the same
  // line in the funnel and completely different events; whoever reads the
  // task list needs to be able to tell them apart without the database.
  const trails = (await q(`SELECT anon_id, name, COUNT(*) AS n, MAX(CAST(slug AS INTEGER)) AS pct, MIN(created_at) AS t0
      FROM events
     WHERE created_at >= ?1 AND created_at < ?2 AND anon_id IN (
           SELECT anon_id FROM events WHERE name='test_start' AND created_at >= ?1 AND created_at < ?2 AND anon_id IS NOT NULL)
     GROUP BY anon_id, name ORDER BY anon_id, t0 LIMIT 60`, ...Y))
  const starters = {}
  for (const r of trails) {
    // Short id only: these lines are published to a public issue, and eight
    // characters are enough to tell two visitors apart for one day.
    const id = String(r.anon_id).slice(0, 8)
    ;(starters[id] ||= []).push({ name: r.name, n: r.n, pct: r.name === 'test_progress' ? r.pct : null, at: String(r.t0).slice(11, 16) })
  }
  const totals = { users: await count(db, `SELECT COUNT(*) AS n FROM auth_users`), tests: await count(db, `SELECT COUNT(*) AS n FROM results WHERE is_seed = 0`) }
  return { signups, tests, pageViews, visitors, starts, byInstrument, byLang, topPages, newUsers, witness, top, takingOff, dropOff, starters, totals }
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
    const tq = await bq(env, `SELECT query, SUM(clicks) AS clicks, SUM(impressions) AS impressions, SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) AS pos,
      ARRAY_AGG(url ORDER BY impressions DESC LIMIT 1)[OFFSET(0)] AS url FROM ${gt} WHERE data_date = '${d}' AND query IS NOT NULL GROUP BY query ORDER BY clicks DESC, impressions DESC LIMIT 6`)
    // A page with real exposure and no clicks is a title and description
    // problem. A single query with three impressions is weather: at ~470
    // impressions a day spread over a hundred articles, every query looks
    // like that, and the brief was asking for a rewrite on the strength of
    // three of them.
    const zc = await bq(env, `SELECT url, SUM(clicks) AS clicks, SUM(impressions) AS impressions,
      SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) AS pos FROM ${gt}
      WHERE data_date = '${d}' AND url IS NOT NULL GROUP BY url
      HAVING clicks = 0 AND impressions >= ${ZERO_CLICK_MIN_IMPRESSIONS} AND pos <= 10
      ORDER BY impressions DESC LIMIT 1`)
    const cur = rows[0] || {}, prev = rows[1] || {}
    return { day: d,
      zeroClick: zc[0] ? [zc[0].url, Number(zc[0].impressions), Number(zc[0].pos)] : null, clicks: [Number(cur.clicks || 0), Number(prev.clicks || 0)], impressions: [Number(cur.impressions || 0), Number(prev.impressions || 0)],
      queries: tq.map((r) => [r.query, Number(r.clicks), Number(r.impressions), r.pos == null ? null : Number(r.pos), r.url || null]) }
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
    // CPU p99 sat above the 10 ms budget every single day without a single
    // request being killed for it, so the number alone is noise. What matters
    // is Cloudflare actually terminating requests: that shows up as
    // exceededResources. The p99 stays visible in the platform table.
    const killed = pl.worker.byStatus.find(([s]) => s === 'exceededResources')
    if (killed) w.push(`${fmt(killed[1])} request(s) killed for exceeding the 10 ms CPU budget (p99 ${pl.worker.cpuP99.toFixed(1)} ms).`)
    // clientDisconnected is a visitor closing the tab, not a fault.
    const faults = pl.worker.byStatus.filter(([s]) => s !== 'clientDisconnected' && s !== 'exceededResources')
    if (faults.length) w.push(`${fmt(faults.reduce((n, [, v]) => n + v, 0))} API error(s): ${faults.map(([s, n]) => `${s} ${fmt(n)}`).join(', ')}. Read them with <code>npx wrangler tail cercol-api --status error</code>.`)
  }
  if (pl.mailCredit != null && pl.mailCredit < 0.15) w.push(`Purelymail credit is $${pl.mailCredit.toFixed(2)}: top up.`)
  return w
}

// -- HTML ------------------------------------------------------------------
const vs = (cur, prev) => delta(cur, prev) + `<span style="font-size:11px;color:${C.muted};"> vs last week</span>`
const pctOf = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—')
const link = (href, t) => `<a href="${href}" style="color:${C.blue};text-decoration:underline;">${esc(t)}</a>`

/**
 * The short list of things worth doing today, most blocking first. Every
 * line names the number that triggered it and where to go, because a brief
 * that only reports is a brief you stop opening. The platform warnings come
 * first (they already carry their own remedy), then the growth signals:
 * a funnel that broke, an article taking off, a query ranking without
 * clicks. Capped at five so it stays a list and not a fourth table.
 */
export function actions(d, frontendUrl = 'https://cercol.team') {
  const { product: pr, search: se } = d
  const out = [...(d.warns || []), ...indexingActions(d.indexing), ...languageActions(d.languages, frontendUrl)]

  // Funnel. Two different failures, never both: nobody starts, or they
  // start and drop out. The second one usually means a broken instrument.
  if (pr.starts[0] > 0 && pr.tests[0] === 0) {
    const where = (pr.dropOff || []).map(([inst, pct]) => `${inst} at ${pct}%`).join(', ')
    out.push(`${fmt(pr.starts[0])} started a test and none finished${where ? `, getting as far as ${where}` : ' (nobody reached the first tenth)'}. Take that instrument from there and watch the console.`)
  } else if (pr.starts[0] === 0 && pr.visitors[0] >= 10) {
    const [path] = pr.topPages[0] || []
    out.push(`${fmt(pr.visitors[0])} visitors, nobody started a test. Most-visited page: ${path ? link(frontendUrl + path, path) : 'none recorded'} &mdash; check what it asks the reader to do next.`)
  }

  // An article moving three times its own pace is the cheapest lever there is.
  // This line used to end "Make sure it points at an instrument", which was
  // advice nobody could ever act on: BlogTestCTA renders an instrument card
  // early and another at the end of every article, with no way to switch them
  // off, so the answer was always yes. What varies, and what says whether the
  // extra readers were worth having, is whether either card was clicked.
  if (pr.takingOff.length) {
    const [t, slug, y, avg, cta = 0] = pr.takingOff[0]
    const pace = avg < 0.1 ? 'in its first week out' : `against ${avg.toFixed(1)}/day`
    const bridge = cta > 0
      ? `${fmt(cta)} of them went on to an instrument.`
      : 'Not one of them went on to an instrument: both cards are on the page, so it is the copy on them that is not landing.'
    out.push(`${link(`${frontendUrl}/blog/${slug}/`, t)} is taking off: ${fmt(y)} reads ${pace}. ${bridge}`)
  }

  // Ranking on page one and getting nothing: a title and description problem.
  if (se?.zeroClick) {
    const [url, impr, pos] = se.zeroClick
    out.push(`${link(url, new URL(url).pathname)} took ${fmt(impr)} impressions at position ${pos.toFixed(1)} yesterday and not one click. Its title and description are what a searcher decides on.`)
  }
  return out.slice(0, 5)
}

export function dailyHtml(data, frontendUrl = 'https://cercol.team') {
  const { day: d, product: pr, platform: pl, search: se } = data
  const weekday = new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  const todo = actions(data, frontendUrl)
  const parts = [h1('Daily brief'), sub(`${weekday} &middot; ${fmt(pr.totals.users)} accounts and ${fmt(pr.totals.tests)} tests all-time`)]

  // 1. What to do, before any number. Numbered, so "three things" is literal.
  parts.push(todo.length
    ? callout(todo.map((t, i) => `<strong style="color:${C.blue};">${i + 1}.</strong> ${t}`), 'todo')
    : callout(['&#10003; Nothing needs you today: platform within limits, no broken funnel.'], 'ok'))

  // 2. Yesterday. Two by two, so the comparison line fits next to the number.
  parts.push(statRow([
    stat('Signups', fmt(pr.signups[0]), vs(...pr.signups), C.red),
    stat('Tests finished', fmt(pr.tests[0]), vs(...pr.tests), C.blue),
  ]))
  parts.push(statRow([
    stat('Visitors', fmt(pr.visitors[0]), vs(...pr.visitors), C.green),
    stat('Page views', fmt(pr.pageViews[0]), vs(...pr.pageViews), C.yellow),
  ]))
  parts.push(p(`${fmt(pr.visitors[0])} visitors &rarr; ${fmt(pr.starts[0])} started a test &rarr; ${fmt(pr.tests[0])} finished (${pctOf(pr.tests[0], pr.starts[0])} of starters, ${pctOf(pr.tests[0], pr.visitors[0])} of visitors)`))
  if (pr.byLang.length) parts.push(p(`Visitors by language: ${pr.byLang.map(([l, n]) => `${l} ${fmt(n)}`).join(' &middot; ')}`, true))
  if (pr.byInstrument.length) parts.push(table(['Tests yesterday', 'Lang', 'N'], pr.byInstrument.map(([i, l, n]) => [i, l, fmt(n)]), ['left', 'left', 'right']))

  // 3. People
  let people = pr.newUsers.length
    ? table(['New account', 'Name', 'Lang', 'At (UTC)', 'Tests'], pr.newUsers.map((u) => [esc(u.email), esc(`${u.first_name || ''} ${u.last_name || ''}`.trim()) || '—', u.native_language || '—', String(u.created_at).slice(11, 16), u.tests ? `<span style="color:${C.green};">&#10003; ${u.tests}</span>` : '<span style="color:' + C.muted + ';">not yet</span>']), ['left', 'left', 'left', 'right', 'right'])
    : empty('No new accounts yesterday.')
  const wt = pr.witness
  if (wt.created || wt.completed || wt.groups) people += p(`Witness: ${fmt(wt.created)} invited, ${fmt(wt.completed)} completed &middot; ${fmt(wt.groups)} new group${wt.groups === 1 ? '' : 's'}`, true)
  parts.push(section('People', people, C.red))

  // 4. Content. Reads against the article's own pace, so a 1 next to a 2.3
  // average reads as "cooling", not as a number with no scale.
  const art = (t, slug) => `<a href="${frontendUrl}/blog/${slug}/" style="color:${C.ink};text-decoration:none;">${esc(t)}</a>`
  // Fewer than three reads says nothing about pace: one read against a 0.1
  // average is a 10x that means nothing. Show a multiplier only above that.
  const pace = (y, avg) => (y < 3 ? `<span style="color:${C.muted};">&ndash;</span>` : avg < 0.1 ? '<span style="color:' + C.muted + ';">new</span>' : y >= 2 * avg ? `<span style="color:${C.green};">&#9650; ${(y / avg).toFixed(1)}&times;</span>` : y <= 0.5 * avg ? `<span style="color:${C.muted};">&#9660; ${(y / avg).toFixed(1)}&times;</span>` : `<span style="color:${C.muted};">&asymp;</span>`)
  let content = pr.top.length
    ? table(['Top articles', 'Reads', 'vs own pace'], pr.top.map(([t, s, y, a]) => [art(t, s), fmt(y), pace(y, a)]), ['left', 'right', 'right'])
    : empty('No article reads recorded yesterday.')
  // Top pages minus the blog ones: those are already the table above.
  const nonArticle = pr.topPages.filter(([pth]) => !pth.includes('/blog/')).slice(0, 5)
  if (nonArticle.length) content += `<div style="margin-top:12px;">${table(['Top pages (non-blog)', 'Views'], nonArticle.map(([pth, n]) => [`<span style="font-size:12px;">${esc(pth)}</span>`, fmt(n)]), ['left', 'right'])}</div>`
  parts.push(section('Content', content, C.yellow))

  // 5. Search
  if (se && !se.pending) {
    let s = statRow([stat('Clicks', fmt(se.clicks[0]), delta(se.clicks[0], se.clicks[1]) + `<span style="font-size:11px;color:${C.muted};"> vs day before</span>`, C.blue), stat('Impressions', fmt(se.impressions[0]), delta(se.impressions[0], se.impressions[1]) + `<span style="font-size:11px;color:${C.muted};"> vs day before</span>`, C.green)])
    if (se.queries.length) s += table(['Query', 'Clicks', 'Impr.', 'Pos.'], se.queries.map(([q, c, i, pos]) => [esc(q), fmt(c), fmt(i), pos != null ? pos.toFixed(1) : '&ndash;']), ['left', 'right', 'right', 'right'])
    parts.push(section(`Google Search &middot; ${se.day} (latest export)`, s, C.green))
  }

  // 6. Platform. Only the meters worth a glance; the rest is in the warnings.
  if (!pl.pending && !pl.error) {
    // ponytail: static-asset requests (cercol-web) are free and uncounted; only the API Worker meters.
    const rows = [
      ['API requests', fmt(pl.worker.requests), bar(pl.worker.requests, CAPS.workerRequests)],
      ['API CPU p50 / p99', `${pl.worker.cpuP50.toFixed(1)} / ${pl.worker.cpuP99.toFixed(1)} ms`, `<span style="font-size:12px;color:${C.muted};">10 ms budget, nothing killed</span>`],
      ['D1 rows read', fmt(pl.d1.rowsRead), bar(pl.d1.rowsRead, CAPS.d1RowsRead)],
      ['D1 rows written', fmt(pl.d1.rowsWritten), bar(pl.d1.rowsWritten, CAPS.d1RowsWritten)],
      ['KV writes', fmt(pl.kv.write || 0), bar(pl.kv.write || 0, CAPS.kvWrites)],
    ]
    const killed = pl.worker.byStatus.find(([st]) => st === 'exceededResources')
    if (killed) rows[1][2] = `<span style="font-size:12px;color:${C.red};">${fmt(killed[1])} killed at the 10 ms budget</span>`
    if (pl.worker.errors) rows.push(['API errors', `<span style="color:${C.red};">${fmt(pl.worker.errors)}</span>`, pl.worker.byStatus.map(([st, n]) => `<span style="font-size:12px;color:${C.muted};">${st} ${fmt(n)}</span>`).join(' ')])
    if (pl.mailCredit != null) rows.push(['Purelymail credit', `$${pl.mailCredit.toFixed(2)}`, `<span style="font-size:12px;color:${C.muted};">pay-as-you-go</span>`])
    if (data.decommissionIn > 0) rows.push(['Hetzner decommission', `in ${data.decommissionIn} day${data.decommissionIn === 1 ? '' : 's'}`, `<span style="font-size:12px;color:${C.muted};">${DECOMMISSION_DUE}, then scripts/decommission-hetzner.sh</span>`])
    parts.push(section('Platform &middot; free-plan caps', table(['', 'Yesterday', 'Of cap'], rows, ['left', 'right', 'left']), C.blue))
  }
  return shell(parts.join(''), { frontendUrl, footer: 'Daily brief from the Cèrcol Worker, 04:00 UTC. The weekly digest on Monday has the full picture.' })
}

/**
 * Strip the HTML the email markup puts in an action back to plain text, so
 * the same line reads as well in a GitHub issue as in a mail client.
 */
export function plainAction(html) {
  return String(html)
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
    .replace(/<\/?(code|strong|span|em)[^>]*>/g, '`')
    .replace(/`{2,}/g, '`')
    .replace(/<[^>]+>/g, '')
    .replace(/&mdash;/g, '—').replace(/&ldquo;|&rdquo;/g, '"').replace(/&amp;/g, '&')
    .replace(/&rarr;/g, '->').replace(/&#10003;/g, 'v').replace(/&middot;/g, '·')
    .trim()
}

/**
 * The facts behind the lines that cannot be checked from outside the
 * database, so whoever picks the list up does not have to be trusted with a
 * production credential to tell a person from a crawler.
 */
function evidenceSection({ starters = {} } = {}) {
  const ids = Object.keys(starters)
  if (!ids.length) return []
  const out = ['<details><summary>What each person who started a test did that day</summary>', '']
  for (const id of ids) {
    const parts = starters[id].map((e) => {
      if (e.name === 'test_progress') return `reached ${e.pct}%`
      return `${e.name} x${e.n} (first at ${e.at})`
    })
    out.push(`- \`${id}\`: ${parts.join(', ')}`)
  }
  out.push('', 'A visitor with nothing but a single test_start is very likely automated.', '</details>', '')
  return out
}

/**
 * Leave the day's to-do list where the work actually happens.
 *
 * The email renders the list and then it is stuck in a mailbox: nothing can
 * pick it up, tick items off, or say "that abandoned test was an agent, not
 * a person". A GitHub issue is the same list somewhere both a human and a
 * Claude Code session already have the keys to.
 *
 * Silent no-op without GITHUB_TOKEN, and a failure here never fails the
 * brief: the mail is the channel that must go out.
 */
export async function fileTasks(env, dayIso, todo, evidence = {}) {
  if (!env.GITHUB_TOKEN || !todo.length) return null
  const repo = env.GITHUB_REPO || 'Cercol/cercol'
  const body = [
    `From the daily brief for ${dayIso}. Each line is what the numbers said, not a verdict:`,
    '',
    ...todo.map((t, i) => `${i + 1}. [ ] ${plainAction(t)}`),
    '',
    ...evidenceSection(evidence),
    'Close with a reason if an item turns out to be noise; that reason is what tells us which rule to fix.',
  ].join('\n')
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'user-agent': 'cercol-api', 'content-type': 'application/json' },
      body: JSON.stringify({ title: `Cèrcol daily — ${dayIso}: ${todo.length} to do`, body }),
    })
    if (!res.ok) return { error: `github ${res.status}` }
    return { number: (await res.json()).number }
  } catch (e) {
    return { error: e.message }
  }
}

export async function runDaily(env, { send = true } = {}) {
  const b = dayBounds()
  const product = await gatherProduct(env.DB, b)
  const platform = await gatherPlatform(env, b)
  const search = await gatherSearch(env)
  // Written by seo-indexing on the 05:00 trigger: asking Google directly
  // costs nine subrequests and this invocation cannot spare them.
  const indexing = env.NORMS ? await env.NORMS.get(INDEXING_KEY, 'json') : null
  // Same arrangement: computed at 05:00 over 28 days, read here.
  const languages = env.NORMS ? await env.NORMS.get(LANGUAGES_KEY, 'json') : null
  const decommissioned = env.HETZNER_DECOMMISSIONED === '1'
  const warns = warnings(platform, { today: day(b.y1), decommissioned })
  const decommissionIn = decommissioned ? 0 : Math.ceil((Date.parse(DECOMMISSION_DUE) - b.y1.getTime()) / 86400e3)
  const data = { day: day(b.y0), product, platform, search, indexing, languages, warns, decommissionIn }
  const issue = send ? await fileTasks(env, data.day, actions(data, env.FRONTEND_URL), { starters: product.starters }) : null
  // A to-do list that quietly failed to be filed is worse than no list at
  // all: the brief would look normal and the tasks would exist nowhere.
  if (issue?.error) data.warns.push(`The task list could not be filed as an issue (${issue.error}). Check the GITHUB_TOKEN secret on the Worker.`)
  const todo = actions(data, env.FRONTEND_URL)
  if (send) {
    const to = env.DIGEST_EMAIL || 'hello@cercol.team'
    const subject = `Cèrcol daily — ${data.day}: ${todo.length ? `${todo.length} to do` : 'nothing to do'} · ${fmt(product.signups[0])} signups, ${fmt(product.tests[0])} tests`
    const res = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: 'Cèrcol <noreply@cercol.team>', to: [to], subject, html: dailyHtml(data, env.FRONTEND_URL) }) })
    if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
  }
  return { day: data.day, signups: product.signups[0], tests: product.tests[0], warnings: warns.length, todo: todo.length, issue, data }
}
