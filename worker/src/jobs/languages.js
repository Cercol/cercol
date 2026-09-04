/**
 * An article that works in one language and not in another.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * This is the cheapest content diagnostic there is, because it compares an
 * article against itself. "This article is weak" is a judgement; "this
 * article is invisible in German while its Spanish and French versions do
 * their normal numbers" is a defect with a short list of causes: the German
 * version is not indexed, its title and description do not match what a
 * German searcher types, or the translation reads badly.
 *
 * First-party reads cannot answer it. 108 articles in six languages is 648
 * pages taking about 0.76 reads each per month, so every per-language
 * comparison would be noise. Search Console impressions are twenty times
 * richer and exist even where no one clicked, which is exactly the case
 * worth catching.
 *
 * The comparison is against the blog's own language mix, not between the
 * versions raw. German pages are some fixed share of all blog impressions;
 * an article whose German version is far under that share, while its other
 * versions sit at theirs, has something wrong with that version rather than
 * with the German market.
 *
 * Runs on the 05:00 trigger beside the indexing check and leaves its answer
 * in KV, for the same reason: the 04:00 invocation that sends the brief has
 * no subrequests to spare.
 *
 * Repetition is the real hazard of a daily job on a 28-day window: the same
 * gap would be reported every morning until it was fixed. Each gap is
 * reported once and then held for RENOTIFY_DAYS, so the brief carries what
 * is new rather than what is unresolved. The full list stays in the snapshot
 * for anything that wants to read it.
 */

const LANGS = ['ca', 'es', 'fr', 'de', 'da']
export const KV_KEY = 'seo:languages'
// Impressions an article needs across all its versions before its split says
// anything. Below this the shares are one or two impressions wide.
export const MIN_ARTICLE_IMPRESSIONS = 50
// How many impressions the article's own numbers predict for that language
// before its absence counts as a gap rather than a rounding error.
export const MIN_EXPECTED = 5
// A gap already reported is held this long, then said again if still there.
export const RENOTIFY_DAYS = 30

/**
 * Language versions that are missing the impressions the article's own
 * numbers predict for them.
 *
 * @param {Array<{slug: string, lang: string, impressions: number}>} rows
 * @returns {Array<{slug, lang, impressions, expected, total}>} worst first
 */
export function languageGaps(rows, { minTotal = MIN_ARTICLE_IMPRESSIONS, minExpected = MIN_EXPECTED } = {}) {
  const siteByLang = {}
  const bySlug = {}
  let siteTotal = 0
  for (const r of rows) {
    const n = Number(r.impressions) || 0
    siteByLang[r.lang] = (siteByLang[r.lang] || 0) + n
    ;(bySlug[r.slug] ||= {})[r.lang] = n
    siteTotal += n
  }
  if (!siteTotal) return []

  const out = []
  for (const [slug, byLang] of Object.entries(bySlug)) {
    const total = Object.values(byLang).reduce((a, b) => a + b, 0)
    if (total < minTotal) continue
    for (const lang of LANGS) {
      const share = (siteByLang[lang] || 0) / siteTotal
      const expected = total * share
      const actual = byLang[lang] || 0
      // Absent, not merely behind: a version doing half its share is a copy
      // question, one doing none of it is usually broken.
      if (expected >= minExpected && actual === 0) out.push({ slug, lang, impressions: actual, expected: Math.round(expected), total })
    }
  }
  return out.sort((a, b) => b.expected - a.expected)
}

/** The gaps not reported recently, and the reported-set to store back. */
export function freshGaps(gaps, reported = {}, { now = Date.now(), renotifyDays = RENOTIFY_DAYS } = {}) {
  const next = { ...reported }
  const fresh = []
  for (const g of gaps) {
    const key = `${g.slug}|${g.lang}`
    const last = next[key] ? Date.parse(next[key]) : 0
    if (now - last < renotifyDays * 86400e3) continue
    next[key] = new Date(now).toISOString()
    fresh.push(g)
  }
  // Forget keys whose gap has closed, so a recurrence reads as news.
  const live = new Set(gaps.map((g) => `${g.slug}|${g.lang}`))
  for (const k of Object.keys(next)) if (!live.has(k)) delete next[k]
  return { fresh, reported: next }
}

/** Gather from BigQuery, mark what is new, and leave it all in KV. */
export async function runLanguages(env, { query } = {}) {
  const bq = query || (await import('../bigquery.js')).query
  const pj = env.BIGQUERY_PROJECT || 'cercol'
  const gsc = env.BIGQUERY_DATASET_GSC || 'searchconsole'
  try {
    const rows = await bq(env, `
      SELECT IFNULL(REGEXP_EXTRACT(url, r'cercol\\.team/(ca|es|fr|de|da)/blog/'), 'en') AS lang,
             REGEXP_EXTRACT(url, r'/blog/([^/?#]+)') AS slug,
             SUM(impressions) AS impressions
        FROM \`${pj}.${gsc}.searchdata_url_impression\`
       WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY) AND url LIKE '%/blog/%'
       GROUP BY lang, slug
      HAVING slug IS NOT NULL`)
    const gaps = languageGaps(rows.map((r) => ({ slug: r.slug, lang: r.lang, impressions: Number(r.impressions) })))
    const prev = env.NORMS ? await env.NORMS.get(KV_KEY, 'json') : null
    const { fresh, reported } = freshGaps(gaps, prev?.reported)
    if (env.NORMS) {
      await env.NORMS.put(KV_KEY, JSON.stringify({ at: new Date().toISOString(), gaps, fresh, reported }), { expirationTtl: 45 * 86400 })
    }
    return { gaps: gaps.length, fresh: fresh.length }
  } catch (e) {
    return { error: e.message }
  }
}

const NAME = { ca: 'Catalan', es: 'Spanish', fr: 'French', de: 'German', da: 'Danish' }

/** The URL of the gap languageActions would report, for callers that need
 * to know which indexing line it absorbs. Null when there is nothing fresh. */
export function languageGapUrl(snapshot, frontendUrl = 'https://cercol.team') {
  const g = snapshot?.fresh?.[0]
  return g ? `${frontendUrl}/${g.lang}/blog/${g.slug}/` : null
}

/**
 * One line, for the worst gap that has not been reported yet. One and not
 * all of them: the brief is a to-do list, and a list of nine translations to
 * look at is a list nobody starts.
 *
 * The gap is what queues its URL for inspection (gapInspectionPaths), so on
 * the morning both jobs fire the brief used to carry the question ("check it
 * is indexed") and, two lines up, the inspector's answer ("crawled -
 * currently not indexed") as two separate to-dos for the same page: the
 * 2026-09-02 brief spent two of its three lines that way. When the snapshot
 * already holds Google's verdict for this URL, the line carries it instead
 * of asking, and the caller drops the plain indexing line for the same URL.
 */
export function languageActions(snapshot, frontendUrl = 'https://cercol.team', indexing = null) {
  const g = snapshot?.fresh?.[0]
  if (!g) return []
  const url = `${frontendUrl}/${g.lang}/blog/${g.slug}/`
  const head = `The ${NAME[g.lang] || g.lang} version of ${g.slug} took no impressions in 28 days, where the article's own numbers predict about ${g.expected}.`
  const verdict = (indexing?.problems || []).find((p) => p.url === url)
  if (verdict) {
    const why = verdict.googleCanonical
      ? `${verdict.state}, and Google indexes ${verdict.googleCanonical} instead`
      : verdict.state
    return [`${head} <a href="${url}" style="text-decoration:underline;">Google's verdict on the page</a> says why: ${why}.`]
  }
  return [`${head} Its siblings are fine, so this is that version: <a href="${url}" style="text-decoration:underline;">check it is indexed, then read its title</a>.`]
}
