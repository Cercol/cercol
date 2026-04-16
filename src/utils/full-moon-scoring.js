/**
 * Scoring utilities for Cèrcol Full Moon (IPIP-NEO-120).
 * Scale: 1-5. Reverse items: score = 6 - rawValue.
 * Domain score = mean of 24 items (6 facets × 4 items).
 * Facet score  = mean of 4 items.
 * Scores are rounded to one decimal place.
 */

import { FM_ITEMS, FM_DOMAIN_META } from '../data/full-moon'
import { computeInstrumentScores, scoreToPercent5, scoreLabel5 } from './scoring-utils'

/**
 * Compute domain and facet scores from raw answers.
 *
 * @param {Record<number, number>} answers - itemId → raw value (1–5)
 * @returns {{ domains: Record<string, number>, facets: Record<string, number> }}
 */
export function computeFMScores(answers) {
  return computeInstrumentScores(answers, FM_ITEMS, FM_DOMAIN_META)
}

/** Convert a score (1–5) to 0–100% for progress bars. */
export const fmScoreToPercent = scoreToPercent5

/** Return a tier label for a given score on a 1–5 scale. */
export const fmScoreLabel = scoreLabel5
