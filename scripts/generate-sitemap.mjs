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
  if (lang === 'en') return `${BASE}${p}`
  // Blog paths use a subdirectory, static pages use ?lang= query (SPA, no subdirectory routing).
  if (p.startsWith('/blog')) return `${BASE}/${lang}${p}`
  return `${BASE}${p}?lang=${lang}`
}

function hreflangAlts(path) {
  const p = withTrailingSlash(path)
  return LANGS.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l}" href="${langUrl(p, l)}"/>`
  ).join('\n') +
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${p}"/>`
}

function urlEntry(path, { priority, changefreq, lastmod }) {
  const p = withTrailingSlash(path)
  const loc = `${BASE}${p}`
  const lm = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
  return `  <url>
    <loc>${loc}</loc>${lm}
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

  for (const { path, priority, changefreq } of STATIC_PAGES) {
    parts.push(urlEntry(path, { priority, changefreq }))
  }

  parts.push('', '  <!-- Blog index -->')
  parts.push(urlEntry('/blog', { priority: '0.8', changefreq: 'weekly', lastmod: TODAY }))

  // ── Blog post URLs re-enabled 2026-05-16 ────────────────────────────────────
  // scripts/prerender.mjs now generates a static dist/blog/<slug>/index.html
  // (and dist/<lang>/blog/<slug>/index.html for non-English) for every slug,
  // so GitHub Pages serves HTTP 200 instead of the SPA 404 redirect.
  // All language variants are included with hreflang alternates.
  if (slugs.length > 0) {
    parts.push('', '  <!-- Blog articles -->')
    for (const slug of slugs) {
      parts.push(urlEntry(`/blog/${slug}`, { priority: '0.7', changefreq: 'monthly', lastmod: TODAY }))
    }
  }

  parts.push('', '</urlset>', '')

  writeFileSync(OUT, parts.join('\n'), 'utf8')
  console.log(`[sitemap] written to ${OUT} — ${slugs.length + STATIC_PAGES.length + 1} entries`)
}

main().catch(err => {
  console.error('[sitemap] fatal:', err)
  process.exit(1)
})
