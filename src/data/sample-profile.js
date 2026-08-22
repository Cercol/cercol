/**
 * The synthetic profile behind /sample.
 *
 * # Spec: docs/architecture/frontend.md
 *
 * Until 2026-08-22 this file held five domain scores on a 1–7 scale, which is
 * a New Moon profile, while the page around it computed a role as if it were
 * Full Moon and rendered four of the eight sections the real Full Moon report
 * has. Someone opening /sample to decide whether to spend twenty minutes saw
 * a report shorter than the two-minute one.
 *
 * So: a complete Full Moon profile, on the instrument's own 1–5 scale.
 *
 * The domains are NOT written here. They are derived from the facets by the
 * same mean the real scorer uses, so the two can never disagree. A sample
 * whose facets contradict its domains is the one thing a psychometrician
 * would notice immediately, and this page exists to be read by exactly those
 * people.
 *
 * The person: high Discipline and Vision, moderate Bond, Presence pulled down
 * by low Gather and Thrill while Hearth and Drive stay high, and low Depth
 * with the exception of Vigil and Veil. A quiet, diligent, imaginative person
 * who is warm one-to-one and does not enjoy a crowd. Coherent, common, and
 * not a caricature of any single role.
 *
 * The Witness view differs the way self and peer ratings actually differ in
 * the literature: others read behaviour, the self reads internal states. The
 * witnesses see more Presence than is felt, and much less Depth, because
 * anxiety and self-consciousness are largely invisible from outside. That
 * asymmetry is the whole argument for the Witness instrument, so the sample
 * should demonstrate it rather than describe it.
 */

import { FM_DOMAIN_META } from './full-moon'

/** Facet scores on the Full Moon scale, 1–5. Thirty of them, six per domain. */
export const SAMPLE_FM_FACETS = {
  // Presence — warm and driven, but not gregarious and not thrill-seeking
  hearth: 4.0, gather: 2.5, command: 3.5, drive: 4.0, thrill: 2.2, radiance: 3.2,
  // Bond — cooperative, with a real edge and little deference
  faith: 3.8, edge: 4.2, gift: 3.5, yield: 2.8, shadow: 3.0, shield: 4.0,
  // Discipline — the strongest domain, and evenly so
  mastery: 4.5, structure: 4.2, oath: 4.4, quest: 4.0, will: 3.8, counsel: 3.6,
  // Depth — low overall, but the inward facets are not
  vigil: 3.4, blaze: 2.0, hollow: 2.2, veil: 3.6, surge: 2.5, fracture: 2.4,
  // Vision — craft and prism carry it
  dream: 4.2, craft: 4.6, resonance: 3.8, drift: 3.0, prism: 4.4, compass: 3.9,
}

/** Domain score = mean of its six facets, one decimal. The scorer's own rule. */
export function domainsFromFacets(facets, meta = FM_DOMAIN_META) {
  return Object.fromEntries(
    Object.entries(meta).map(([domain, { facets: keys }]) => {
      const mean = keys.reduce((sum, k) => sum + facets[k], 0) / keys.length
      return [domain, Math.round(mean * 10) / 10]
    }),
  )
}

export const SAMPLE_FM_DOMAINS = domainsFromFacets(SAMPLE_FM_FACETS)

/**
 * What four Witnesses saw, averaged. Deliberately not a copy of the self
 * view: Presence reads higher from outside, Depth reads much lower.
 */
export const SAMPLE_WITNESS_DOMAINS = {
  presence: 3.7,
  bond: 3.8,
  discipline: 4.2,
  depth: 2.1,
  vision: 4.0,
}

export const SAMPLE_WITNESS_COUNT = 4

export const SAMPLE_MAX_SCORE = 5

// Kept for the New Moon radar, which reads a 1–7 profile. The old export name
// stays so nothing that imported it breaks.
export const SAMPLE_SCORES = SAMPLE_FM_DOMAINS
