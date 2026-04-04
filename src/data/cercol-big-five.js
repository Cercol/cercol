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
 * item.text is an object { en, ca } — render with:
 *   item.text[i18n.language] ?? item.text.en
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
    text: {
      en: 'Am the life of the party.',
      ca: "Soc l'animador/a de les festes.",
    },
    domain: 'extraversion',
    facet: 'sociability',
    reverse: false,
  },
  {
    id: 2,
    text: {
      en: "Don't talk a lot.",
      ca: 'No parle molt.',
    },
    domain: 'extraversion',
    facet: 'sociability',
    reverse: true,
  },

  // Facet: Assertiveness
  {
    id: 3,
    text: {
      en: 'Take charge.',
      ca: 'Prenga la iniciativa.',
    },
    domain: 'extraversion',
    facet: 'assertiveness',
    reverse: false,
  },
  {
    id: 4,
    text: {
      en: 'Wait for others to lead the way.',
      ca: 'Espere que altres prenguen la iniciativa.',
    },
    domain: 'extraversion',
    facet: 'assertiveness',
    reverse: true,
  },

  // Facet: Energy Level
  {
    id: 5,
    text: {
      en: 'Am always on the go.',
      ca: 'Sempre estic en moviment.',
    },
    domain: 'extraversion',
    facet: 'energyLevel',
    reverse: false,
  },
  {
    id: 6,
    text: {
      en: 'Like to take it easy.',
      ca: "M'agrada anar a poc a poc.",
    },
    domain: 'extraversion',
    facet: 'energyLevel',
    reverse: true,
  },

  // ── AGREEABLENESS ─────────────────────────────────────────────

  // Facet: Compassion
  {
    id: 7,
    text: {
      en: "Feel others' emotions.",
      ca: 'Sent les emocions dels altres.',
    },
    domain: 'agreeableness',
    facet: 'compassion',
    reverse: false,
  },
  {
    id: 8,
    text: {
      en: 'Am not really interested in others.',
      ca: "No m'interessen gaire els altres.",
    },
    domain: 'agreeableness',
    facet: 'compassion',
    reverse: true,
  },

  // Facet: Respectfulness
  {
    id: 9,
    text: {
      en: 'Respect others.',
      ca: 'Respecte els altres.',
    },
    domain: 'agreeableness',
    facet: 'respectfulness',
    reverse: false,
  },
  {
    id: 10,
    text: {
      en: 'Insult people.',
      ca: 'Insulte la gent.',
    },
    domain: 'agreeableness',
    facet: 'respectfulness',
    reverse: true,
  },

  // Facet: Trust
  {
    id: 11,
    text: {
      en: 'Trust others.',
      ca: 'Confie en els altres.',
    },
    domain: 'agreeableness',
    facet: 'trust',
    reverse: false,
  },
  {
    id: 12,
    text: {
      en: 'Suspect hidden motives in others.',
      ca: 'Sospite que els altres tenen motius ocults.',
    },
    domain: 'agreeableness',
    facet: 'trust',
    reverse: true,
  },

  // ── CONSCIENTIOUSNESS ─────────────────────────────────────────

  // Facet: Organization
  {
    id: 13,
    text: {
      en: 'Like order.',
      ca: "M'agrada l'ordre.",
    },
    domain: 'conscientiousness',
    facet: 'organization',
    reverse: false,
  },
  {
    id: 14,
    text: {
      en: 'Leave a mess in my room.',
      ca: 'Deixe la meua habitació desordenada.',
    },
    domain: 'conscientiousness',
    facet: 'organization',
    reverse: true,
  },

  // Facet: Productiveness
  {
    id: 15,
    text: {
      en: 'Work hard.',
      ca: 'Treballe molt.',
    },
    domain: 'conscientiousness',
    facet: 'productiveness',
    reverse: false,
  },
  {
    id: 16,
    text: {
      en: 'Put little time and effort into my work.',
      ca: 'Dedique poc temps i esforç a la meua feina.',
    },
    domain: 'conscientiousness',
    facet: 'productiveness',
    reverse: true,
  },

  // Facet: Responsibility
  {
    id: 17,
    text: {
      en: 'Keep my promises.',
      ca: 'Complesc les meues promeses.',
    },
    domain: 'conscientiousness',
    facet: 'responsibility',
    reverse: false,
  },
  {
    id: 18,
    text: {
      en: 'Break rules.',
      ca: 'Trenque les normes.',
    },
    domain: 'conscientiousness',
    facet: 'responsibility',
    reverse: true,
  },

  // ── NEGATIVE EMOTIONALITY ─────────────────────────────────────

  // Facet: Anxiety
  {
    id: 19,
    text: {
      en: 'Worry about things.',
      ca: 'Em preocupe per les coses.',
    },
    domain: 'negativeEmotionality',
    facet: 'anxiety',
    reverse: false,
  },
  {
    id: 20,
    text: {
      en: 'Am relaxed most of the time.',
      ca: 'Estic relaxat/da la major part del temps.',
    },
    domain: 'negativeEmotionality',
    facet: 'anxiety',
    reverse: true,
  },

  // Facet: Depression
  {
    id: 21,
    text: {
      en: 'Often feel blue.',
      ca: 'Sovint em sent trist/a.',
    },
    domain: 'negativeEmotionality',
    facet: 'depression',
    reverse: false,
  },
  {
    id: 22,
    text: {
      en: 'Feel comfortable with myself.',
      ca: 'Em sent còmode/a amb mi mateix/a.',
    },
    domain: 'negativeEmotionality',
    facet: 'depression',
    reverse: true,
  },

  // Facet: Emotional Volatility
  {
    id: 23,
    text: {
      en: 'Get angry easily.',
      ca: "M'enface fàcilment.",
    },
    domain: 'negativeEmotionality',
    facet: 'emotionalVolatility',
    reverse: false,
  },
  {
    id: 24,
    text: {
      en: 'Rarely get irritated.',
      ca: "Rarament m'irrite.",
    },
    domain: 'negativeEmotionality',
    facet: 'emotionalVolatility',
    reverse: true,
  },

  // ── OPEN-MINDEDNESS ───────────────────────────────────────────

  // Facet: Intellectual Curiosity
  {
    id: 25,
    text: {
      en: 'Am quick to understand things.',
      ca: 'Enténc les coses ràpidament.',
    },
    domain: 'openMindedness',
    facet: 'intellectualCuriosity',
    reverse: false,
  },
  {
    id: 26,
    text: {
      en: 'Have difficulty understanding abstract ideas.',
      ca: 'Tinc dificultat per entendre idees abstractes.',
    },
    domain: 'openMindedness',
    facet: 'intellectualCuriosity',
    reverse: true,
  },

  // Facet: Aesthetic Sensitivity
  {
    id: 27,
    text: {
      en: 'Believe in the importance of art.',
      ca: "Crec en la importància de l'art.",
    },
    domain: 'openMindedness',
    facet: 'aestheticSensitivity',
    reverse: false,
  },
  {
    id: 28,
    text: {
      en: 'Do not like art.',
      ca: "No m'agrada l'art.",
    },
    domain: 'openMindedness',
    facet: 'aestheticSensitivity',
    reverse: true,
  },

  // Facet: Creative Imagination
  {
    id: 29,
    text: {
      en: 'Have a vivid imagination.',
      ca: 'Tinc una imaginació molt viva.',
    },
    domain: 'openMindedness',
    facet: 'creativeImagination',
    reverse: false,
  },
  {
    id: 30,
    text: {
      en: 'Am not interested in theoretical discussions.',
      ca: "No m'interessen les discussions teòriques.",
    },
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
  sociability:           { label: 'Sociability',            domain: 'extraversion' },
  assertiveness:         { label: 'Assertiveness',          domain: 'extraversion' },
  energyLevel:           { label: 'Energy Level',           domain: 'extraversion' },
  compassion:            { label: 'Compassion',             domain: 'agreeableness' },
  respectfulness:        { label: 'Respectfulness',         domain: 'agreeableness' },
  trust:                 { label: 'Trust',                  domain: 'agreeableness' },
  organization:          { label: 'Organization',           domain: 'conscientiousness' },
  productiveness:        { label: 'Productiveness',         domain: 'conscientiousness' },
  responsibility:        { label: 'Responsibility',         domain: 'conscientiousness' },
  anxiety:               { label: 'Anxiety',                domain: 'negativeEmotionality' },
  depression:            { label: 'Depression',             domain: 'negativeEmotionality' },
  emotionalVolatility:   { label: 'Emotional Volatility',   domain: 'negativeEmotionality' },
  intellectualCuriosity: { label: 'Intellectual Curiosity', domain: 'openMindedness' },
  aestheticSensitivity:  { label: 'Aesthetic Sensitivity',  domain: 'openMindedness' },
  creativeImagination:   { label: 'Creative Imagination',   domain: 'openMindedness' },
}
