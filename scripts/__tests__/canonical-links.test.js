/**
 * Guards the trailing-slash pass that runs over every pre-rendered page.
 *
 * The cases that matter are the ones it must NOT touch: an asset URL gains a
 * slash and stops resolving, and a JSON payload gains one inside a string the
 * app later parses. Both would be worse than the redirect this fixes.
 */
import { describe, it, expect } from 'vitest'

import { canonicaliseInternalHrefs } from '../lib/canonical-links.mjs'

describe('canonicaliseInternalHrefs', () => {
  it('adds the slash to an extension-less internal href', () => {
    expect(canonicaliseInternalHrefs('<a href="/roles">r</a>')).toBe('<a href="/roles/">r</a>')
    expect(canonicaliseInternalHrefs('<a href="/blog/some-slug">s</a>'))
      .toBe('<a href="/blog/some-slug/">s</a>')
  })

  it('leaves an already-canonical href alone', () => {
    const html = '<a href="/roles/">r</a><a href="/">home</a>'
    expect(canonicaliseInternalHrefs(html)).toBe(html)
  })

  it('leaves assets and files alone', () => {
    const html = '<link href="/assets/roboto-latin-400-normal-BqEyEoaF.woff2">'
      + '<link href="/sitemap.xml"><link href="/favicon.svg">'
    expect(canonicaliseInternalHrefs(html)).toBe(html)
  })

  it('leaves external and fragment hrefs alone', () => {
    const html = '<a href="https://cercol.team/roles">x</a><a href="#sources">y</a>'
    expect(canonicaliseInternalHrefs(html)).toBe(html)
  })

  it('keeps the query and hash after the slash', () => {
    expect(canonicaliseInternalHrefs('<a href="/blog/x#sources">x</a>'))
      .toBe('<a href="/blog/x/#sources">x</a>')
    expect(canonicaliseInternalHrefs('<a href="/blog?page=2">x</a>'))
      .toBe('<a href="/blog/?page=2">x</a>')
  })

  it('does not reach inside the embedded JSON globals', () => {
    // window.__ARTICLE__ carries article markdown with escaped quotes. The
    // pattern requires a literal `href="`, which `href=\"` is not.
    const html = '<script>window.__ARTICLE__={"content":{"en":"<a href=\\"/blog/x\\">x</a>"}};</script>'
    expect(canonicaliseInternalHrefs(html)).toBe(html)
  })
})
