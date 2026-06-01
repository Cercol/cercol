/**
 * scripts/generate-sitemap.mjs
 *
 * Generates public/sitemap.xml from live API data.
 * Run after `vite build` and before prerendering.
 *
 * Usage: node scripts/generate-sitemap.mjs
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../public/sitemap.xml')
const BASE = 'https://cercol.team'
const TODAY = new Date().toISOString().slice(0, 10)
const LANGS = ['en', 'ca', 'es', 'fr', 'de', 'da']

const STATIC_PAGES = [
  { path: '/',          priority: '1.0', changefreq: 'weekly' },
  { path: '/about',     priority: '0.8', changefreq: 'monthly' },
  { path: '/instruments',priority:'0.8', changefreq: 'monthly' },
  { path: '/roles',     priority: '0.8', changefreq: 'monthly' },
  { path: '/science',   priority: '0.9', changefreq: 'monthly' },
  { path: '/faq',       priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy',   priority: '0.4', changefreq: 'yearly' },
]

// Trailing slash required: GitHub Pages serves <path>/index.html and
// 301-redirects any URL without a trailing slash. Sitemap entries pointing
// at the redirected URL show up as "Discovered: not indexed" in Search
// Console, so every <loc> and every hreflang href must end with `/`.
function withTrailingSlash(path) {
  if (!path) return '/'
  return path.endsWith('/') ? path : `${path}/`
}

function langUrl(path, lang) {
  const p = withTrailingSlash(path)
  // Every page (top-level and blog) is now a real per-locale path; English
  // is unprefixed. No more ?lang= in the sitemap.
  return lang === 'en' ? `${BASE}${p}` : `${BASE}/${lang}${p}`
}

function hreflangAlts(path) {
  const p = withTrailingSlash(path)
  return LANGS.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l}" href="${langUrl(p, l)}"/>`
  ).join('\n') +
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${p}"/>`
}

function urlEntry(path, { priority, changefreq, lastmod, loc }) {
  const p = withTrailingSlash(path)
  const locUrl = loc || `${BASE}${p}`
  const lm = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
  return `  <url>
    <loc>${locUrl}</loc>${lm}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangAlts(p)}
  </url>`
}

async function fetchSlugs() {
  try {
    const res = await fetch(`${BASE.replace('cercol.team', 'api.cercol.team')}/blog`)
    const posts = await res.json()
    return Array.isArray(posts) ? posts.map(p => p.slug) : []
  } catch (e) {
    console.warn('[sitemap] could not fetch slugs:', e.message)
    return []
  }
}

async function main() {
  const slugs = await fetchSlugs()
  console.log(`[sitemap] ${slugs.length} articles fetched`)

  const parts = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    '',
    '  <!-- Static pages -->',
  ]

  // One <loc> per language for every top-level page (path-based), so Google
  // can index the national homes directly, not only as alternates of EN.
  for (const { path, priority, changefreq } of STATIC_PAGES) {
    for (const lang of LANGS) {
      parts.push(urlEntry(path, { priority, changefreq, loc: langUrl(path, lang) }))
    }
  }

  parts.push('', '  <!-- Blog index (one entry per language) -->')
  for (const lang of LANGS) {
    parts.push(urlEntry('/blog', { priority: '0.8', changefreq: 'weekly', lastmod: TODAY, loc: langUrl('/blog', lang) }))
  }

  // ── Blog post URLs re-enabled 2026-05-16 ────────────────────────────────────
  // scripts/prerender.mjs now generates a static dist/blog/<slug>/index.html
  // (and dist/<lang>/blog/<slug>/index.html for non-English) for every slug,
  // so GitHub Pages serves HTTP 200 instead of the SPA 404 redirect.
  // All language variants are included with hreflang alternates.
  // Backlog (Phase 17.11): blog articles still emit a single <loc> (EN) with
  // path-based hreflang alternates, not one <loc> per language. Promoting
  // them to per-language <loc> like the top-level pages above is deferred to
  // keep this sprint scoped; the hreflang alternates already point Google at
  // every localized article path.
  if (slugs.length > 0) {
    parts.push('', '  <!-- Blog articles -->')
    for (const slug of slugs) {
      parts.push(urlEntry(`/blog/${slug}`, { priority: '0.7', changefreq: 'monthly', lastmod: TODAY }))
    }
  }

  parts.push('', '</urlset>', '')

  const total = STATIC_PAGES.length * LANGS.length + LANGS.length + slugs.length
  writeFileSync(OUT, parts.join('\n'), 'utf8')
  console.log(`[sitemap] written to ${OUT} — ${total} entries`)
}

main().catch(err => {
  console.error('[sitemap] fatal:', err)
  process.exit(1)
})
