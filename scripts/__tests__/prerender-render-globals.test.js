import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SRC = readFileSync(resolve(__dirname, '../prerender.mjs'), 'utf8')

// The prerender sets its globals in two places: evaluateOnNewDocument, which
// runs BEFORE the render, and globalsScript, which is written into the saved
// HTML AFTER it. A global that exists only in the second one is invisible to
// React during the render, so the component fetches it from the API instead:
// once per route, across 726 routes, on every build. That is how /beta and
// /blog/<slug> came to account for most of a day's Worker request budget.
describe('prerender globals', () => {
  const inSavedHtml = [...SRC.matchAll(/window\.__([A-Z_]+)__=\$\{/g)].map((m) => m[1])
  const beforeRender = [...SRC.matchAll(/window\.__([A-Z_]+)__ =/g)].map((m) => m[1])

  it('finds both injection sites', () => {
    expect(inSavedHtml.length, 'globals in the saved HTML').toBeGreaterThan(0)
    expect(beforeRender.length, 'globals in evaluateOnNewDocument').toBeGreaterThan(0)
  })

  it('gives the render every global the saved HTML carries', () => {
    for (const name of inSavedHtml) {
      expect(beforeRender, `__${name}__ reaches the saved HTML but not the render`).toContain(name)
    }
  })

  it('injects the three the components read on first render', () => {
    for (const name of ['BETA', 'BLOG_ARTICLES', 'ARTICLE']) {
      expect(beforeRender, `__${name}__`).toContain(name)
    }
  })
})
