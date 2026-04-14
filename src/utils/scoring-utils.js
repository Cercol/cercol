/**
 * scoring-utils.js — shared scoring helpers for 1-5 scale instruments.
 *
 * Used by first-quarter-scoring.js, full-moon-scoring.js, and any other
 * 1-5 scale instrument. New Moon uses a 1-7 scale and has its own helpers.
 */

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
