/**
 * Cèrcol Radar scoring utilities.
 *
 * Wraps the TIPI scoring engine and remaps dimension keys so that
 * results can be displayed using the same i18n domain keys as Cèrcol Test.
 *
 * TIPI key  →  CBF display key
 * openness            → openMindedness
 * neuroticism         → negativeEmotionality
 * extraversion        → extraversion        (unchanged)
 * agreeableness       → agreeableness       (unchanged)
 * conscientiousness   → conscientiousness   (unchanged)
 *
 * Scores remain on the 1–7 scale; pass maxScore=7 to RadarChart.
 */

import { computeScores as tipiCompute } from './scoring'

/** Map from TIPI key to CBF/display key */
const KEY_MAP = {
  openness: 'openMindedness',
  neuroticism: 'negativeEmotionality',
  extraversion: 'extraversion',
  agreeableness: 'agreeableness',
  conscientiousness: 'conscientiousness',
}

/**
 * Compute Radar (TIPI) scores, remapped to CBF display keys.
 *
 * @param {Record<number, number>} answers - itemId → raw value (1–7)
 * @returns {Record<string, number>} CBF display key → score (1–7)
 */
export function computeRadarScores(answers) {
  const raw = tipiCompute(answers)
  const remapped = {}
  for (const [tipiKey, displayKey] of Object.entries(KEY_MAP)) {
    remapped[displayKey] = raw[tipiKey]
  }
  return remapped
}

/**
 * Convert a Radar score (1–7) to 0–100% for progress bars.
 *
 * @param {number} score
 * @returns {number}
 */
export function radarScoreToPercent(score) {
  return Math.round(((score - 1) / 6) * 100)
}

/**
 * Return a tier label for a Radar score.
 * Thresholds: ≤2.9 low, ≤4.9 moderate, >4.9 high
 *
 * @param {number} score
 * @returns {'low'|'moderate'|'high'}
 */
export function radarScoreLabel(score) {
  if (score <= 2.9) return 'low'
  if (score <= 4.9) return 'moderate'
  return 'high'
}
