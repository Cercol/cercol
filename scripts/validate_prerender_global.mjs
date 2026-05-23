/**
 * GATE for Phase 17.6.x soft-404 fix.
 *
 * Validates that BlogArticlePage renders article content from
 * window.__ARTICLE__ alone, WITHOUT any successful API call.
 *
 * Strategy:
 *   1. Build vite dist/ (run separately before this script).
 *   2. Serve dist/ on a local port with an SPA fallback.
 *   3. Use puppeteer-core + the system Chrome to:
 *      a. Block every request to api.cercol.team (the page must
 *         never depend on the live API).
 *      b. evaluateOnNewDocument: inject window.__ARTICLE__ with a
 *         synthetic article BEFORE React boots.
 *      c. Navigate to /blog/<slug>/.
 *      d. After hydration, assert the document contains the article
 *         title and body text and NOT the "Could not load article"
 *         fallback or the loading skeleton.
 *   4. As a "before-fix" simulation, repeat WITHOUT injecting
 *      __ARTICLE__: expect the error fallback (proves the test is
 *      really exercising the new path).
 *
 * Exit 0 on success, non-zero with a clear message on failure.
 */

import { spawnSync } from 'node:child_process'
import http from 'node:http'
import { readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

import puppeteer from 'puppeteer-core'

const DIST = new URL('../dist/', import.meta.url).pathname
const PORT = 4174
const SLUG = 'soft-404-validation-mock'
const ARTICLE_TITLE = 'MOCK Soft 404 validation article'
const ARTICLE_BODY = 'This body is the synthetic prerender payload and must render without any API call.'

const FAKE_ARTICLE = {
  slug: SLUG,
  status: 'published',
  title: { en: ARTICLE_TITLE },
  description: { en: 'MOCK description' },
  content: { en: `# ${ARTICLE_TITLE}\n\n${ARTICLE_BODY}` },
  published_at: '2026-01-01T00:00:00Z',
  author: 'MOCK',
  coverUrl: '',
  category: 'science',
  complexity: 'intermediate',
  viewCount: 0,
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}


function findChrome() {
  // macOS
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  if (existsSync(mac)) return mac
  for (const candidate of [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]) {
    if (existsSync(candidate)) return candidate
  }
  throw new Error('No Chrome binary found')
}

function existsSync(p) {
  try { statSync(p); return true } catch { return false }
}


function startServer() {
  const indexHtml = readFileSync(join(DIST, 'index.html'))
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0]
    const ext = extname(url)
    if (ext) {
      try {
        const buf = readFileSync(join(DIST, url))
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
        res.end(buf)
        return
      } catch {
        res.writeHead(404); res.end(); return
      }
    }
    // SPA fallback: serve index.html for every path without an extension.
    res.writeHead(200, { 'Content-Type': MIME['.html'] })
    res.end(indexHtml)
  })
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)))
}


async function renderRoute({ browser, route, injectArticle }) {
  const page = await browser.newPage()
  const apiRequests = []
  await page.setRequestInterception(true)

  page.on('request', (req) => {
    const url = req.url()
    if (url.includes('api.cercol.team')) {
      apiRequests.push(url)
      req.abort()
      return
    }
    req.continue()
  })

  if (injectArticle) {
    await page.evaluateOnNewDocument((a) => {
      window.__ARTICLE__ = a
    }, FAKE_ARTICLE)
  }

  await page.goto(`http://127.0.0.1:${PORT}${route}`, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  })
  // Settle for React hydration + useEffect.
  await new Promise(r => setTimeout(r, 2500))

  const bodyText = await page.evaluate(() => document.body.innerText)
  await page.close()
  return { bodyText, apiRequests }
}


function assertContains(haystack, needles, ctx) {
  for (const n of needles) {
    if (!haystack.includes(n)) {
      throw new Error(`[${ctx}] expected body to contain ${JSON.stringify(n)}, got first 500 chars: ${JSON.stringify(haystack.slice(0, 500))}`)
    }
  }
}

function assertNotContains(haystack, needles, ctx) {
  for (const n of needles) {
    if (haystack.includes(n)) {
      throw new Error(`[${ctx}] expected body to NOT contain ${JSON.stringify(n)}, body slice: ${JSON.stringify(haystack.slice(0, 500))}`)
    }
  }
}


async function main() {
  const server = await startServer()
  const chromePath = findChrome()
  console.log(`[gate] server on http://127.0.0.1:${PORT}, chrome at ${chromePath}`)

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    // --- Case A: WITH __ARTICLE__ + API blocked. EXPECT: content visible.
    console.log('\n[gate] Case A: API blocked + window.__ARTICLE__ injected ...')
    const A = await renderRoute({
      browser,
      route: `/blog/${SLUG}/`,
      injectArticle: true,
    })
    console.log(`[gate]   blocked ${A.apiRequests.length} API request(s)`)
    assertContains(A.bodyText, [ARTICLE_TITLE, ARTICLE_BODY], 'A')
    assertNotContains(A.bodyText, ['Could not load', 'no s\'ha pogut'], 'A')

    // --- Case B: WITHOUT __ARTICLE__ + API blocked. EXPECT: error fallback.
    //     This proves Case A's success was due to the global, not luck.
    console.log('\n[gate] Case B: API blocked + NO __ARTICLE__ ...')
    const B = await renderRoute({
      browser,
      route: `/blog/${SLUG}/`,
      injectArticle: false,
    })
    console.log(`[gate]   blocked ${B.apiRequests.length} API request(s)`)
    // The component should either show the error message or remain on
    // the skeleton; the key assertion is that the article title is NOT
    // visible (Case A's success is genuine).
    assertNotContains(B.bodyText, [ARTICLE_BODY], 'B')

    console.log('\n[gate] PASS')
  } finally {
    await browser.close()
    server.close()
  }
}


main().catch(err => {
  console.error('[gate] FAIL', err.message)
  process.exit(1)
})
