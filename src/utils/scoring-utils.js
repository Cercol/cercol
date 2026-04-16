/**
 * scoring-utils.js — shared scoring helpers for 1-5 scale instruments.
 *
 * Used by first-quarter-scoring.js, full-moon-scoring.js, and any other
 * 1-5 scale instrument. New Moon uses a 1-7 scale and has its own helpers.
 */

/**
 * computeInstrumentScores — generic scoring engine for IPIP-based instruments.
 *
 * Both First Quarter (60 items, scale 1-5) and Full Moon (120 items, scale 1-5)
 * use the same algorithm: score raw answers → bucket into facets → aggregate into
 * domains via facet means. The only difference is the source items and domain meta.
 *
 * @param {Record<number, number>} answers  — itemId → raw value (1–5)
 * @param {Array<{id, facet, reverse}>} items — instrument items
 * @param {Record<string, {facets: string[]}>} domainMeta — domain → facet list
 * @param {number} [reverseMax=6] — reversal formula: reverseMax - rawValue
 * @returns {{ domains: Record<string, number>, facets: Record<string, number> }}
 */
export function computeInstrumentScores(answers, items, domainMeta, reverseMax = 6) {
  const facetBuckets = {}

  items.forEach((item) => {
    const raw = answers[item.id]
    if (raw === undefined) return
    const scored = item.reverse ? reverseMax - raw : raw
    if (!facetBuckets[item.facet]) facetBuckets[item.facet] = []
    facetBuckets[item.facet].push(scored)
  })

  const facets = {}
  Object.keys(facetBuckets).forEach((facet) => {
    const vals = facetBuckets[facet]
    facets[facet] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  })

  const domains = {}
  Object.entries(domainMeta).forEach(([domain, meta]) => {
    const vals = meta.facets.map((f) => facets[f]).filter(Boolean)
    domains[domain] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  })

  return { domains, facets }
}

/**
 * Convert a score on a 1–5 scale to 0–100% for progress bars.
 * @param {number} score
 * @returns {number}
 */
export function scoreToPercent5(score) {
  return Math.round(((score - 1) / 4) * 100)
}

/**
 * Return a tier label for a score on a 1–5 scale.
 * Thresholds: <2.5 → low, 2.5–3.5 → moderate, >3.5 → high
 * @param {number} score
 * @returns {'low'|'moderate'|'high'}
 */
export function scoreLabel5(score) {
  if (score < 2.5) return 'low'
  if (score <= 3.5) return 'moderate'
  return 'high'
}
