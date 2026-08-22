/**
 * TIPI — Ten-Item Personality Inventory
 * Gosling, S. D., Rentfrow, P. J., & Swann, W. B., Jr. (2003).
 * A very brief measure of the Big Five personality domains.
 * Journal of Research in Personality, 37, 504–528.
 *
 * Response scale: 1 (Disagree strongly) → 7 (Agree strongly)
 * Items marked reverse: true must be reverse-scored before averaging.
 * Reverse score formula: reversedValue = 8 - rawValue
 *
 * item.text is an object { en, ca } — render with:
 *   item.text[i18n.language] ?? item.text.en
 */

export const TIPI_ITEMS = [
  {
    id: 1,
    text: {
      en: 'Extraverted, enthusiastic.',
      ca: 'Extravertit/da, entusiasta.',
      es: 'Extravertido/a, entusiasta.',
      fr: 'Extraverti·e, enthousiaste.',
      de: 'Extrovertiert, enthusiastisch.',
      da: 'Ekstrovert, entusiastisk.',
    },
    dimension: 'extraversion',
    reverse: false,
  },
  {
    id: 2,
    text: {
      en: 'Critical, quarrelsome.',
      ca: 'Crític/a, discutidor/a.',
      es: 'Crítico/a, pendenciero/a.',
      fr: 'Critique, querelleur·se.',
      de: 'Kritisch, streitsüchtig.',
      da: 'Kritisk, stridbar.',
    },
    dimension: 'agreeableness',
    reverse: true,
  },
  {
    id: 3,
    text: {
      en: 'Dependable, self-disciplined.',
      ca: 'De confiança, autodisciplinat/da.',
      es: 'Responsable, autodisciplinado/a.',
      fr: 'Fiable, autodiscipliné·e.',
      de: 'Zuverlässig, selbstdiszipliniert.',
      da: 'Pålidelig, selvdisciplineret.',
    },
    dimension: 'conscientiousness',
    reverse: false,
  },
  {
    id: 4,
    text: {
      en: 'Anxious, easily upset.',
      ca: "Ansiós/osa, que s'altera fàcilment.",
      es: 'Ansioso/a, que se altera fácilmente.',
      fr: 'Anxieux·se, facilement contrarié·e.',
      de: 'Ängstlich, leicht aufzuregen.',
      da: 'Ængstelig, bliver let oprevet.',
    },
    dimension: 'neuroticism',
    reverse: false,
  },
  {
    id: 5,
    text: {
      en: 'Open to new experiences, complex.',
      ca: 'Obert/a a noves experiències, complex/a.',
      es: 'Abierto/a a nuevas experiencias, complejo/a.',
      fr: 'Ouvert·e aux nouvelles expériences, complexe.',
      de: 'Offen für neue Erfahrungen, komplex.',
      da: 'Åben over for nye oplevelser, sammensat.',
    },
    dimension: 'openness',
    reverse: false,
  },
  {
    id: 6,
    text: {
      en: 'Reserved, quiet.',
      ca: 'Reservat/da, callat/da.',
      es: 'Reservado/a, tranquilo/a.',
      fr: 'Réservé·e, peu bavard·e.',
      de: 'Reserviert, ruhig.',
      da: 'Reserveret, stille.',
    },
    dimension: 'extraversion',
    reverse: true,
  },
  {
    id: 7,
    text: {
      en: 'Sympathetic, warm.',
      ca: 'Compassiu/iva, càlid/a.',
      es: 'Empático/a, cálido/a.',
      fr: 'Compatissant·e, chaleureux·se.',
      de: 'Einfühlsam, warmherzig.',
      da: 'Medfølende, varm.',
    },
    dimension: 'agreeableness',
    reverse: false,
  },
  {
    id: 8,
    text: {
      en: 'Disorganized, careless.',
      ca: 'Desorganitzat/da, descurat/da.',
      es: 'Desorganizado/a, descuidado/a.',
      fr: 'Désorganisé·e, négligent·e.',
      de: 'Unorganisiert, nachlässig.',
      da: 'Uorganiseret, skødesløs.',
    },
    dimension: 'conscientiousness',
    reverse: true,
  },
  {
    id: 9,
    text: {
      en: 'Calm, emotionally stable.',
      ca: 'Tranquil/il·la, emocionalment estable.',
      es: 'Tranquilo/a, emocionalmente estable.',
      fr: 'Calme, émotionnellement stable.',
      de: 'Ruhig, emotional stabil.',
      da: 'Rolig, følelsesmæssigt stabil.',
    },
    dimension: 'neuroticism',
    reverse: true,
  },
  {
    id: 10,
    text: {
      en: 'Conventional, uncreative.',
      ca: 'Convencional, poc creatiu/va.',
      es: 'Convencional, poco creativo/a.',
      fr: 'Conventionnel·le, peu créatif·ve.',
      de: 'Konventionell, wenig kreativ.',
      da: 'Konventionel, ukreativ.',
    },
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

