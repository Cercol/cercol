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
 * 5. Injects font preload <link> tags + window globals into <head>
 * 6. Inlines above-the-fold CSS via Beasties (critical CSS)
 * 7. Saves the fully-rendered HTML to dist/<route>/index.html
 *
 * Why this matters for SEO:
 * - Google indexes the static HTML directly — no JS execution lag
 * - LLMs and Perplexity can scrape content without running JavaScript
 * - First Contentful Paint improves because browsers get real HTML instantly
 *
 * Why font preloads are injected:
 * - Vite emits content-hashed filenames (e.g. playfair-display-latin-400-*.woff2)
 *   that change on every build. We extract them at runtime from the built CSS file
 *   so preload hints always reference the correct hash without hardcoding filenames.
 * - Preloading Playfair Display 400 and Roboto 400/500/700 eliminates flash of
 *   invisible text (FOIT) for the primary typefaces used above the fold.
 *
 * Why window globals are injected:
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
 * Why Beasties for Critical CSS:
 * - Approach A (Vite plugin transformIndexHtml) is wrong: it sees the empty
 *   <div id="root"></div> SPA shell with no rendered content, so no CSS is
 *   above-the-fold and the inlined critical block is empty or wrong.
 * - Approach B (post-Puppeteer Node.js): after page.content() returns the
 *   fully-rendered DOM, Beasties sees the actual components and correctly
 *   inlines the styles needed for exactly this page's above-the-fold content.
 * - pruneSource: false is critical — 637 HTML files share one content-hashed
 *   CSS file. Pruning would corrupt the shared asset for subsequent routes.
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
import Beasties from 'beasties'
import { createServer } from 'http'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { normalizeUnsplashUrl } from '../src/utils/unsplash.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST_DIR   = resolve(__dirname, '../dist')
const BASE_URL   = 'http://localhost:4173'

// Parallel Chrome pages for blog article rendering.
// 4 tabs share one browser instance — low memory, fast enough.
const CONCURRENCY = 4

// Static routes to prerender — auth-gated routes are excluded.
const STATIC_ROUTES = ['/', '/about', '/instruments', '/roles', '/science', '/faq', '/privacy', '/sample']
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
 * Fetch the full content of every article in parallel and build a
 * Map<slug, article>. Used by renderOneRoute to inject
 * window.__ARTICLE__ for each per-article render, so BlogArticlePage
 * does not need to re-fetch from the API after hydration. The
 * re-fetch was the soft-404 source: a slow / flapping API during
 * Googlebot's render would surface "Could not load article" and
 * Google would index that fallback as the page content.
 *
 * THROWS on failure for the same reason fetchBlogArticles does:
 * baking the error fallback into 624 prerendered HTMLs is much
 * worse than failing the build.
 */
async function fetchAllArticleContent(slugs) {
  const concurrency = 8
  const queue = [...slugs]
  const out = new Map()
  let inflight = 0
  let failures = 0

  async function worker() {
    while (queue.length > 0) {
      const slug = queue.shift()
      if (!slug) break
      inflight++
      try {
        const res = await globalThis.fetch(
          `https://api.cercol.team/blog/${encodeURIComponent(slug)}`,
          { signal: AbortSignal.timeout(15000) },
        )
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const article = await res.json()
        out.set(slug, article)
      } catch (err) {
        failures++
        console.warn(`[prerender]   ! article fetch failed for ${slug}: ${err.message}`)
      } finally {
        inflight--
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, slugs.length) },
    () => worker(),
  )
  await Promise.all(workers)

  console.log(`[prerender] fetched ${out.size}/${slugs.length} articles for window.__ARTICLE__`)
  if (failures > 0 && out.size < slugs.length / 2) {
    throw new Error(`Article content fetch failed for too many slugs (${failures})`)
  }
  return out
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
// Critical font URL extraction
// ---------------------------------------------------------------------------

/**
 * Extract the content-hashed woff2 URLs for the four critical typefaces from
 * the built CSS bundle. Vite hashes filenames on every build so we cannot
 * hardcode them — we read them from the CSS at runtime instead.
 *
 * Target fonts (all used above the fold):
 *   - Playfair Display 400 (display headings)
 *   - Roboto 400, 500, 700 (body + UI)
 *
 * @param {string} distDir  Absolute path to the dist/ directory.
 * @returns {string[]}  Array of public-path font URLs (e.g. '/assets/playfair-display-latin-400-abc123.woff2')
 */
function extractCriticalFontUrls(distDir) {
  const assetsDir = join(distDir, 'assets')
  let cssFile

  try {
    const files = readdirSync(assetsDir)
    // The main CSS bundle is always named index-<hash>.css
    cssFile = files.find(f => /^index-[A-Za-z0-9_-]+\.css$/.test(f))
  } catch {
    console.warn('[prerender] could not read dist/assets — skipping font preloads')
    return []
  }

  if (!cssFile) {
    console.warn('[prerender] no index-*.css found in dist/assets — skipping font preloads')
    return []
  }

  let css
  try {
    css = readFileSync(join(assetsDir, cssFile), 'utf8')
  } catch {
    console.warn('[prerender] could not read CSS bundle — skipping font preloads')
    return []
  }

  // Patterns match the font-face url() declarations Vite emits for each face.
  // The filenames follow the pattern: <family>-<subset>-<weight>-normal-<hash>.woff2
  const patterns = [
    /playfair-display-latin-400-normal-[A-Za-z0-9_-]+\.woff2/,
    /roboto-latin-400-normal-[A-Za-z0-9_-]+\.woff2/,
    /roboto-latin-500-normal-[A-Za-z0-9_-]+\.woff2/,
    /roboto-latin-700-normal-[A-Za-z0-9_-]+\.woff2/,
  ]

  const urls = []
  for (const pattern of patterns) {
    const match = css.match(pattern)
    if (match) {
      urls.push(`/assets/${match[0]}`)
    } else {
      console.warn(`[prerender] font not found in CSS: ${pattern.source}`)
    }
  }

  console.log(`[prerender] found ${urls.length} critical font URLs`)
  return urls
}

/**
 * Build the <link rel="preload"> tags for the given font URLs.
 * crossorigin is required by spec even for same-origin fonts (CORS headers
 * are set for font requests regardless of origin).
 *
 * @param {string[]} urls  Public-path font URLs from extractCriticalFontUrls()
 * @returns {string}  HTML string of <link> tags (empty string if urls is empty)
 */
function buildFontPreloadTags(urls) {
  return urls
    .map(href => `  <link rel="preload" as="font" type="font/woff2" crossorigin href="${href}">`)
    .join('\n')
}

// ---------------------------------------------------------------------------
// Route plan
// ---------------------------------------------------------------------------

function buildRoutes(slugs) {
  // Phase 1: top-level pages in every language + blog index per language.
  // Each top-level page (home, about, instruments, roles, science, faq,
  // privacy) is prerendered once per language as a real path: EN stays
  // unprefixed (/about), the others get a prefix (/es/about, /es for home).
  const prefixLangs = BLOG_LANGS.filter(l => l !== 'en')
  const staticRoutes = []
  for (const route of STATIC_ROUTES) {
    staticRoutes.push({ route, lang: 'en' })
    for (const lang of prefixLangs) {
      const localized = route === '/' ? `/${lang}` : `/${lang}${route}`
      staticRoutes.push({ route: localized, lang })
    }
  }
  for (const lang of BLOG_LANGS) {
    const prefix = lang === 'en' ? '' : `/${lang}`
    staticRoutes.push({ route: `${prefix}/blog`, lang })
  }

  // 12 per-role share shells (/share/R01../share/R12). Unprefixed only: the
  // per-role og:image is language-neutral and the share URL handleShare builds
  // is unprefixed; the human landing renders in their client language.
  for (let i = 1; i <= 12; i++) {
    staticRoutes.push({ route: `/share/R${String(i).padStart(2, '0')}`, lang: 'en' })
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

function startServer(originalIndexHtml) {
  // originalIndexHtml is the raw Vite-built index.html content captured before
  // any route is processed. We always serve THIS as the SPA shell fallback so
  // that Puppeteer never loads a progressively-modified index.html (one that
  // already has font preloads injected), which would cause duplicate preload
  // tags on every route other than '/'.
  const originalIndexBuffer = Buffer.from(originalIndexHtml, 'utf8')

  const server = createServer((req, res) => {
    let filePath = join(DIST_DIR, req.url.split('?')[0])

    // If requesting a directory, serve index.html from it (or the original
    // root index.html — never the on-disk root which may be already modified)
    if (!filePath.includes('.')) {
      const dirIndex = join(filePath, 'index.html')
      filePath = existsSync(dirIndex) ? dirIndex : null
    }

    if (filePath) {
      try {
        const content = readFileSync(filePath)
        res.writeHead(200, { 'Content-Type': getMime(filePath) })
        res.end(content)
        return
      } catch { /* fall through to SPA shell */ }
    }

    // SPA shell fallback: always use the original Vite-built index.html
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(originalIndexBuffer)
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

async function renderOneRoute(browser, { route, lang }, { articles, articlesBySlug, betaStatus, beasties, fontPreloadTags }) {
  const url = `${BASE_URL}${route}`
  // Isolated browser context per route. localStorage is shared per-origin
  // across pages of the SAME context, and renderWithPool renders routes
  // concurrently, so without isolation one route's 'cercol-lang' leaked into
  // others — English pages inherited the last-set language (e.g. /science
  // prerendered in Danish). An isolated context gives each route its own storage.
  const context = await browser.createBrowserContext()
  const page = await context.newPage()

  // Suppress JS errors from the page (i18n fetch errors in static context are expected)
  page.on('pageerror', () => {})
  page.on('requestfailed', () => {})

  // Article routes (/blog/<slug>, /<lang>/blog/<slug>) only consume
  // {slug, languages} from __BLOG_ARTICLES__ (localizeBlogLinks). The blog
  // INDEX needs the full list (titles, descriptions, covers). Slimming the
  // per-article payload removes ~150 KB of duplicated JSON from every one of
  // the 600+ article HTMLs, which was the bulk of the prerendered document
  // weight and the main mobile-FCP cost.
  const blogMatch = route.match(/^\/(?:([a-z]{2})\/)?blog\/([^/]+)\/?$/)
  const isArticleRoute = Boolean(blogMatch)
  const slimArticles = articles.map(a => ({ slug: a.slug, languages: a.languages }))
  const pageArticles = isArticleRoute ? slimArticles : articles

  // Expose the article list to React DURING the render (not only to the
  // hydrated client via the post-capture <script> below). BlogArticlePage's
  // language-aware internal-link rewrite reads window.__BLOG_ARTICLES__ to
  // decide whether a target has the active locale; without this the
  // prerendered (crawler-visible) HTML keeps English link URLs on localized
  // pages. evaluateOnNewDocument runs before every navigation on this page.
  await page.evaluateOnNewDocument((arts) => {
    window.__BLOG_ARTICLES__ = arts
    // Runtime-only flag so client code (e.g. trackBlogView) can detect the
    // prerender pass and skip side effects like view-count increments. This
    // is set via evaluateOnNewDocument, NOT injected into the saved HTML, so
    // real users are never flagged.
    window.__PRERENDER__ = true
  }, pageArticles)

  // Pin the i18n language for THIS route, for every language INCLUDING English.
  // useLocaleSync does not force 'en' on unprefixed routes (to respect a saved
  // preference), so without an explicit 'en' an English page would inherit
  // whatever the context started with. The isolated context above makes this
  // deterministic and race-free.
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 10000 })
  await page.evaluate((l) => localStorage.setItem('cercol-lang', l), lang)

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
  await context.close()

  // --- Step 1: inject head hints + window globals --------------------------
  //
  // Font preloads + image hints go in <head> BEFORE the Beasties pass so
  // Beasties preserves them (it does not strip existing preloads).
  //
  // window globals let React read API data synchronously on first render:
  //   window.__BLOG_ARTICLES__ - article list for BlogIndexPage / link rewrite
  //                              (full on index routes, slim {slug,languages}
  //                              on article routes)
  //   window.__BETA__          - beta launch status for BetaBanner
  //   window.__ARTICLE__       - the full article (with content) for
  //                              BlogArticlePage on this exact route, so
  //                              the component does not need to re-fetch
  //                              after hydration. Only emitted on
  //                              /blog/<slug> and /<lang>/blog/<slug>
  //                              routes; other routes do not carry a
  //                              per-route article payload.
  //
  // The globals are emitted as a classic inline <script> at the END of
  // <body> (not in <head>): classic inline scripts run during parsing,
  // before the deferred module bundle, so React still reads the globals on
  // first render — while keeping the large JSON out of <head> lets the
  // above-the-fold content paint first.
  let articleScript = ''
  let coverPreload = ''
  if (blogMatch) {
    const slug = blogMatch[2]
    // The blog INDEX (`/blog`, `/<lang>/blog`) is excluded because the
    // regex requires a slug segment after `/blog/`.
    const article = articlesBySlug ? articlesBySlug.get(slug) : undefined
    if (article) {
      articleScript = `window.__ARTICLE__=${JSON.stringify(article)};`
      // Preload the cover image (likely LCP element) with a responsive
      // imagesrcset matching the <img> below, so the browser fetches the
      // right candidate immediately instead of after parsing the body.
      const cover = article.coverUrl || article.cover_url
      const src480 = normalizeUnsplashUrl(cover, { w: 480 })
      const src760 = normalizeUnsplashUrl(cover, { w: 760 })
      const src1200 = normalizeUnsplashUrl(cover, { w: 1200 })
      if (src760) {
        coverPreload = `<link rel="preload" as="image" imagesrcset="${src480} 480w, ${src760} 760w, ${src1200} 1200w" imagesizes="(min-width: 768px) 768px, 100vw">`
      }
    } else {
      console.warn(`[prerender]   ! no __ARTICLE__ available for slug ${slug} on ${route}`)
    }
  }
  const globalsScript = `<script>window.__BETA__=${JSON.stringify(betaStatus)};window.__BLOG_ARTICLES__=${JSON.stringify(pageArticles)};${articleScript}</script>`
  // Preconnect to the Unsplash CDN so cover-image DNS/TLS is warm by the time
  // the preload fires. No crossorigin: the <img> is not a CORS request.
  const preconnect = `<link rel="preconnect" href="https://images.unsplash.com">`
  const headInjections = `${fontPreloadTags}\n  ${preconnect}${coverPreload ? `\n  ${coverPreload}` : ''}`
  const htmlWithInjections = html
    .replace('</head>', `${headInjections}\n</head>`)
    .replace('</body>', `  ${globalsScript}\n</body>`)

  // --- Step 2: inline critical CSS via Beasties ----------------------------
  //
  // Beasties walks the rendered DOM (which is now fully React-hydrated HTML)
  // and inlines only the CSS rules that apply to above-the-fold elements.
  // The full stylesheet <link> is kept (pruneSource: false) so below-the-fold
  // styles load normally. All 637 routes share the same content-hashed CSS
  // file — pruning would corrupt the shared cached asset for other routes.
  let finalHtml
  try {
    finalHtml = await beasties.process(htmlWithInjections)
  } catch (err) {
    console.warn(`[prerender] beasties failed for ${route} (${err.message}) — using un-inlined HTML`)
    finalHtml = htmlWithInjections
  }

  // --- Step 3: write to dist -----------------------------------------------
  if (route === '/') {
    writeFileSync(join(DIST_DIR, 'index.html'), finalHtml, 'utf8')
  } else {
    const dir = join(DIST_DIR, route.slice(1))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), finalHtml, 'utf8')
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
  const slugs = articles.map(a => a.slug)

  // Pull the full content for each article so each per-article render
  // can inject window.__ARTICLE__ and BlogArticlePage does not need to
  // re-fetch after hydration. Phase 17.6.x soft-404 root cause.
  const articlesBySlug = await fetchAllArticleContent(slugs)

  // Extract content-hashed font URLs from the built CSS bundle.
  // Must run after `vite build` has emitted dist/assets/index-*.css.
  const fontUrls = extractCriticalFontUrls(DIST_DIR)
  const fontPreloadTags = buildFontPreloadTags(fontUrls)

  // Instantiate Beasties once — it reads the CSS bundle from dist/assets
  // and inlines above-the-fold rules into each rendered HTML string.
  // pruneSource: false is critical: all 637 HTML files share one CSS file;
  // pruning would remove used rules from the shared asset after the first route.
  const beasties = new Beasties({
    path: DIST_DIR,
    publicPath: '/',
    preload: 'swap',
    pruneSource: false,
    inlineThreshold: 0,
    logLevel: 'warn',
  })

  const globals = { articles, articlesBySlug, betaStatus, beasties, fontPreloadTags }

  // Snapshot the Vite-built index.html BEFORE any route overwrites it.
  // The server uses this frozen copy as the SPA shell so Puppeteer always
  // gets the clean original, avoiding duplicate head-injection across routes.
  const originalIndexHtml = readFileSync(join(DIST_DIR, 'index.html'), 'utf8')
  const server = await startServer(originalIndexHtml)

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
