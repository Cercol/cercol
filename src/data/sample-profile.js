/**
 * sample-profile.js — a fixed, SYNTHETIC example profile for the public
 * /sample report. No real person, no PII: the five scores are hand-picked to
 * land deterministically on a clean role (Dolphin / R01 via computeRole) so the
 * sample report is illustrative and stable across builds.
 *
 * Scale is 1-7 (New Moon style) so the radar renders with maxScore=7, matching
 * the lightest instrument. Changing these values may change the displayed role.
 */
export const SAMPLE_SCORES = {
  presence: 5.5,
  bond: 5.8,
  discipline: 4.2,
  depth: 2.6,
  vision: 4.5,
}

/** Radar/scale maximum for the sample (New Moon 1-7). */
export const SAMPLE_MAX_SCORE = 7
