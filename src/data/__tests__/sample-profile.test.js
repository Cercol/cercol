/**
 * /sample is the page a sceptic opens before deciding to spend twenty
 * minutes, so the profile behind it has to survive being read closely.
 *
 * Until 2026-08-22 it was five domain scores on the 1–7 New Moon scale while
 * the page computed a Full Moon role from them and rendered half the report.
 */
import { describe, it, expect } from 'vitest'

import { SAMPLE_FM_FACETS, SAMPLE_FM_DOMAINS, SAMPLE_WITNESS_DOMAINS, SAMPLE_MAX_SCORE, domainsFromFacets } from '../sample-profile'
import { FM_DOMAIN_META } from '../full-moon'
import { computeRole } from '../../utils/role-scoring'
import { compareRoleViews } from '../../utils/witness-scoring'

const DOMAINS = Object.keys(FM_DOMAIN_META)

describe('the sample profile', () => {
  it('has all thirty facets, one per facet the instrument defines', () => {
    const expected = DOMAINS.flatMap((d) => FM_DOMAIN_META[d].facets)
    expect(expected).toHaveLength(30)
    expect(Object.keys(SAMPLE_FM_FACETS).sort()).toEqual([...expected].sort())
  })

  it('sits on the instrument scale, not the New Moon one', () => {
    expect(SAMPLE_MAX_SCORE).toBe(5)
    for (const [k, v] of Object.entries(SAMPLE_FM_FACETS)) {
      expect(v, k).toBeGreaterThanOrEqual(1)
      expect(v, k).toBeLessThanOrEqual(5)
    }
  })

  it('derives every domain from its own facets, so the two cannot disagree', () => {
    expect(SAMPLE_FM_DOMAINS).toEqual(domainsFromFacets(SAMPLE_FM_FACETS))
    for (const d of DOMAINS) {
      const keys = FM_DOMAIN_META[d].facets
      const mean = keys.reduce((s, k) => s + SAMPLE_FM_FACETS[k], 0) / keys.length
      expect(SAMPLE_FM_DOMAINS[d], d).toBeCloseTo(mean, 1)
    }
  })

  it('is a person rather than a caricature of one role', () => {
    const { role, probabilities } = computeRole(SAMPLE_FM_DOMAINS, 'fullMoon')
    expect(role).toBeTruthy()
    // A profile that lands on one role at 90% teaches nothing about the
    // twelve, and looks fabricated to anyone who knows the model.
    expect(probabilities[role]).toBeLessThan(0.7)
    expect(probabilities[role]).toBeGreaterThan(0.12)
  })

  it('gives the Witness view something to disagree about', () => {
    const self = computeRole(SAMPLE_FM_DOMAINS, 'fullMoon')
    const witness = computeRole(SAMPLE_WITNESS_DOMAINS, 'fullMoon')
    const cmp = compareRoleViews(self, witness)
    // The surprises panel is the argument for the whole Witness instrument.
    // A sample where self and peers agree perfectly renders it empty.
    expect(cmp.surprises.length).toBeGreaterThan(0)
  })

  it('makes the self and peer views differ the way they actually do', () => {
    // Others read behaviour, the self reads internal states: anxiety and
    // self-consciousness are largely invisible from outside.
    expect(SAMPLE_WITNESS_DOMAINS.depth).toBeLessThan(SAMPLE_FM_DOMAINS.depth)
    expect(SAMPLE_WITNESS_DOMAINS.presence).toBeGreaterThan(SAMPLE_FM_DOMAINS.presence)
  })
})
