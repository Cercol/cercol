/**
 * Server-side role scoring for the group report, on the frontend's engine.
 *
 * # Spec: SCIENCE.md
 *
 * api/scoring.py and src/utils/role-scoring.js implement the same maths
 * (same centroids, same priors, same z-score). This module does not add a
 * third copy: it imports the frontend's computeRole and priorFor and shapes
 * the output the way api/main.py:get_group_report_data returns it, with
 * zscores keyed by domain name and role as a string.
 *
 * Norm tiers: the server has an empirical tier that activates at N >= 200
 * per (instrument, language). Cèrcol has 39 real results, so that tier has
 * never fired and resolve_norm always returns the researcher prior, which
 * is exactly what priorFor gives. When the corpus crosses 200 the empirical
 * norms need to be computed here too; that is phase 8 (jobs), not this.
 */

import { computeRole, priorFor, DOMAIN_MAP } from '../../src/utils/role-scoring.js'

const DOMAINS = ['presence', 'bond', 'discipline', 'depth', 'vision']

/** {presence, bond, ...} raw scores -> {presence: z, ...}, prior for `instrument`. */
export function zscoresFor(scores, instrument) {
  const { mean, sd } = priorFor(instrument)
  const out = {}
  for (const [factor, domain] of Object.entries(DOMAIN_MAP)) {
    const v = scores[domain]
    if (v == null) continue
    out[domain] = (Number(v) - mean[factor]) / sd[factor]
  }
  return out
}

/** The server's pair: (zscores, role) for a raw Full Moon result. */
export function scoreForReport(scores, instrument = 'fullMoon') {
  const complete = DOMAINS.every((d) => scores[d] != null)
  if (!complete) return { zscores: null, role: null }
  return { zscores: zscoresFor(scores, instrument), role: computeRole(scores, instrument).role }
}
