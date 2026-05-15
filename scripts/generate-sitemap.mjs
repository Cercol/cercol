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

function langUrl(path, lang) {
  if (lang === 'en') return `${BASE}${path}`
  // Blog paths use subdirectory, static pages use ?lang= query (SPA, no subdirectory routing)
  if (path.startsWith('/blog')) return `${BASE}/${lang}${path}`
  return `${BASE}${path}?lang=${lang}`
}

function hreflangAlts(path) {
  return LANGS.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l}" href="${langUrl(path, l)}"/>`
  ).join('\n') +
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${path}"/>`
}

function urlEntry(path, { priority, changefreq, lastmod }) {
  const loc = `${BASE}${path}`
  const lm = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
  return `  <url>
    <loc>${loc}</loc>${lm}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangAlts(path)}
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

  // ── Blog post URLs disabled 2026-05-16 ──────────────────────────────────────
  // Blog post pages (/blog/<slug>) are SPA-only routes. GitHub Pages has no
  // pre-rendered static file for them and returns HTTP 404 on direct access.
  // The 404.html JS redirect handles browser navigation correctly, but
  // Googlebot sees the 404 status and deindexes these URLs, causing a flood
  // of "Not found (404)" errors in Google Search Console.
  //
  // The proper long-term fix is to extend scripts/prerender.mjs to generate
  // a static dist/blog/<slug>/index.html for each post so GitHub Pages serves
  // them with HTTP 200. Until that pre-rendering work is done, per-slug URLs
  // are excluded from the sitemap to stop the GSC errors.
  //
  // To re-enable once pre-rendering is live, uncomment the block below and
  // verify that `curl -s -o /dev/null -w "%{http_code}" https://cercol.team/blog/<slug>`
  // returns 200 (not 301 or 404) before deploying.
  //
  // if (slugs.length > 0) {
  //   parts.push('', '  <!-- Blog articles -->')
  //   for (const slug of slugs) {
  //     parts.push(urlEntry(`/blog/${slug}`, { priority: '0.7', changefreq: 'monthly', lastmod: TODAY }))
  //   }
  // }

  parts.push('', '</urlset>', '')

  writeFileSync(OUT, parts.join('\n'), 'utf8')
  console.log(`[sitemap] written to ${OUT} — ${slugs.length + STATIC_PAGES.length + 1} entries`)
}

main().catch(err => {
  console.error('[sitemap] fatal:', err)
  process.exit(1)
})
