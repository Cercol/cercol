/**
 * Scoring utilities for Cèrcol Full Moon (IPIP-NEO-120).
 * Scale: 1-5. Reverse items: score = 6 - rawValue.
 * Domain score = mean of 24 items (6 facets × 4 items).
 * Facet score  = mean of 4 items.
 * Scores are rounded to one decimal place.
 */

import { FM_ITEMS, FM_DOMAIN_META } from '../data/full-moon'

/**
 * Compute domain and facet scores from raw answers.
 *
 * @param {Record<number, number>} answers - itemId → raw value (1–5)
 * @returns {{ domains: Record<string, number>, facets: Record<string, number> }}
 */
export function computeFMScores(answers) {
  const facetBuckets = {}

  FM_ITEMS.forEach((item) => {
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
  Object.entries(FM_DOMAIN_META).forEach(([domain, meta]) => {
    const vals = meta.facets.map((f) => facets[f]).filter(Boolean)
    domains[domain] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  })

  return { domains, facets }
}

/**
 * Convert a score (1–5) to 0–100% for progress bars.
 *
 * @param {number} score
 * @returns {number}
 */
export function fmScoreToPercent(score) {
  return Math.round(((score - 1) / 4) * 100)
}

/**
 * Return a tier label for a given score.
 * Thresholds: <2.5 → low, 2.5–3.5 → moderate, >3.5 → high
 *
 * @param {number} score
 * @returns {'low'|'moderate'|'high'}
 */
export function fmScoreLabel(score) {
  if (score < 2.5) return 'low'
  if (score <= 3.5) return 'moderate'
  return 'high'
}
