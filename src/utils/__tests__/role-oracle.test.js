/**
 * Shared FE/BE role oracle — frontend consumer.
 *
 * Loads tests/role-oracle.json from the repo root and verifies:
 * 1. NORM_MEAN and NORM_SD match the oracle's norm_assumptions (catches FE/BE norm drift).
 * 2. For every oracle case, computeRole returns the expected role code.
 *
 * NOTE: computeRole takes raw 1-5 scores and handles z-score conversion internally,
 * so no manual conversion is needed here. The return value is {role, arc, probabilities};
 * we extract .role for comparison.
 */

import { describe, it, expect } from 'vitest'
import oracle from '../../../tests/role-oracle.json'
import { computeRole, NORM_MEAN, NORM_SD } from '../role-scoring'

// Mapping from oracle JSON dimension names (Python/domain names) to JS NORM keys (OCEAN letters).
// Source: DOMAIN_MAP in role-scoring.js: { E: 'presence', A: 'bond', O: 'vision', C: 'discipline', N: 'depth' }
const PY_TO_JS_KEY = {
  presence: 'E',
  bond: 'A',
  vision: 'O',
  discipline: 'C',
  depth: 'N',
}

describe('Shared FE/BE role oracle', () => {
  it('NORM_MEAN and NORM_SD match oracle norm_assumptions', () => {
    for (const [pyKey, jsKey] of Object.entries(PY_TO_JS_KEY)) {
      const oracleDim = oracle.norm_assumptions[pyKey]
      expect(NORM_MEAN[jsKey]).toBe(oracleDim.mean)
      expect(NORM_SD[jsKey]).toBe(oracleDim.sd)
    }
  })

  oracle.cases.forEach((c) => {
    it(c.id, () => {
      // computeRole takes raw 1-5 scores with domain keys {presence, bond, vision, discipline, depth}
      // and returns {role, arc, probabilities}. Extract .role for the oracle check.
      const result = computeRole(c.scores)
      const code = typeof result === 'string' ? result : result.role
      expect(code).toBe(c.expected_role)
    })
  })
})
