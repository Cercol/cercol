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
/**
 * Impressions a page needs, at its position, before "ranking without clicks"
 * says anything.
 *
 * A flat floor cannot work, because what zero clicks means depends entirely on
 * where the page sits. At position 2 a handful of impressions with no click is
 * odd; at position 9 it is the expected outcome. The old floor of ten treated
 * them the same and produced items nobody could act on: the brief asked for a
 * rewrite of a good title on 168 impressions at position 8.0, where zero
 * clicks has about an 8% chance of happening on any given day.
 *
 * So the floor is the number of impressions at which zero clicks drops below a
 * one-in-twenty chance, given the click-through rate typical of that position:
 * n > ln(0.05) / ln(1 - ctr). Under that, silence is what the maths predicts
 * and the brief has nothing to report.
 */
const POSITION_CTR = [[3, 0.10], [7, 0.04], [10, 0.015]]

/**
 * How far back to look for days the Search Console bulk export never
 * delivered. Two weeks: Google retries a failed day for about one, so
 * anything older is already lost and reporting it every morning forever
 * would be noise rather than a task.
 */
export const EXPORT_WINDOW_DAYS = 14

export function zeroClickFloor(pos) {
  const ctr = (POSITION_CTR.find(([p]) => pos <= p) || [null, 0.005])[1]
  return Math.ceil(Math.log(0.05) / Math.log(1 - ctr))
}
// Reads one article needs in one day before "nobody clicked through" says
// anything about the cards on it. Cèrcol converts an article read to a
// cta_click about 0.5% of the time (6 clicks in 1,299 reads, all time to
// 2026-08-22), so twelve reads expect 0.06 of a click: a silent day is the
// prediction, not a finding, and the brief spent 2026-08-21 asking for a
// copy rewrite on the strength of it. At that rate 150 reads is where a day
// with no click stops being the likeliest outcome; below it the line reports
// the reads and keeps its opinion to itself.
export const CTA_CLAIM_MIN_READS = 150
// Visitors one day needs before "nobody started a test" says anything about
// the site. Cèrcol converts a visitor to a test starter about 1.8% of the
// time (27 starters in 1,487 distinct visitors, all time to 2026-08-27), so
// a 22-visitor day predicts 0.4 starts: a start-less day is the likeliest
// outcome, and the line fired on it anyway (the 2026-08-26 brief pointed at
// an article the wave had reviewed the day before). At that rate 165
// visitors is where a day with no start stops being explainable by chance
// (p < 0.05); below it the funnel table already carries the numbers without
// raising a task.
export const ZERO_START_MIN_VISITORS = 165
// Starters one day needs before "none finished" says anything about the
// instrument. A Cèrcol starter finishes about 75% of the time (12 completed
// tests for 16 distinct starters, 28 days to 2026-09-01), so a lone starter
// abandoning is the expected outcome one day in four — and the line fired on
// one anyway (the 2026-08-31 brief sent someone to watch the console over a
// single visitor who answered for 47 seconds and left at 11%). At that rate
// three starters is where a day nobody finishes stops being explainable by
// chance (0.25^3 < 0.05); below the floor the starter summary in the
// evidence section already says who got how far.
export const NONE_FINISHED_MIN_STARTERS = 3

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
  // Starters, minus the site's own operators. Only an admin ever reaches
  // /admin, so an anon_id that visited it the same day is someone testing the
  // instrument from the panel, not a prospect who bounced. Their QA runs used
  // to fire the "started a test and none finished" line every time (the
  // 2026-08-23 brief, one starter, who had logged in, reached the results
  // page and opened /admin twice). anon_id IS NOT NULL in the subquery so a
  // single admin page view with no id can never NULL out the whole NOT IN.
  // Witness sittings are tracked for the admin progress curves but produce a
  // witness_sessions row, not a results row, so they must not count as test
  // starts here or the start-to-finish conversion would read low forever.
  const starts = await pair(`SELECT COUNT(DISTINCT anon_id) AS n FROM events
     WHERE name='test_start' AND created_at >= ?1 AND created_at < ?2
       AND COALESCE(instrument, '') != 'witness'
       AND anon_id NOT IN (
         SELECT anon_id FROM events
          WHERE path LIKE '/admin%' AND anon_id IS NOT NULL AND created_at >= ?1 AND created_at < ?2)`)
  const byInstrument = (await q(`SELECT instrument, language, COUNT(*) AS n FROM results WHERE is_seed = 0 AND created_at >= ? AND created_at < ? GROUP BY instrument, language ORDER BY n DESC`, ...Y))
    .map((r) => [LABELS[r.instrument] || r.instrument, r.language || '—', r.n])
  const byLang = (await q(`SELECT COALESCE(lang,'?') AS lang, COUNT(DISTINCT anon_id) AS n FROM events WHERE name='page_view' AND created_at >= ? AND created_at < ? GROUP BY lang ORDER BY n DESC`, ...Y)).map((r) => [r.lang, r.n])
  // /admin is the operator's own panel: only an admin ever reaches it, so its
  // page views are QA traffic, never a page a reader saw. Left in, a QA day
  // makes it the "most-visited page" and the funnel line below asks somebody
  // to go check what /admin asks the reader to do next (2026-08-24 brief).
  const topPages = (await q(`SELECT path, COUNT(*) AS n FROM events WHERE name='page_view' AND path IS NOT NULL AND path NOT LIKE '/admin%' AND created_at >= ? AND created_at < ? GROUP BY path ORDER BY n DESC LIMIT 8`, ...Y)).map((r) => [r.path, r.n])
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
      FROM events WHERE name='test_progress' AND created_at >= ?1 AND created_at < ?2
       AND (anon_id IS NULL OR anon_id NOT IN (
         SELECT anon_id FROM events
          WHERE path LIKE '/admin%' AND anon_id IS NOT NULL AND created_at >= ?1 AND created_at < ?2))
     GROUP BY anon_id, instrument ORDER BY pct DESC LIMIT 5`, ...Y))
    .map((r) => [LABELS[r.instrument] || r.instrument, r.pct])
  // What each person who started a test actually did that day, summarised.
  // "One lone test_start" and "read two articles, then started" are the same
  // line in the funnel and completely different events; whoever reads the
  // task list needs to be able to tell them apart without the database.
  // Same admin exclusion as `starts` above: a QA run the funnel already
  // discounts must not resurface here as evidence, or the issue says "nobody
  // started a test" and then lists a starter who reached 99% (the 2026-08-24
  // brief, whose one starter was the operator testing from the panel).
  const trails = (await q(`SELECT anon_id, name, COUNT(*) AS n, MAX(CAST(slug AS INTEGER)) AS pct, MIN(created_at) AS t0
      FROM events
     WHERE created_at >= ?1 AND created_at < ?2 AND anon_id IN (
           SELECT anon_id FROM events WHERE name='test_start' AND created_at >= ?1 AND created_at < ?2 AND anon_id IS NOT NULL
              AND COALESCE(instrument, '') != 'witness'
              AND anon_id NOT IN (
                SELECT anon_id FROM events
                 WHERE path LIKE '/admin%' AND anon_id IS NOT NULL AND created_at >= ?1 AND created_at < ?2))
     GROUP BY anon_id, name ORDER BY anon_id, t0 LIMIT 60`, ...Y))
  const starters = {}
  for (const r of trails) {
    // Short id only: these lines are published to a public issue, and eight
    // characters are enough to tell two visitors apart for one day.
    const id = String(r.anon_id).slice(0, 8)
    ;(starters[id] ||= []).push({ name: r.name, n: r.n, pct: r.name === 'test_progress' ? r.pct : null, at: String(r.t0).slice(11, 16) })
  }
  // Completion has no event of its own: it is the results row. Without this
  // join the summary above reads "reached 90%" for someone who finished (the
  // 2026-08-28 brief; telling them apart took a production D1 query, which
  // is exactly what this section exists to spare the reader).
  const finished = {}
  for (const r of await q(`SELECT anon_id, instrument, created_at FROM results
      WHERE is_seed = 0 AND anon_id IS NOT NULL AND created_at >= ? AND created_at < ?`, ...Y)) {
    ;(finished[String(r.anon_id).slice(0, 8)] ||= []).push(`${LABELS[r.instrument] || r.instrument} at ${String(r.created_at).slice(11, 16)}`)
  }
  const totals = { users: await count(db, `SELECT COUNT(*) AS n FROM auth_users`), tests: await count(db, `SELECT COUNT(*) AS n FROM results WHERE is_seed = 0`) }
  // Cold-outreach ledger (t76). Guarded: the table only exists once 006 runs.
  let outreach = null
  try {
    outreach = await db.prepare(`SELECT COUNT(*) AS total,
        SUM(created_at >= ?1 AND created_at < ?2) AS y,
        SUM(status='replied') AS replied, SUM(status='bounced') AS bounced,
        SUM(status='complained') AS complained FROM outreach`).bind(...Y).first()
  } catch { /* not yet migrated */ }
  return { signups, tests, pageViews, visitors, starts, byInstrument, byLang, topPages, newUsers, witness, top, takingOff, dropOff, starters, finished, totals, outreach }
}

/** Latest day Search Console has exported (usually two days behind), and the day before it. */
export async function gatherSearch(env) {
  const pr = env.BIGQUERY_PROJECT || 'cercol', sg = env.BIGQUERY_DATASET_GSC || 'searchconsole'
  const gt = `\`${pr}.${sg}.searchdata_url_impression\``
  try {
    const [last] = await bq(env, `SELECT MAX(data_date) AS d FROM ${gt}`)
    if (!last?.d) return { pending: true }
    const d = String(last.d).slice(0, 10)

    // Days the bulk export never delivered. Google emails about a failure and
    // then retries for about a week; after that the day is gone from BigQuery
    // for good. On 2026-08-16 both tables failed with "unknown error" and the
    // only warning was that email, because nothing here was watching. The
    // Search Console UI keeps the day for sixteen months either way, so a gap
    // is a mirror to repair, not data destroyed.
    const gaps = await bq(env, `SELECT day FROM UNNEST(GENERATE_DATE_ARRAY(DATE_SUB('${d}', INTERVAL ${EXPORT_WINDOW_DAYS} DAY), '${d}')) AS day
      WHERE day NOT IN (SELECT DISTINCT data_date FROM ${gt} WHERE data_date >= DATE_SUB('${d}', INTERVAL ${EXPORT_WINDOW_DAYS} DAY))
      ORDER BY day`)
    const rows = await bq(env, `SELECT data_date, SUM(clicks) AS clicks, SUM(impressions) AS impressions FROM ${gt} WHERE data_date IN ('${d}', DATE_SUB('${d}', INTERVAL 1 DAY)) GROUP BY data_date ORDER BY data_date DESC`)
    const tq = await bq(env, `SELECT query, SUM(clicks) AS clicks, SUM(impressions) AS impressions, SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) AS pos,
      ARRAY_AGG(url ORDER BY impressions DESC LIMIT 1)[OFFSET(0)] AS url FROM ${gt} WHERE data_date = '${d}' AND query IS NOT NULL GROUP BY query ORDER BY clicks DESC, impressions DESC LIMIT 6`)
    // A page with real exposure and no clicks is a title and description
    // problem, but only once there has been enough exposure that silence is
    // surprising. The floor is computed per position by zeroClickFloor, so
    // the query fetches candidates and the filter is applied here.
    const zcRows = await bq(env, `SELECT url, SUM(clicks) AS clicks, SUM(impressions) AS impressions,
      SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) AS pos FROM ${gt}
      WHERE data_date = '${d}' AND url IS NOT NULL GROUP BY url
      HAVING clicks = 0 AND pos <= 10
      ORDER BY impressions DESC LIMIT 20`)
    const zc = zcRows.filter((r) => Number(r.impressions) >= zeroClickFloor(Number(r.pos))).slice(0, 1)
    const cur = rows[0] || {}, prev = rows[1] || {}
    return { day: d,
      exportGaps: gaps.map((g) => String(g.day).slice(0, 10)),
      zeroClick: zc[0] ? [zc[0].url, Number(zc[0].impressions), Number(zc[0].pos)] : null, clicks: [Number(cur.clicks || 0), Number(prev.clicks || 0)], impressions: [Number(cur.impressions || 0), Number(prev.impressions || 0)],
      queries: tq.map((r) => [r.query, Number(r.clicks), Number(r.impressions), r.pos == null ? null : Number(r.pos), r.url || null]) }
  } catch (e) { return { pending: true, error: e.message } }
}

/** Language-prefixed blog URL → { lang, slug }, or null for anything else. */
export function parseBlogUrl(url) {
  const m = String(url).match(/^https:\/\/cercol\.team\/(?:(ca|es|fr|de|da)\/)?blog\/([^/#?]+)/)
  return m ? { lang: m[1] || 'en', slug: m[2] } : null
}

/**
 * The content wave: which article-language pairs deserve the next review,
 * ranked by exposure. A page Google already shows is where a defect costs
 * the most and a fix pays the fastest, so the order is 28-day impressions;
 * reads and the English sibling's impressions ride along as context.
 *
 * Pairs the review ledger already covers are excluded before the cap, not
 * after: with a cap of eight and no exclusion, two days of reviews turned
 * the wave into the same eight already-reviewed pairs every morning
 * (2026-08-30 and 08-31 both proposed zero reviewable pairs while the
 * unreviewed corpus waited), and it would have stayed empty until the
 * ledger's re-review window aged the top of the ranking out. The consumer
 * still skips reviewed pairs itself: the ledger fetch can fail, and then
 * this list arrives unfiltered.
 */
export function rankWave(gscRows, readRows, limit = 8, exclude = new Set()) {
  const pairs = new Map()
  for (const r of gscRows || []) {
    const at = parseBlogUrl(r.url)
    if (!at) continue
    const key = `${at.lang}|${at.slug}`
    const cur = pairs.get(key) || { lang: at.lang, slug: at.slug, impressions: 0, clicks: 0, posW: 0, reads: 0 }
    const impr = Number(r.impressions || 0)
    cur.impressions += impr
    cur.clicks += Number(r.clicks || 0)
    cur.posW += (r.pos == null ? 0 : Number(r.pos)) * impr
    pairs.set(key, cur)
  }
  for (const r of readRows || []) {
    const key = `${r.lang || 'en'}|${r.slug}`
    const cur = pairs.get(key) || { lang: r.lang || 'en', slug: r.slug, impressions: 0, clicks: 0, posW: 0, reads: 0 }
    cur.reads += Number(r.n || 0)
    pairs.set(key, cur)
  }
  const en = new Map([...pairs.values()].filter((x) => x.lang === 'en').map((x) => [x.slug, x.impressions]))
  return [...pairs.values()]
    .filter((x) => !exclude.has(`${x.lang}|${x.slug}`))
    .map((x) => ({ lang: x.lang, slug: x.slug, impressions: x.impressions, clicks: x.clicks,
      pos: x.impressions ? Math.round((x.posW / x.impressions) * 10) / 10 : null,
      reads: x.reads, enImpressions: x.lang === 'en' ? null : en.get(x.slug) ?? 0 }))
    .sort((a, b) => b.impressions - a.impressions || b.reads - a.reads)
    .slice(0, limit)
}

// The review ledger is repository content, but the repository is public:
// its raw URL answers without a token, and one fetch on the 04:00 trigger
// is affordable. Only the table rows count as reviews; the prose and the
// translation-pass section are context, not wave coverage.
export const LEDGER_URL = 'https://raw.githubusercontent.com/Cercol/cercol/main/docs/content/review-ledger.md'
export const REVIEW_WINDOW_DAYS = 56 // the routine's 8-week re-review window

/** Ledger markdown → Set of "lang|slug" pairs reviewed inside the window. */
export function parseLedger(md, now = Date.now(), windowDays = REVIEW_WINDOW_DAYS) {
  const reviewed = new Set()
  const cutoff = now - windowDays * 86400e3
  for (const line of String(md || '').split('\n')) {
    const m = line.match(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([a-z]{2})\s*\|\s*([\w-]+)\s*\|/)
    if (!m) continue
    const t = Date.parse(m[1])
    if (Number.isFinite(t) && t >= cutoff) reviewed.add(`${m[2]}|${m[3]}`)
  }
  return reviewed
}

export async function gatherWave(env, db) {
  const pr = env.BIGQUERY_PROJECT || 'cercol', sg = env.BIGQUERY_DATASET_GSC || 'searchconsole'
  const gt = `\`${pr}.${sg}.searchdata_url_impression\``
  try {
    const rows = await bq(env, `SELECT url, SUM(impressions) AS impressions, SUM(clicks) AS clicks,
      SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) AS pos FROM ${gt}
      WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY) AND url LIKE '%/blog/%'
      GROUP BY url ORDER BY impressions DESC LIMIT 300`)
    const { results: reads } = await db.prepare(
      `SELECT slug, lang, COUNT(*) AS n FROM events
        WHERE name = 'article_view' AND created_at >= datetime('now', '-28 days')
        GROUP BY slug, lang`).all()
    // Readers of this pair who went on to complete a test, ever (strictly
    // ordered: the read precedes their first result). This is the wave's
    // outcome metric — without it, repairs are acts of faith. Measured
    // 2026-08-25: 6 of 942 identifiable readers ever converted, each from a
    // different practical-intent article; the two most-read articles had
    // converted nobody.
    const { results: converts } = await db.prepare(
      `WITH first_result AS (SELECT anon_id, MIN(created_at) AS t FROM results
         WHERE COALESCE(is_seed, 0) = 0 AND anon_id IS NOT NULL GROUP BY anon_id)
       SELECT e.slug, e.lang, COUNT(DISTINCT e.anon_id) AS n
         FROM events e JOIN first_result fr ON fr.anon_id = e.anon_id
        WHERE e.name = 'article_view' AND e.created_at < fr.t
        GROUP BY e.slug, e.lang`).all()
    const cmap = new Map(converts.map((r) => [`${r.lang || 'en'}|${r.slug}`, r.n]))
    let reviewed = new Set()
    try {
      const lr = await fetch(LEDGER_URL)
      if (lr.ok) reviewed = parseLedger(await lr.text())
    } catch { /* ledger unreachable: propose unfiltered, the consumer skips */ }
    return { pairs: rankWave(rows, reads, 8, reviewed).map((p) => ({ ...p, converts: cmap.get(`${p.lang}|${p.slug}`) ?? 0 })) }
  } catch (e) { return { pending: true, error: e.message, pairs: [] } }
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

  // A day the bulk export never delivered. This goes first because it is the
  // only line in the brief with a deadline: Google retries for about a week
  // and then stops, and the BigQuery copy of that day is gone. Everything
  // else here can wait a day without getting worse.
  if (se?.exportGaps?.length) {
    const days = se.exportGaps
    const last = days[days.length - 1]
    out.push(`Search Console never exported ${days.length === 1 ? days[0] : `${days.length} days (${days.join(', ')})`} to BigQuery. Google retries for about a week from each date and then gives up, so ${last} is the one still worth saving. Check that billing is active on the Cloud project and that search-console-data-export@system.gserviceaccount.com still has BigQuery Job User on it and Data Editor on the dataset. The days are not lost from Search Console itself, only from the mirror the brief reads.`)
  }

  // Funnel. Two different failures, never both: nobody starts, or they
  // start and drop out. The second one usually means a broken instrument —
  // but only once there are enough starters for zero finishes to be
  // surprising: see NONE_FINISHED_MIN_STARTERS.
  if (pr.starts[0] >= NONE_FINISHED_MIN_STARTERS && pr.tests[0] === 0) {
    const where = (pr.dropOff || []).map(([inst, pct]) => `${inst} at ${pct}%`).join(', ')
    out.push(`${fmt(pr.starts[0])} started a test and none finished${where ? `, getting as far as ${where}` : ' (nobody reached the first tenth)'}. Take that instrument from there and watch the console.`)
  } else if (pr.starts[0] === 0 && pr.visitors[0] >= ZERO_START_MIN_VISITORS) {
    const [path] = pr.topPages[0] || []
    out.push(`${fmt(pr.visitors[0])} visitors, nobody started a test. Most-visited page: ${path ? link(frontendUrl + path, path) : 'none recorded'} &mdash; check what it asks the reader to do next.`)
  }

  // An article moving three times its own pace is the cheapest lever there is.
  // This line used to end "Make sure it points at an instrument", which was
  // advice nobody could ever act on: BlogTestCTA renders an instrument card
  // early and another at the end of every article, with no way to switch them
  // off, so the answer was always yes. What varies, and what says whether the
  // extra readers were worth having, is whether either card was clicked.
  //
  // A click is worth reporting whenever it happens. The absence of one is
  // only worth reporting once there were enough reads for a click to have
  // been expected at all: see CTA_CLAIM_MIN_READS.
  if (pr.takingOff.length) {
    const [t, slug, y, avg, cta = 0] = pr.takingOff[0]
    const pace = avg < 0.1 ? 'in its first week out' : `against ${avg.toFixed(1)}/day`
    const bridge = cta > 0
      ? ` ${fmt(cta)} of them went on to an instrument.`
      : y >= CTA_CLAIM_MIN_READS
        ? ' Not one of them went on to an instrument: both cards are on the page, so it is the copy on them that is not landing.'
        : ''
    out.push(`${link(`${frontendUrl}/blog/${slug}/`, t)} is taking off: ${fmt(y)} reads ${pace}.${bridge}`)
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
  if (pr.outreach?.total) parts.push(p(`Outreach: ${fmt(pr.outreach.y || 0)} sent yesterday &middot; ${fmt(pr.outreach.total)} total &middot; ${fmt(pr.outreach.replied || 0)} replied &middot; ${fmt(pr.outreach.bounced || 0)} bounced${pr.outreach.complained ? ` &middot; <span style="color:${C.red};">${fmt(pr.outreach.complained)} complained &mdash; sending is halted</span>` : ''}`, true))

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

  const wv = data.wave
  if (wv?.pairs?.length) {
    const rows = wv.pairs.map((w) => [w.lang, esc(w.slug), fmt(w.impressions), fmt(w.clicks), w.pos ?? '—', fmt(w.reads)])
    parts.push(section('Content wave &middot; next review candidates (28d)', table(['Lang', 'Article', 'Impr.', 'Clicks', 'Pos.', 'Reads'], rows, ['left', 'left', 'right', 'right', 'right', 'right']), C.yellow))
  }

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
function evidenceSection({ starters = {}, finished = {} } = {}) {
  const ids = Object.keys(starters)
  if (!ids.length) return []
  const out = ['<details><summary>What each person who started a test did that day</summary>', '']
  for (const id of ids) {
    const parts = starters[id].map((e) => {
      if (e.name === 'test_progress') return `reached ${e.pct}%`
      return `${e.name} x${e.n} (first at ${e.at})`
    })
    // "reached 90%" alone reads as a drop-off; say it when they finished.
    for (const f of finished[id] || []) parts.push(`**finished** ${f}`)
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
/** The wave rows, as a markdown block for the issue body. */
function waveSection(pairs = []) {
  if (!pairs.length) return []
  const out = ['## Content wave — next review candidates (28d, by exposure)', '',
    'One review per pair: indexing state, position and CTR, comparison with the other languages, glossary terms, prose quality, CTA and internal links. Skip pairs already in docs/content/review-ledger.md.', '']
  for (const w of pairs) {
    const sib = w.enImpressions == null ? '' : ` (en sibling: ${w.enImpressions} impr)`
    out.push(`- \`${w.lang}\` · \`${w.slug}\` — ${w.impressions} impr, ${w.clicks} clicks, pos ${w.pos ?? '—'}, ${w.reads} reads, ${w.converts ?? 0} readers ever converted to a completed test${sib}`)
  }
  out.push('')
  return out
}

export async function fileTasks(env, dayIso, todo, evidence = {}) {
  if (!env.GITHUB_TOKEN || (!todo.length && !(evidence.wave || []).length)) return null
  const repo = env.GITHUB_REPO || 'Cercol/cercol'
  const body = [
    `From the daily brief for ${dayIso}. Each line is what the numbers said, not a verdict:`,
    '',
    ...todo.map((t, i) => `${i + 1}. [ ] ${plainAction(t)}`),
    '',
    ...evidenceSection(evidence),
    ...waveSection(evidence.wave),
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
  const wave = await gatherWave(env, env.DB)
  const warns = warnings(platform, { today: day(b.y1), decommissioned })
  const decommissionIn = decommissioned ? 0 : Math.ceil((Date.parse(DECOMMISSION_DUE) - b.y1.getTime()) / 86400e3)
  const data = { day: day(b.y0), product, platform, search, indexing, languages, warns, decommissionIn, wave }
  const issue = send ? await fileTasks(env, data.day, actions(data, env.FRONTEND_URL), { starters: product.starters, finished: product.finished, wave: wave.pairs }) : null
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
