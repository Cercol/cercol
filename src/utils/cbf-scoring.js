/**
 * Cèrcol Big Five scoring utilities.
 *
 * Scale: 1–5
 * Reverse score = 6 − rawValue
 * Domain score  = mean of 6 items in that domain (1–5)
 * Facet score   = mean of 2 items in that facet (1–5)
 */

import { CBF_ITEMS } from '../data/cercol-big-five'

/**
 * Compute domain and facet scores from raw answers.
 *
 * @param {Record<number, number>} answers - itemId → raw value (1–5)
 * @returns {{ domains: Record<string, number>, facets: Record<string, number> }}
 */
export function computeScores(answers) {
  const domainBuckets = {}
  const facetBuckets = {}

  for (const item of CBF_ITEMS) {
    const raw = answers[item.id]
    const scored = item.reverse ? 6 - raw : raw

    if (!domainBuckets[item.domain]) domainBuckets[item.domain] = []
    domainBuckets[item.domain].push(scored)

    if (!facetBuckets[item.facet]) facetBuckets[item.facet] = []
    facetBuckets[item.facet].push(scored)
  }

  const domains = {}
  for (const [key, values] of Object.entries(domainBuckets)) {
    domains[key] = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
  }

  const facets = {}
  for (const [key, values] of Object.entries(facetBuckets)) {
    facets[key] = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
  }

  return { domains, facets }
}

/**
 * Convert a score (1–5) to a 0–100 percentage for display.
 *
 * @param {number} score
 * @returns {number}
 */
export function scoreToPercent(score) {
  return Math.round(((score - 1) / 4) * 100)
}

/**
 * Return a tier label for a given score.
 * Thresholds: <2.5 → low, 2.5–3.5 → moderate, >3.5 → high
 *
 * @param {number} score
 * @returns {'low'|'moderate'|'high'}
 */
export function scoreLabel(score) {
  if (score < 2.5) return 'low'
  if (score <= 3.5) return 'moderate'
  return 'high'
}
