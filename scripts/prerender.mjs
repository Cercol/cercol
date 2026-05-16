/**
 * scripts/prerender.mjs
 *
 * Generates static HTML for public SEO-relevant routes.
 * Runs after `vite build`, before `gh-pages -d dist`.
 *
 * Usage (called automatically by `npm run build:prerender`):
 *   node scripts/prerender.mjs
 *
 * What it does:
 * 1. Launches a local HTTP server serving ./dist
 * 2. Opens each public route in headless Chrome via puppeteer-core
 * 3. Waits for React to render (react-i18next loads, fonts settle)
 * 4. Saves the fully-rendered HTML to dist/<route>/index.html
 *
 * Why this matters for SEO:
 * - Google indexes the static HTML directly — no JS execution lag
 * - LLMs and Perplexity can scrape content without running JavaScript
 * - First Contentful Paint improves because browsers get real HTML instantly
 *
 * The 404.html SPA redirect remains untouched — it handles routes that are
 * NOT prerendered (instrument pages, auth, account pages).
 *
 * Concurrency:
 * - Static routes + blog index pages run sequentially (13 routes, fast).
 * - Blog article routes (104 slugs × 6 languages = 624 routes) run through
 *   a pool of CONCURRENCY=4 parallel Chrome pages to keep CI build time
 *   under ~4 minutes instead of 50+ minutes for sequential execution.
 */

import puppeteer from 'puppeteer-core'
import { createServer } from 'http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST_DIR   = resolve(__dirname, '../dist')
const BASE_URL   = 'http://localhost:4173'

// Parallel Chrome pages for blog article rendering.
// 4 tabs share one browser instance — low memory, fast enough.
const CONCURRENCY = 4

// Static routes to prerender — auth-gated routes are excluded.
const STATIC_ROUTES = ['/', '/about', '/instruments', '/roles', '/science', '/faq', '/privacy']
const BLOG_LANGS = ['en', 'ca', 'es', 'fr', 'de', 'da']

async function fetchBlogSlugs() {
  try {
    const res = await globalThis.fetch('https://api.cercol.team/blog')
    const posts = await res.json()
    return Array.isArray(posts) ? posts.map(p => p.slug) : []
  } catch (e) {
    console.warn('[prerender] could not fetch blog slugs:', e.message)
    return []
  }
}

async function buildRoutes(slugs) {
  // Phase 1: static pages + blog index (one per language) — 13 routes total.
  const staticRoutes = STATIC_ROUTES.map(route => ({ route, lang: 'en' }))
  for (const lang of BLOG_LANGS) {
    const prefix = lang === 'en' ? '' : `/${lang}`
    staticRoutes.push({ route: `${prefix}/blog`, lang })
  }

  // Phase 2: individual blog articles × 6 languages — 104 × 6 = 624 routes.
  // These run through the concurrency pool (CONCURRENCY=4) to keep CI fast.
  const articleRoutes = []
  for (const slug of slugs) {
    for (const lang of BLOG_LANGS) {
      const prefix = lang === 'en' ? '' : `/${lang}`
      articleRoutes.push({ route: `${prefix}/blog/${slug}`, lang })
    }
  }

  return { staticRoutes, articleRoutes }
}

// Chrome executable: environment variable takes priority (for CI/CD).
const CHROME = process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// ---------------------------------------------------------------------------
// Minimal static file server (no dependency on serve/express)
// ---------------------------------------------------------------------------

function getMime(path) {
  if (path.endsWith('.js'))   return 'application/javascript'
  if (path.endsWith('.css'))  return 'text/css'
  if (path.endsWith('.svg'))  return 'image/svg+xml'
  if (path.endsWith('.png'))  return 'image/png'
  if (path.endsWith('.webp')) return 'image/webp'
  if (path.endsWith('.jpg'))  return 'image/jpeg'
  if (path.endsWith('.ico'))  return 'image/x-icon'
  if (path.endsWith('.xml'))  return 'application/xml'
  if (path.endsWith('.txt'))  return 'text/plain'
  return 'text/html'
}

function startServer() {
  const server = createServer((req, res) => {
    let filePath = join(DIST_DIR, req.url.split('?')[0])

    // If requesting a directory, serve index.html from it (or root index.html)
    if (!filePath.includes('.')) {
      const dirIndex = join(filePath, 'index.html')
      filePath = existsSync(dirIndex) ? dirIndex : join(DIST_DIR, 'index.html')
    }

    try {
      const content = readFileSync(filePath)
      res.writeHead(200, { 'Content-Type': getMime(filePath) })
      res.end(content)
    } catch {
      // Fall back to index.html for SPA routing
      try {
        const content = readFileSync(join(DIST_DIR, 'index.html'))
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(content)
      } catch {
        res.writeHead(404)
        res.end('Not found')
      }
    }
  })

  return new Promise((resolve) => {
    server.listen(4173, () => {
      console.log(`[prerender] server running at ${BASE_URL}`)
      resolve(server)
    })
  })
}

// ---------------------------------------------------------------------------
// Render a single route — shared by sequential and concurrent workers
// ---------------------------------------------------------------------------

async function renderOneRoute(browser, { route, lang }) {
  const url = `${BASE_URL}${route}`
  const page = await browser.newPage()

  // Suppress JS errors from the page (i18n fetch errors in static context are expected)
  page.on('pageerror', () => {})
  page.on('requestfailed', () => {})

  // For non-English pages, set localStorage so i18n initialises correctly
  if (lang !== 'en') {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.evaluate((l) => localStorage.setItem('cercol-lang', l), lang)
  }

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

  // Extra settle time for React hydration and i18n loading
  await new Promise(r => setTimeout(r, 1500))

  // Blog routes fetch article data from the API after mount — the fixed
  // 1500ms settle may not be enough when the API is slow in CI.
  // Wait until either content is present or an error state is shown so
  // we never capture a loading skeleton as the final HTML.
  // Scoped to blog routes only; try-catch means a timeout (e.g. on
  // individual article pages where the >5 threshold may not be met) falls
  // through to page.content() with whatever rendered rather than hanging.
  if (route.includes('/blog')) {
    try {
      await page.waitForFunction(
        () => {
          const errorEl = document.querySelector('.text-red-500')
          const hasError = errorEl?.textContent?.includes('Could not load')
          const hasContent = document.querySelectorAll('article, .article-card, a[href*="/blog/"]').length > 5
          return !hasError && hasContent
        },
        { timeout: 15000 }
      )
    } catch {
      // Timeout — capture whatever rendered (API may be slow in CI)
    }
  }

  const html = await page.content()
  await page.close()

  // Write to dist/<route>/index.html  (root → dist/index.html)
  if (route === '/') {
    writeFileSync(join(DIST_DIR, 'index.html'), html, 'utf8')
  } else {
    const dir = join(DIST_DIR, route.slice(1))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html, 'utf8')
  }
}

// ---------------------------------------------------------------------------
// Concurrency pool — processes a queue of routes with N parallel workers
// ---------------------------------------------------------------------------

async function renderWithPool(browser, routes, concurrency) {
  const queue = [...routes]
  let completed = 0
  const total = queue.length

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift()
      if (!item) break
      console.log(`[prerender]   → ${item.route} (${item.lang}) [${++completed}/${total}]`)
      await renderOneRoute(browser, item)
    }
  }

  // Launch N workers that all drain the same queue
  const workers = Array.from({ length: Math.min(concurrency, routes.length) }, () => worker())
  await Promise.all(workers)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const server = await startServer()

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // Force English so the canonical prerendered HTML matches the English meta tags.
      '--lang=en-US,en',
      '--accept-lang=en-US,en',
    ],
  })

  const slugs = await fetchBlogSlugs()
  const { staticRoutes, articleRoutes } = await buildRoutes(slugs)
  const total = staticRoutes.length + articleRoutes.length
  console.log(`[prerender] prerendering ${total} routes (${staticRoutes.length} static + ${articleRoutes.length} articles)…`)

  // Phase 1: static + blog index — sequential, short list
  console.log(`[prerender] phase 1: static routes (sequential)`)
  for (const item of staticRoutes) {
    console.log(`[prerender]   → ${item.route} (${item.lang})`)
    await renderOneRoute(browser, item)
  }

  // Phase 2: blog articles — concurrent pool
  if (articleRoutes.length > 0) {
    console.log(`[prerender] phase 2: blog articles (concurrency=${CONCURRENCY})`)
    await renderWithPool(browser, articleRoutes, CONCURRENCY)
  }

  await browser.close()
  server.close()

  console.log(`[prerender] done — ${total} routes prerendered ✓`)
}

main().catch((err) => {
  console.error('[prerender] fatal:', err)
  process.exit(1)
})
