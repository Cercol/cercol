// Spec: src/pages/blog/BlogArticlePage.jsx
//
// Guards the ring order of the related-articles fallback. The /blog list
// arrives newest-first, and slicing its head meant every article without
// explicit in-prose links pointed its fallback slots at the same newest
// posts, so most of the corpus received no inbound link from any article
// page (the commonest cause of "crawled - currently not indexed" on the
// translated versions). The fallback must instead walk a slug-sorted ring,
// same category first, starting just past the current article, so inbound
// links spread across the whole corpus and stay stable across prerenders.

import { describe, expect, it } from 'vitest'

import { relatedFallback, relatedPicks } from '../BlogArticlePage.jsx'

const P = (slug, category) => ({ slug, category })

describe('relatedFallback', () => {
  it('starts just past the current slug within the category and wraps around', () => {
    const current = P('c', 'guides')
    const out = relatedFallback(current, [P('a', 'guides'), P('b', 'guides'), P('d', 'guides'), P('e', 'guides')])
    expect(out.map(p => p.slug)).toEqual(['d', 'e', 'a', 'b'])
  })

  it('puts same-category candidates before the rest, each group ring-ordered', () => {
    const current = P('c', 'guides')
    const out = relatedFallback(current, [P('b', 'science'), P('d', 'science'), P('a', 'guides'), P('e', 'guides')])
    expect(out.map(p => p.slug)).toEqual(['e', 'a', 'd', 'b'])
  })

  it('treats a missing category as general on both sides', () => {
    const current = { slug: 'c' }
    const out = relatedFallback(current, [P('a', 'general'), P('d'), P('b', 'science')])
    expect(out.map(p => p.slug)).toEqual(['d', 'a', 'b'])
  })

  it('is deterministic whatever order the list endpoint returns', () => {
    const current = P('m', 'work')
    const shuffled = [P('z', 'work'), P('a', 'science'), P('k', 'work'), P('q', 'science')]
    const sortedIn = [P('a', 'science'), P('k', 'work'), P('q', 'science'), P('z', 'work')]
    expect(relatedFallback(current, shuffled)).toEqual(relatedFallback(current, sortedIn))
    expect(relatedFallback(current, shuffled).map(p => p.slug)).toEqual(['z', 'k', 'q', 'a'])
  })

  it('spreads inbound links: with three slots every article in a category is linked', () => {
    const slugs = ['a', 'b', 'c', 'd', 'e', 'f']
    const posts = slugs.map(s => P(s, 'guides'))
    const inbound = Object.fromEntries(slugs.map(s => [s, 0]))
    for (const current of posts) {
      const picks = relatedFallback(current, posts.filter(p => p.slug !== current.slug)).slice(0, 3)
      for (const p of picks) inbound[p.slug] += 1
    }
    for (const s of slugs) expect(inbound[s]).toBe(3)
  })

  it('handles the current slug sorting last (findIndex misses) by wrapping to the start', () => {
    const current = P('z', 'guides')
    const out = relatedFallback(current, [P('a', 'guides'), P('b', 'guides')])
    expect(out.map(p => p.slug)).toEqual(['a', 'b'])
  })
})

describe('relatedPicks', () => {
  it('caps prose-linked articles at two so the ring always keeps a slot', () => {
    const posts = ['a', 'b', 'c', 'd', 'e'].map(s => P(s, 'guides'))
    const out = relatedPicks(P('c', 'guides'), posts, ['a', 'b', 'e'])
    // Prose links in list order fill two slots; the third is the ring
    // successor (d), not the third prose link (e).
    expect(out.map(p => p.slug)).toEqual(['a', 'b', 'd'])
  })

  it('keeps the ring over prose-linked candidates, deduplicating at assembly', () => {
    const posts = ['a', 'b', 'c', 'd'].map(s => P(s, 'guides'))
    // d, the ring successor of c, is also prose-linked: it must appear once,
    // not be excluded from the ring (the old filter dropped it entirely when
    // two newer prose links took the linked slots).
    const out = relatedPicks(P('c', 'guides'), posts, ['a', 'b', 'd'])
    expect(out.map(p => p.slug)).toEqual(['a', 'b', 'd'])
  })

  it('excludes the current article and fills entirely from the ring without prose links', () => {
    const posts = ['a', 'b', 'c', 'd', 'e'].map(s => P(s, 'guides'))
    const out = relatedPicks(P('c', 'guides'), posts, [])
    expect(out.map(p => p.slug)).toEqual(['d', 'e', 'a'])
  })

  it('guarantees every article at least one inbound link however dense the prose links', () => {
    // Worst case for the old assembly: every article prose-links the same
    // three newest posts, so fallback never rendered and the rest of the
    // corpus had zero related-section inbound links.
    const slugs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const posts = slugs.map(s => P(s, 'guides'))
    const inbound = Object.fromEntries(slugs.map(s => [s, 0]))
    for (const current of posts) {
      const linkedSlugs = ['a', 'b', 'c'].filter(s => s !== current.slug)
      for (const p of relatedPicks(current, posts, linkedSlugs)) inbound[p.slug] += 1
    }
    for (const s of slugs) expect(inbound[s]).toBeGreaterThan(0)
  })
})
