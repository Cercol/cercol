/**
 * TIPI scoring utilities.
 *
 * Each Big Five dimension is measured by 2 items.
 * One item is keyed in the forward direction, one is reverse-keyed.
 * Reverse score = 8 − raw value.
 * Dimension score = mean of its two (possibly reversed) items.
 * Range: 1–7 per dimension.
 */

import { TIPI_ITEMS } from '../data/tipi'

/**
 * Compute Big Five scores from raw answers.
 *
 * @param {Record<number, number>} answers - Map of item id → raw value (1–7)
 * @returns {Record<string, number>} dimension → score (1–7, one decimal)
 */
export function computeScores(answers) {
  // Group items by dimension
  const byDimension = {}
  for (const item of TIPI_ITEMS) {
    if (!byDimension[item.dimension]) byDimension[item.dimension] = []
    byDimension[item.dimension].push(item)
  }

  const scores = {}
  for (const [dimension, items] of Object.entries(byDimension)) {
    const values = items.map((item) => {
      const raw = answers[item.id]
      return item.reverse ? 8 - raw : raw
    })
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    scores[dimension] = Math.round(mean * 10) / 10
  }

  return scores
}

/**
 * Convert a raw score (1–7) to a 0–100 percentage for display.
 *
 * @param {number} score - dimension score (1–7)
 * @returns {number} percentage (0–100)
 */
export function scoreToPercent(score) {
  return Math.round(((score - 1) / 6) * 100)
}

/**
 * Return a short interpretive label for a given score.
 *
 * @param {number} score - dimension score (1–7)
 * @returns {'low'|'moderate'|'high'}
 */
export function scoreLabel(score) {
  if (score <= 2.9) return 'low'
  if (score <= 4.9) return 'moderate'
  return 'high'
}
