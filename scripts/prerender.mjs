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
 */

import puppeteer from 'puppeteer-core'
import { createServer } from 'http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST_DIR   = resolve(__dirname, '../dist')
const BASE_URL   = 'http://localhost:4173'

// Public routes to prerender — auth-gated routes are excluded.
const ROUTES = [
  '/',
  '/about',
  '/instruments',
  '/roles',
  '/science',
  '/faq',
  '/privacy',
]

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

  console.log(`[prerender] prerendering ${ROUTES.length} routes…`)

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`
    console.log(`[prerender]   → ${route}`)

    const page = await browser.newPage()

    // Suppress JS errors from the page (i18n fetch errors in static context are expected)
    page.on('pageerror', () => {})
    page.on('requestfailed', () => {})

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

    // Extra settle time for React hydration and i18n loading
    await new Promise(r => setTimeout(r, 1500))

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

  await browser.close()
  server.close()

  console.log(`[prerender] done — ${ROUTES.length} routes prerendered ✓`)
}

main().catch((err) => {
  console.error('[prerender] fatal:', err)
  process.exit(1)
})
