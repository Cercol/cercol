/**
 * Which variety of a language an instrument is answered in.
 *
 * # Spec: docs/policies/dataset-versions.md
 *
 * The published translations Cèrcol uses are not written in one variety per
 * language. Gravel's French is Canadian; the Spanish IPIP-NEO-120 is Mexican.
 * Both are the real thing, and both were taken verbatim, which is the whole
 * reason they are trustworthy. Choosing between "publish someone else's
 * dialect to every reader" and "edit a published instrument until it stops
 * being one" is a false choice: the answer is to keep the source intact and
 * say which variety it is.
 *
 * So the interface stays one language — a French reader reads French — and the
 * instrument declares its variety, with a choice where more than one exists.
 *
 * Each variant names its source. A variant marked `published` is a
 * publisher's text used as published. A variant marked `adapted` is derived
 * from one, and the entry says from what and by whom, because that is the
 * difference between a translation you can point at and one you have to
 * defend.
 */

export const VARIANTS = {
  fr: [
    {
      code: 'fr-FR',
      label: 'Français (Europe)',
      provenance: 'adapted',
      source: "Adapted from Gravel's French-Canadian IPIP-NEO-300 for European French, the way Thiry & Piolti (University of Mons, 2023) describe adapting it. Their item list is not published, so this adaptation is Cèrcol's.",
    },
    {
      code: 'fr-CA',
      label: 'Français (Canada)',
      provenance: 'published',
      source: 'Mathew Gravel, Université du Québec à Chicoutimi. French translation of the IPIP-NEO-300, hosted at ipip.ori.org/FrenchCanadian300-Item-IPIP-NEO.htm. Used as published.',
    },
  ],
  es: [
    {
      code: 'es-MX',
      label: 'Español (México)',
      provenance: 'published',
      source: 'David R. Frez Puente and Leticia Ortega Luque. Spanish (Mexican) translation of the IPIP-NEO-120, hosted at ipip.ori.org/MexicanIPIP-NEO-120.htm. Used as published.',
    },
  ],
}

/** The variety a reader of this language gets unless they pick another. */
export const DEFAULT_VARIANT = { fr: 'fr-FR', es: 'es-MX' }

/** Every variant code, flattened. */
export const VARIANT_CODES = Object.values(VARIANTS).flat().map((v) => v.code)

/** The variants a reader of `language` may choose between, or an empty list. */
export function variantsFor(language) {
  const base = String(language || 'en').slice(0, 2)
  const list = VARIANTS[base] || []
  return list.length > 1 ? list : []
}

/** The variant code in force for a reader, given what they chose. */
export function activeVariant(language, chosen) {
  const base = String(language || 'en').slice(0, 2)
  const list = VARIANTS[base] || []
  if (chosen && list.some((v) => v.code === chosen)) return chosen
  return DEFAULT_VARIANT[base] || base
}

/**
 * The text of one item for one reader.
 *
 * Variant first, then the bare language for the languages that have only one
 * variety, then English. The English fallback is deliberate and visible: an
 * item with no translation shows in English rather than in an invented
 * sentence, which is the failure this whole area exists to avoid.
 */
export function itemText(text, language, chosen) {
  if (typeof text !== 'object' || text === null) return text
  const base = String(language || 'en').slice(0, 2)
  const active = activeVariant(language, chosen)
  if (text[active] != null) return text[active]
  // Then the language's other varieties, in the order they are declared. An
  // adapted variant only stores the strings it actually changes, so the rest
  // fall through to the published text it was adapted from. That keeps the
  // data file showing the difference rather than a second full copy.
  for (const v of VARIANTS[base] || []) {
    if (text[v.code] != null) return text[v.code]
  }
  return text[base] ?? text.en
}

/** What to record with a result: the variety it was actually answered in. */
export function answeredIn(language, chosen) {
  return activeVariant(language, chosen)
}

/**
 * The strings that are Cèrcol's rather than the publisher's.
 *
 * Danish is Vedel's and Spanish is Frez Puente and Ortega Luque's, both used
 * as published. But both translated the IPIP-NEO-120, and Cèrcol's short form
 * is the IPIP-NEO-60, which contains items the 120 does not. Nobody ever
 * translated those, so they are written here, to match each publisher's hand,
 * and listed so that "this is Vedel's Danish" stays a true sentence with a
 * known exception rather than a slightly false one.
 *
 * They are the first thing to replace if either publisher supplies them, and
 * the letters in the plan ask.
 */
export const CERCOL_SUPPLIED = {
  da: [
    'Am easily intimidated.',
    'Am calm even in tense situations.',
    'Act comfortably with others.',
    'Am not easily affected by my emotions.',
    'Don\u2019t like the idea of change.',
    'Believe in one true religion.',
    'Set high standards for myself and others.',
  ],
  'es-MX': [
    'Am easily intimidated.',
    'Am calm even in tense situations.',
    'Act comfortably with others.',
    'Am not easily affected by my emotions.',
    'Don\u2019t like the idea of change.',
    'Believe in one true religion.',
    'Set high standards for myself and others.',
    // Not in the 120 either, but for a different reason: their page carries a
    // different item at that position, "feel others' concerns".
    "Feel others' emotions.",
    // And this one is a correction, not a gap. Their English reads "Make rush
    // decisions", a typo for "rash", and their Spanish follows it: "Tomo
    // decisiones rápidas" is fast, not rash. Copying a published string is the
    // rule; copying a construct error because it is published is not.
    'Make rash decisions.',
  ],
}
