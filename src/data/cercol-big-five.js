/**
 * Cèrcol Big Five Assessment
 *
 * 30 items selected from the International Personality Item Pool (IPIP).
 * IPIP items are in the public domain with no restrictions on use.
 * Source: https://ipip.ori.org
 *
 * Facet structure mirrors BFI-2 (Soto & John, 2017) for comparability:
 * 5 domains × 3 facets × 2 items = 30 items.
 *
 * Item selection methodology:
 * Items chosen by highest confirmed factor loadings per facet,
 * consistent with Johnson (2014) IPIP-NEO-120 and
 * Buchanan & Hegarty (2023) NFFPS-30.
 * Each facet contains 1 positively keyed and 1 negatively keyed item
 * to control for acquiescence bias.
 *
 * Scale: 1 (Disagree strongly) → 5 (Agree strongly)
 * Reverse-scored items: score = 6 - rawValue
 *
 * References:
 * - Goldberg et al. (2006). doi:10.1177/1073191106293419
 * - Johnson, J.A. (2014). J. Research in Personality, 51, 78-89.
 * - Buchanan & Hegarty (2023). NovoPsych NFFPS-30.
 */

export const CBF_ITEMS = [

  // ── EXTRAVERSION ──────────────────────────────────────────────

  // Facet: Sociability
  {
    id: 1,
    text: 'Am the life of the party.',
    domain: 'extraversion',
    facet: 'sociability',
    reverse: false,
  },
  {
    id: 2,
    text: "Don't talk a lot.",
    domain: 'extraversion',
    facet: 'sociability',
    reverse: true,
  },

  // Facet: Assertiveness
  {
    id: 3,
    text: 'Take charge.',
    domain: 'extraversion',
    facet: 'assertiveness',
    reverse: false,
  },
  {
    id: 4,
    text: 'Wait for others to lead the way.',
    domain: 'extraversion',
    facet: 'assertiveness',
    reverse: true,
  },

  // Facet: Energy Level
  {
    id: 5,
    text: 'Am always on the go.',
    domain: 'extraversion',
    facet: 'energyLevel',
    reverse: false,
  },
  {
    id: 6,
    text: 'Like to take it easy.',
    domain: 'extraversion',
    facet: 'energyLevel',
    reverse: true,
  },

  // ── AGREEABLENESS ─────────────────────────────────────────────

  // Facet: Compassion
  {
    id: 7,
    text: "Feel others' emotions.",
    domain: 'agreeableness',
    facet: 'compassion',
    reverse: false,
  },
  {
    id: 8,
    text: 'Am not really interested in others.',
    domain: 'agreeableness',
    facet: 'compassion',
    reverse: true,
  },

  // Facet: Respectfulness
  {
    id: 9,
    text: 'Respect others.',
    domain: 'agreeableness',
    facet: 'respectfulness',
    reverse: false,
  },
  {
    id: 10,
    text: 'Insult people.',
    domain: 'agreeableness',
    facet: 'respectfulness',
    reverse: true,
  },

  // Facet: Trust
  {
    id: 11,
    text: 'Trust others.',
    domain: 'agreeableness',
    facet: 'trust',
    reverse: false,
  },
  {
    id: 12,
    text: 'Suspect hidden motives in others.',
    domain: 'agreeableness',
    facet: 'trust',
    reverse: true,
  },

  // ── CONSCIENTIOUSNESS ─────────────────────────────────────────

  // Facet: Organization
  {
    id: 13,
    text: 'Like order.',
    domain: 'conscientiousness',
    facet: 'organization',
    reverse: false,
  },
  {
    id: 14,
    text: 'Leave a mess in my room.',
    domain: 'conscientiousness',
    facet: 'organization',
    reverse: true,
  },

  // Facet: Productiveness
  {
    id: 15,
    text: 'Work hard.',
    domain: 'conscientiousness',
    facet: 'productiveness',
    reverse: false,
  },
  {
    id: 16,
    text: 'Put little time and effort into my work.',
    domain: 'conscientiousness',
    facet: 'productiveness',
    reverse: true,
  },

  // Facet: Responsibility
  {
    id: 17,
    text: 'Keep my promises.',
    domain: 'conscientiousness',
    facet: 'responsibility',
    reverse: false,
  },
  {
    id: 18,
    text: 'Break rules.',
    domain: 'conscientiousness',
    facet: 'responsibility',
    reverse: true,
  },

  // ── NEGATIVE EMOTIONALITY ─────────────────────────────────────

  // Facet: Anxiety
  {
    id: 19,
    text: 'Worry about things.',
    domain: 'negativeEmotionality',
    facet: 'anxiety',
    reverse: false,
  },
  {
    id: 20,
    text: 'Am relaxed most of the time.',
    domain: 'negativeEmotionality',
    facet: 'anxiety',
    reverse: true,
  },

  // Facet: Depression
  {
    id: 21,
    text: 'Often feel blue.',
    domain: 'negativeEmotionality',
    facet: 'depression',
    reverse: false,
  },
  {
    id: 22,
    text: 'Feel comfortable with myself.',
    domain: 'negativeEmotionality',
    facet: 'depression',
    reverse: true,
  },

  // Facet: Emotional Volatility
  {
    id: 23,
    text: 'Get angry easily.',
    domain: 'negativeEmotionality',
    facet: 'emotionalVolatility',
    reverse: false,
  },
  {
    id: 24,
    text: 'Rarely get irritated.',
    domain: 'negativeEmotionality',
    facet: 'emotionalVolatility',
    reverse: true,
  },

  // ── OPEN-MINDEDNESS ───────────────────────────────────────────

  // Facet: Intellectual Curiosity
  {
    id: 25,
    text: 'Am quick to understand things.',
    domain: 'openMindedness',
    facet: 'intellectualCuriosity',
    reverse: false,
  },
  {
    id: 26,
    text: 'Have difficulty understanding abstract ideas.',
    domain: 'openMindedness',
    facet: 'intellectualCuriosity',
    reverse: true,
  },

  // Facet: Aesthetic Sensitivity
  {
    id: 27,
    text: 'Believe in the importance of art.',
    domain: 'openMindedness',
    facet: 'aestheticSensitivity',
    reverse: false,
  },
  {
    id: 28,
    text: 'Do not like art.',
    domain: 'openMindedness',
    facet: 'aestheticSensitivity',
    reverse: true,
  },

  // Facet: Creative Imagination
  {
    id: 29,
    text: 'Have a vivid imagination.',
    domain: 'openMindedness',
    facet: 'creativeImagination',
    reverse: false,
  },
  {
    id: 30,
    text: 'Am not interested in theoretical discussions.',
    domain: 'openMindedness',
    facet: 'creativeImagination',
    reverse: true,
  },
]

export const SCALE_LABELS = {
  1: 'Disagree strongly',
  2: 'Disagree a little',
  3: 'Neither agree nor disagree',
  4: 'Agree a little',
  5: 'Agree strongly',
}

export const DOMAIN_META = {
  extraversion: {
    label: 'Extraversion',
    description: 'Sociability, assertiveness, and energy in social situations.',
    facets: ['sociability', 'assertiveness', 'energyLevel'],
  },
  agreeableness: {
    label: 'Agreeableness',
    description: 'Compassion, cooperativeness, and trust toward others.',
    facets: ['compassion', 'respectfulness', 'trust'],
  },
  conscientiousness: {
    label: 'Conscientiousness',
    description: 'Organization, productivity, and sense of responsibility.',
    facets: ['organization', 'productiveness', 'responsibility'],
  },
  negativeEmotionality: {
    label: 'Negative Emotionality',
    description: 'Tendency toward anxiety, low mood, and emotional reactivity.',
    facets: ['anxiety', 'depression', 'emotionalVolatility'],
  },
  openMindedness: {
    label: 'Open-Mindedness',
    description: 'Curiosity, creativity, and appreciation for ideas and beauty.',
    facets: ['intellectualCuriosity', 'aestheticSensitivity', 'creativeImagination'],
  },
}

export const FACET_META = {
  sociability:          { label: 'Sociability',            domain: 'extraversion' },
  assertiveness:        { label: 'Assertiveness',          domain: 'extraversion' },
  energyLevel:          { label: 'Energy Level',           domain: 'extraversion' },
  compassion:           { label: 'Compassion',             domain: 'agreeableness' },
  respectfulness:       { label: 'Respectfulness',         domain: 'agreeableness' },
  trust:                { label: 'Trust',                  domain: 'agreeableness' },
  organization:         { label: 'Organization',           domain: 'conscientiousness' },
  productiveness:       { label: 'Productiveness',         domain: 'conscientiousness' },
  responsibility:       { label: 'Responsibility',         domain: 'conscientiousness' },
  anxiety:              { label: 'Anxiety',                domain: 'negativeEmotionality' },
  depression:           { label: 'Depression',            domain: 'negativeEmotionality' },
  emotionalVolatility:  { label: 'Emotional Volatility',   domain: 'negativeEmotionality' },
  intellectualCuriosity:{ label: 'Intellectual Curiosity', domain: 'openMindedness' },
  aestheticSensitivity: { label: 'Aesthetic Sensitivity',  domain: 'openMindedness' },
  creativeImagination:  { label: 'Creative Imagination',   domain: 'openMindedness' },
}