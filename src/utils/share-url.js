/**
 * share-url.js — shared URL encoding/decoding and share-link helpers.
 *
 * Used by NewMoonResultsPage, FirstQuarterResultsPage, and FullMoonResultsPage
 * to build shareable links with domain scores encoded as a base64 query param.
 */
import { DOMAIN_KEYS } from '../data/domains'

/** Duration (ms) for which the "Copied!" feedback state is shown. */
export const CLIPBOARD_FEEDBACK_MS = 2000

/**
 * Encode domain scores to a base64 string for use in share URLs.
 * Order follows DOMAIN_KEYS — do not reorder.
 * @param {Record<string, number>} scores
 * @returns {string}
 */
export function encodeScores(scores) {
  const ordered = DOMAIN_KEYS.map(k => scores[k] ?? 0)
  return btoa(ordered.join(','))
}

/**
 * Decode a base64 score string back to a domain score object.
 * Returns null if the string is malformed or has the wrong number of values.
 * @param {string} b64
 * @returns {Record<string, number>|null}
 */
export function decodeScores(b64) {
  try {
    const values = atob(b64).split(',').map(Number)
    if (values.length !== DOMAIN_KEYS.length) return null
    return Object.fromEntries(DOMAIN_KEYS.map((k, i) => [k, values[i]]))
  } catch {
    return null
  }
}
