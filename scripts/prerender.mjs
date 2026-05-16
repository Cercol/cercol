/**
 * scripts/prerender.mjs
 *
 * Generates static HTML for public SEO-relevant routes.
 * Runs after `vite build`, before `gh-pages -d dist`.
 *
 * Usage (called automatically by `npm run build:full`):
 *   node scripts/prerender.mjs
 *
 * What it does:
 * 1. Fetches the article list and beta status from the live API ONCE
 * 2. Launches a local HTTP server serving ./dist
 * 3. Opens each public route in headless Chrome via puppeteer-core
 * 4. Waits for React to render (react-i18next loads, fonts settle)
 * 5. Injects window.__BLOG_ARTICLES__ and window.__BETA__ into <head>
 * 6. Saves the fully-rendered HTML to dist/<route>/index.html
 *
 * Why this matters for SEO:
 * - Google indexes the static HTML directly — no JS execution lag
 * - LLMs and Perplexity can scrape content without running JavaScript
 * - First Contentful Paint improves because browsers get real HTML instantly
 *
 * Why the window globals are injected:
 * - BlogIndexPage reads window.__BLOG_ARTICLES__ on first render, eliminating
 *   the API call at hydration time. Root cause of "Soft 404" in Google Search
 *   Console: during the PR #20 CI build the concurrent pool caused the API to
 *   time out on the blog index page, and Puppeteer captured the error fallback
 *   HTML. With window.__BLOG_ARTICLES__ pre-injected, BlogIndexPage never hits
 *   the API during prerender — it renders from the global synchronously.
 * - BetaBanner reads window.__BETA__ on first render, eliminating the 1300ms
 *   LCP delay caused by useState(null) unmounting the pre-rendered banner on
 *   hydration and re-mounting it after the /beta API round-trip.
 *
 * CRITICAL: fetchBlogArticles() throws on failure (does NOT fall back silently)
 * so the build fails loudly rather than shipping blog index HTML with the error
 * fallback "Could not load articles" baked into it.
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

// ---------------------------------------------------------------------------
// API fetchers — called ONCE before any rendering
// ---------------------------------------------------------------------------

/**
 * Fetch the full article list from the API.
 * THROWS on failure — an empty list would cause BlogIndexPage to render the
 * "Could not load articles" error fallback and bake it into the pre-rendered
 * HTML, which Google Search Console treats as a Soft 404.
 */
async function fetchBlogArticles() {
  const res = await globalThis.fetch('https://api.cercol.team/blog', {
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    throw new Error(`/blog returned HTTP ${res.status}`)
  }
  const articles = await res.json()
  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error('/blog returned an empty article list')
  }
  console.log(`[prerender] fetched ${articles.length} articles for window.__BLOG_ARTICLES__`)
  return articles
}

/**
 * Fetch the beta-launch status. Falls back silently — the banner is
 * best-effort and a failure here must not block the build.
 */
async function fetchBetaStatus() {
  try {
    const res = await globalThis.fetch('https://api.cercol.team/beta', {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`/beta returned HTTP ${res.status}`)
    const data = await res.json()
    console.log(`[prerender] fetched beta status: remaining=${data.remaining}/${data.total}`)
    return data
  } catch (err) {
    console.warn(`[prerender] could not fetch beta status (${err.message}), using default`)
    return { remaining: 500, total: 500, active: true }
  }
}

// ---------------------------------------------------------------------------
// Route plan
// ---------------------------------------------------------------------------

function buildRoutes(slugs) {
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

async function renderOneRoute(browser, { route, lang }, { articles, betaStatus }) {
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

  // Blog routes: guard against slow API responses / loading states.
  // With window.__BLOG_ARTICLES__ now injected, the blog INDEX page no longer
  // hits the API during render — it reads from the global synchronously.
  // The guard remains for individual article pages where the body is still
  // fetched from the API, and as a belt-and-suspenders safety net.
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

  // Inject window globals into <head> so React reads them synchronously
  // on first render, avoiding API calls and hydration flicker:
  //   window.__BLOG_ARTICLES__ — full article list for BlogIndexPage
  //   window.__BETA__          — beta launch status for BetaBanner
  const injection = `<script>window.__BETA__=${JSON.stringify(betaStatus)};window.__BLOG_ARTICLES__=${JSON.stringify(articles)};</script>`
  const htmlWithGlobals = html.replace('</head>', `${injection}\n</head>`)

  // Write to dist/<route>/index.html  (root → dist/index.html)
  if (route === '/') {
    writeFileSync(join(DIST_DIR, 'index.html'), htmlWithGlobals, 'utf8')
  } else {
    const dir = join(DIST_DIR, route.slice(1))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), htmlWithGlobals, 'utf8')
  }
}

// ---------------------------------------------------------------------------
// Concurrency pool — processes a queue of routes with N parallel workers
// ---------------------------------------------------------------------------

async function renderWithPool(browser, routes, concurrency, globals) {
  const queue = [...routes]
  let completed = 0
  const total = queue.length

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift()
      if (!item) break
      console.log(`[prerender]   → ${item.route} (${item.lang}) [${++completed}/${total}]`)
      await renderOneRoute(browser, item, globals)
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
  // Fetch API data ONCE before rendering any routes.
  // fetchBlogArticles() throws on failure — a build with an empty or erroring
  // article list would bake the error fallback into the blog index HTML.
  const [articles, betaStatus] = await Promise.all([
    fetchBlogArticles(),
    fetchBetaStatus(),
  ])
  const globals = { articles, betaStatus }
  const slugs = articles.map(a => a.slug)

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

  const { staticRoutes, articleRoutes } = buildRoutes(slugs)
  const total = staticRoutes.length + articleRoutes.length
  console.log(`[prerender] prerendering ${total} routes (${staticRoutes.length} static + ${articleRoutes.length} articles)…`)

  // Phase 1: static + blog index — sequential, short list
  console.log(`[prerender] phase 1: static routes (sequential)`)
  for (const item of staticRoutes) {
    console.log(`[prerender]   → ${item.route} (${item.lang})`)
    await renderOneRoute(browser, item, globals)
  }

  // Phase 2: blog articles — concurrent pool
  if (articleRoutes.length > 0) {
    console.log(`[prerender] phase 2: blog articles (concurrency=${CONCURRENCY})`)
    await renderWithPool(browser, articleRoutes, CONCURRENCY, globals)
  }

  await browser.close()
  server.close()

  console.log(`[prerender] done — ${total} routes prerendered ✓`)
}

main().catch((err) => {
  console.error('[prerender] fatal:', err)
  process.exit(1)
})
