/**
 * Scoring utilities for Cèrcol First Quarter (IPIP-NEO-60).
 * Scale: 1-5. Reverse items: score = 6 - rawValue.
 * Domain score = mean of 12 items (6 facets × 2 items).
 * Facet score  = mean of 2 items.
 * Scores are rounded to one decimal place.
 */

import { FQ_ITEMS, FQ_DOMAIN_META } from '../data/first-quarter'
import { computeInstrumentScores, scoreToPercent5, scoreLabel5 } from './scoring-utils'

/**
 * Compute domain and facet scores from raw answers.
 *
 * @param {Record<number, number>} answers - itemId → raw value (1–5)
 * @returns {{ domains: Record<string, number>, facets: Record<string, number> }}
 */
export function computeFQScores(answers) {
  return computeInstrumentScores(answers, FQ_ITEMS, FQ_DOMAIN_META)
}

/** Convert a score (1–5) to 0–100% for progress bars. */
export const fqScoreToPercent = scoreToPercent5

/** Return a tier label for a given score on a 1–5 scale. */
export const fqScoreLabel = scoreLabel5
