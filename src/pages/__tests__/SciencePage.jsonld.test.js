// Spec: src/pages/SciencePage.jsx
//
// /science injects ScholarlyArticle JSON-LD for LLM/search citability. The
// injection runs in a useEffect (does not run under SSR), so the builder is
// asserted directly. Academic vocabulary is required in structured data.

import { describe, expect, it } from 'vitest'

import { buildScienceJsonLd } from '../SciencePage.jsx'

describe('buildScienceJsonLd', () => {
  it('is a ScholarlyArticle with the canonical /science url', () => {
    const ld = buildScienceJsonLd()
    expect(ld['@type']).toBe('ScholarlyArticle')
    expect(ld.url).toBe('https://cercol.team/science/')
  })

  it('derives 9 CreativeWork citations from the on-page references', () => {
    const ld = buildScienceJsonLd()
    expect(Array.isArray(ld.citation)).toBe(true)
    expect(ld.citation).toHaveLength(9)
    expect(ld.citation.every((c) => c['@type'] === 'CreativeWork' && c.name)).toBe(true)
    // At least 8 of the 9 references carry a DOI link.
    expect(ld.citation.filter((c) => c.url && c.url.includes('doi.org')).length).toBeGreaterThanOrEqual(8)
  })

  it('uses academic vocabulary in the about field', () => {
    const about = buildScienceJsonLd().about
    expect(about).toContain('IPIP')
    expect(about).toContain('Big Five')
  })
})
