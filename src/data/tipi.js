/**
 * TIPI — Ten-Item Personality Inventory
 * Gosling, S. D., Rentfrow, P. J., & Swann, W. B., Jr. (2003).
 * A very brief measure of the Big Five personality domains.
 * Journal of Research in Personality, 37, 504–528.
 *
 * Response scale: 1 (Disagree strongly) → 7 (Agree strongly)
 * Items marked reverse: true must be reverse-scored before averaging.
 * Reverse score formula: reversedValue = 8 - rawValue
 */

export const TIPI_ITEMS = [
  {
    id: 1,
    text: 'Extraverted, enthusiastic.',
    dimension: 'extraversion',
    reverse: false,
  },
  {
    id: 2,
    text: 'Critical, quarrelsome.',
    dimension: 'agreeableness',
    reverse: true,
  },
  {
    id: 3,
    text: 'Dependable, self-disciplined.',
    dimension: 'conscientiousness',
    reverse: false,
  },
  {
    id: 4,
    text: 'Anxious, easily upset.',
    dimension: 'neuroticism',
    reverse: false,
  },
  {
    id: 5,
    text: 'Open to new experiences, complex.',
    dimension: 'openness',
    reverse: false,
  },
  {
    id: 6,
    text: 'Reserved, quiet.',
    dimension: 'extraversion',
    reverse: true,
  },
  {
    id: 7,
    text: 'Sympathetic, warm.',
    dimension: 'agreeableness',
    reverse: false,
  },
  {
    id: 8,
    text: 'Disorganized, careless.',
    dimension: 'conscientiousness',
    reverse: true,
  },
  {
    id: 9,
    text: 'Calm, emotionally stable.',
    dimension: 'neuroticism',
    reverse: true,
  },
  {
    id: 10,
    text: 'Conventional, uncreative.',
    dimension: 'openness',
    reverse: true,
  },
]

/** Likert scale anchor labels */
export const SCALE_LABELS = {
  1: 'Disagree strongly',
  2: 'Disagree moderately',
  3: 'Disagree a little',
  4: 'Neither agree nor disagree',
  5: 'Agree a little',
  6: 'Agree moderately',
  7: 'Agree strongly',
}

/** Human-readable dimension labels and short descriptions */
export const DIMENSION_META = {
  openness: {
    label: 'Openness',
    description: 'Curiosity, creativity, and openness to new experiences.',
    color: 'openness',
  },
  conscientiousness: {
    label: 'Conscientiousness',
    description: 'Organization, dependability, and self-discipline.',
    color: 'conscientiousness',
  },
  extraversion: {
    label: 'Extraversion',
    description: 'Sociability, assertiveness, and positive emotionality.',
    color: 'extraversion',
  },
  agreeableness: {
    label: 'Agreeableness',
    description: 'Compassion, cooperativeness, and trust in others.',
    color: 'agreeableness',
  },
  neuroticism: {
    label: 'Neuroticism',
    description: 'Tendency toward negative emotions and emotional instability.',
    color: 'neuroticism',
  },
}
