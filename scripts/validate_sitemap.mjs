/**
 * The sitemap must advertise every page that exists, and no page that does not.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 *
 * Runs against the built dist, after prerender, in the same CI step as the
 * internal link integrity check.
 *
 * Two failures it exists to catch, both of which have happened:
 *
 *   - A <loc> with no prerendered file behind it. The sitemap then teaches
 *     Google to fetch a URL that answers with the SPA shell, and Search
 *     Console files it as a soft 404.
 *   - An article present in some languages and absent in others. Until
 *     2026-08-21 only the English <loc> of each article was emitted, on the
 *     assumption that hreflang alternates would carry the rest. They do not:
 *     the URL Inspection API answered "URL is unknown to Google" for pages
 *     that were 200, self-canonical and fully translated. 540 pages were
 *     invisible for months and nothing was watching.
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { EN_ONLY_PAGES } from './lib/en-only-routes.mjs'

const DIST = new URL('../dist/', import.meta.url).pathname
const BASE = 'https://cercol.team'
export const LANGS = ['en', 'ca', 'es', 'fr', 'de', 'da']

/** Pages advertised in English only, with the trailing slash locs carry. */
const EN_ONLY = new Set(EN_ONLY_PAGES.map((p) => `${p}/`))

/** Every <loc> in the sitemap, as site-relative paths. */
export function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(BASE, ''))
}

/** The locale a path belongs to, and the path with the locale stripped. */
export function split(path) {
  const m = /^\/(ca|es|fr|de|da)(\/.*)$/.exec(path)
  return m ? { lang: m[1], rest: m[2] } : { lang: 'en', rest: path }
}

/** Paths advertised in every language, and the ones missing somewhere. */
export function languageCoverage(paths) {
  const seen = {}
  for (const p of paths) {
    const { lang, rest } = split(p)
    ;(seen[rest] ||= new Set()).add(lang)
  }
  const incomplete = []
  for (const [rest, langs] of Object.entries(seen)) {
    // The English-only pages are meant to appear exactly once: their
    // localized URLs are not routes, so "missing" languages are correct.
    if (EN_ONLY.has(rest)) continue
    const missing = LANGS.filter((l) => !langs.has(l))
    if (missing.length) incomplete.push({ path: rest, missing })
  }
  return { total: Object.keys(seen).length, incomplete }
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const smPath = join(DIST, 'sitemap.xml')
  if (!existsSync(smPath)) {
    console.error('[sitemap] no dist/sitemap.xml: run `npm run build:full` first, this check reads the built output')
    process.exit(1)
  }
  const xml = readFileSync(smPath, 'utf8')
  const paths = locs(xml)
  const missingFiles = paths.filter((p) => !existsSync(join(DIST, p, 'index.html')))
  const { total, incomplete } = languageCoverage(paths)

  const problems = []
  if (missingFiles.length) {
    problems.push(`${missingFiles.length} sitemap entries have no prerendered page:\n  ${missingFiles.slice(0, 10).join('\n  ')}`)
  }
  if (incomplete.length) {
    problems.push(`${incomplete.length} pages are not advertised in every language:\n  ${incomplete.slice(0, 10).map((i) => `${i.path} missing ${i.missing.join(', ')}`).join('\n  ')}`)
  }
  if (problems.length) {
    console.error(`[sitemap] ${problems.join('\n\n[sitemap] ')}`)
    process.exit(1)
  }
  console.log(`[sitemap] ${paths.length} entries, ${total} pages in all ${LANGS.length} languages, every one prerendered`)
}
