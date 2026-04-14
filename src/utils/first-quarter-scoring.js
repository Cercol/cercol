/**
 * Scoring utilities for Cèrcol First Quarter (IPIP-NEO-60).
 * Scale: 1-5. Reverse items: score = 6 - rawValue.
 * Domain score = mean of 12 items (6 facets × 2 items).
 * Facet score  = mean of 2 items.
 * Scores are rounded to one decimal place.
 */

import { FQ_ITEMS, FQ_DOMAIN_META } from '../data/first-quarter'
import { scoreToPercent5, scoreLabel5 } from './scoring-utils'

/**
 * Compute domain and facet scores from raw answers.
 *
 * @param {Record<number, number>} answers - itemId → raw value (1–5)
 * @returns {{ domains: Record<string, number>, facets: Record<string, number> }}
 */
export function computeFQScores(answers) {
  const facetBuckets = {}

  FQ_ITEMS.forEach((item) => {
    const raw = answers[item.id]
    if (raw === undefined) return
    const scored = item.reverse ? 6 - raw : raw
    if (!facetBuckets[item.facet]) facetBuckets[item.facet] = []
    facetBuckets[item.facet].push(scored)
  })

  const facets = {}
  Object.keys(facetBuckets).forEach((facet) => {
    const vals = facetBuckets[facet]
    facets[facet] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  })

  const domains = {}
  Object.entries(FQ_DOMAIN_META).forEach(([domain, meta]) => {
    const vals = meta.facets.map((f) => facets[f]).filter(Boolean)
    domains[domain] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  })

  return { domains, facets }
}

/** Convert a score (1–5) to 0–100% for progress bars. */
export const fqScoreToPercent = scoreToPercent5

/** Return a tier label for a given score on a 1–5 scale. */
export const fqScoreLabel = scoreLabel5
