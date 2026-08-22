/**
 * BlogTestCTA — the bridge from an article to an instrument.
 *
 * Two variants, and they no longer send the reader to the same place:
 *
 *   compact — a slim card early in the article, linking to New Moon
 *             Cercol (/new-moon): ten items, two minutes, no account.
 *   full    — the end-of-article card, linking to First Quarter Cercol
 *             (/first-quarter): sixty items, thirty facets, also free and
 *             also no account.
 *
 * The split matches commitment to what the reader has already shown. Someone
 * who reached the end of a three thousand word article has demonstrated more
 * of it than someone two screens in, and First Quarter is the instrument that
 * returns a profile worth having: New Moon is a screener that the ranking
 * article itself describes as an orientation rather than a profile, and the
 * population norms it feeds are the least useful ones we hold. This is a
 * hypothesis about reader intent, not a measured result, and it is one prop
 * away from being reverted.
 *
 * Uses Card + SectionLabel from the ui kit. The action is a real <Link>
 * (crawlable, and lets the reader land on the test directly) styled like the
 * primary Button; the Button primitive renders a <button> and cannot carry an
 * href, so the primary-variant token classes are reused here on the Link.
 *
 * Copy uses Cercol product vocabulary only (never academic instrument names),
 * which is why the dimension headings below name Depth and Vision rather than
 * Neuroticism and Openness even though the slugs they match do the opposite.
 */
import { Link } from 'react-router-dom'
import { Card, SectionLabel, DisplayHeading } from './ui'
import { navHref } from '../lib/navigation'
import { trackEvent } from '../lib/api'

// Localized copy. es/fr/de/da are flagged for human review in the PR.
const COPY = {
  en: { h: 'See yourself in five dimensions.', b: 'Start the free test', s: 'See a sample report', deepP: 'Sixty items, about ten minutes. Five dimensions and 30 facets. Free, no account.', deepB: 'Start the 60-item test' },
  ca: { h: "Mira't en cinc dimensions.", b: 'Comença el test gratuït', s: "Mira un informe d'exemple", deepP: 'Seixanta ítems, uns deu minuts. Cinc dimensions i 30 facetes. Gratuït, sense compte.', deepB: 'Comença el test de 60 ítems' },
  es: { h: 'Mírate en cinco dimensiones.', b: 'Empieza el test gratis', s: 'Ver un informe de ejemplo', deepP: 'Sesenta ítems, unos diez minutos. Cinco dimensiones y 30 facetas. Gratis, sin cuenta.', deepB: 'Empieza el test de 60 ítems' },
  fr: { h: 'Découvrez-vous en cinq dimensions.', b: 'Commencer le test gratuit', s: "Voir un rapport d'exemple", deepP: 'Soixante items, une dizaine de minutes. Cinq dimensions et 30 facettes. Gratuit, sans compte.', deepB: 'Commencer le test de 60 items' },
  de: { h: 'Sieh dich in fünf Dimensionen.', b: 'Kostenlosen Test starten', s: 'Beispielbericht ansehen', deepP: 'Sechzig Items, etwa zehn Minuten. Fünf Dimensionen und 30 Facetten. Kostenlos, ohne Konto.', deepB: 'Test mit 60 Items starten' },
  da: { h: 'Se dig selv i fem dimensioner.', b: 'Start den gratis test', s: 'Se en eksempelrapport', deepP: '60 items, omkring ti minutter. Fem dimensioner og 30 facetter. Gratis, uden konto.', deepB: 'Start testen med 60 items' },
}

// Optional category-specific heading override. Localized to all six languages.
// Outranked by a dimension match, and falling back to the generic
// COPY[lang].h. The body copy and the button label stay generic either way.
const CATEGORY_H = {
  teams: {
    en: "See how you shift a team's balance.", ca: "Mira com mous l'equilibri d'un equip.",
    es: 'Mira cómo cambias el equilibrio de un equipo.', fr: "Voyez comment vous modifiez l'équilibre d'une équipe.",
    de: 'Sieh, wie du das Gleichgewicht eines Teams verschiebst.', da: 'Se, hvordan du ændrer et teams balance.',
  },
  work: {
    en: 'See how you show up at work.', ca: 'Mira com et mostres a la feina.',
    es: 'Mira cómo te muestras en el trabajo.', fr: 'Voyez comment vous vous comportez au travail.',
    de: 'Sieh, wie du dich bei der Arbeit zeigst.', da: 'Se, hvordan du fremstår på arbejdet.',
  },
  leadership: {
    en: 'See your own leadership profile.', ca: 'Mira el teu perfil de lideratge.',
    es: 'Mira tu propio perfil de liderazgo.', fr: 'Découvrez votre propre profil de leadership.',
    de: 'Sieh dein eigenes Führungsprofil.', da: 'Se din egen lederprofil.',
  },
}

/**
 * Slug patterns that identify the dimension an article is about, in the order
 * they are tested. Slugs are English and SEO-shaped, so they carry the
 * academic name; the heading that results carries the Cercol one.
 *
 * Order matters where a slug names two: "conscientiousness-perfectionism-when
 * -discipline-becomes-a-problem" is a Discipline article and must not be read
 * as anything else.
 */
const SLUG_DIMENSION = [
  [/conscientious/, 'discipline'],
  [/agreeable/, 'bond'],
  [/neurotic|emotional-stability/, 'depth'],
  [/openness|open-to-experience/, 'vision'],
  [/extraver|introver/, 'presence'],
]

/**
 * Cercol dimension names per language, mirroring the `domains.*.label` keys in
 * src/locales/*.json. Duplicated rather than imported because this component
 * takes an explicit `lang` from the article URL instead of reading the i18n
 * instance. BlogTestCTA.test.js asserts the two stay identical.
 */
const DIMENSION_LABEL = {
  presence:   { en: 'Presence',   ca: 'Presència',   es: 'Presencia',  fr: 'Présence',  de: 'Präsenz',  da: 'Tilstedeværelse' },
  bond:       { en: 'Bond',       ca: 'Vincle',      es: 'Vínculo',    fr: 'Lien',      de: 'Bindung',  da: 'Tilknytning' },
  discipline: { en: 'Discipline', ca: 'Disciplina',  es: 'Disciplina', fr: 'Discipline', de: 'Disziplin', da: 'Disciplin' },
  depth:      { en: 'Depth',      ca: 'Profunditat', es: 'Profundidad', fr: 'Profondeur', de: 'Tiefe',   da: 'Dybde' },
  vision:     { en: 'Vision',     ca: 'Visió',       es: 'Visión',     fr: 'Vision',    de: 'Vision',   da: 'Vision' },
}

/**
 * Articles about facets rather than about one dimension.
 *
 * "What is a facet?" took twelve reads in a day and sent nobody to an
 * instrument. No dimension pattern matches its slug, so the card offered
 * "See yourself in five dimensions" to a reader who had just finished
 * learning that facets are the finer grain underneath those five: strictly
 * less than what they came for. First Quarter returns exactly thirty of
 * them, so the card can promise the thing by name.
 */
const FACET_SLUG = /facet|aspect-scales|nuance/

const FACET_H = {
  en: 'See your own 30 facets.',
  ca: 'Mira les teues 30 facetes.',
  es: 'Mira tus propias 30 facetas.',
  fr: 'Découvrez vos 30 facettes.',
  de: 'Sieh deine eigenen 30 Facetten.',
  da: 'Se dine egne 30 facetter.',
}

// Heading template per language. {d} is the localized dimension name.
const DIMENSION_H = {
  en: 'See your own {d} score.',
  ca: 'Mira la teua puntuació de {d}.',
  es: 'Mira tu propia puntuación de {d}.',
  fr: 'Découvrez votre propre score de {d}.',
  de: 'Sieh deinen eigenen {d}-Wert.',
  da: 'Se din egen {d}-score.',
}

/** The Cercol dimension key an article slug is about, or null. */
export function dimensionForSlug(slug) {
  if (!slug) return null
  for (const [pattern, key] of SLUG_DIMENSION) {
    if (pattern.test(slug)) return key
  }
  return null
}

export default function BlogTestCTA({ slug, lang = 'en', category, compact = false }) {
  const c = COPY[lang] || COPY.en
  const l = COPY[lang] ? lang : 'en'

  // A dimension article gets the most specific heading available: the reader
  // arrived asking what one dimension is, so offer that dimension's score
  // rather than a generic five-dimension snapshot.
  const dimension = dimensionForSlug(slug)
  const dimensionHeading = dimension
    ? DIMENSION_H[l].replace('{d}', DIMENSION_LABEL[dimension][l])
    : null
  // A dimension match wins: an article about one dimension's facets is still
  // best answered with that dimension's score.
  const facetHeading = !dimension && slug && FACET_SLUG.test(slug) ? FACET_H[l] : null
  const heading = dimensionHeading || facetHeading || CATEGORY_H[category]?.[l] || c.h

  // The end-of-article card sends the reader to the longer instrument; the
  // early one keeps the two-minute promise it makes. Both in the language the
  // article is in: a French reader who reached the end of a French article was
  // being handed an English test, and /fr/first-quarter/ has existed all along.
  const to = navHref({ to: compact ? '/new-moon' : '/first-quarter' }, l)

  // Fire the funnel cta_click event, then let navigation proceed (no
  // preventDefault). Fire-and-forget: trackEvent swallows errors.
  // `instrument` is recorded so the digest can tell the two variants apart:
  // without it the funnel cannot say whether the early card or the
  // end-of-article one earned a click, which is the whole question this
  // split exists to answer.
  const handleClick = () => {
    trackEvent('cta_click', {
      slug,
      lang,
      instrument: compact ? 'newMoon' : 'firstQuarter',
      path: typeof window !== 'undefined' ? (window.location?.pathname ?? null) : null,
    })
  }

  return (
    <Card accent="blue" className={`max-w-3xl ${compact ? 'p-4 my-8' : 'p-6 mt-12'}`}>
      {!compact && <SectionLabel color="blue" className="mb-2">Cèrcol</SectionLabel>}
      <DisplayHeading
        as="p"
        className={`font-bold text-gray-900 ${compact ? 'text-base mb-2' : 'text-xl mb-1'}`}
      >
        {heading}
      </DisplayHeading>
      {!compact && <p className="text-sm text-gray-500 leading-relaxed mb-4">{c.deepP}</p>}
      <Link
        to={to}
        onClick={handleClick}
        className={`font-semibold inline-flex items-center justify-center transition-colors rounded text-sm bg-[var(--mm-color-blue)] text-white hover:opacity-90 ${compact ? 'px-4 py-2' : 'px-5 py-2.5'}`}
      >
        {compact ? c.b : c.deepB}
      </Link>
      {!compact && (
        <Link to={navHref({ to: '/sample' }, l)} className="block mt-3 text-xs text-gray-500 underline hover:text-gray-700 transition-colors">
          {c.s}
        </Link>
      )}
    </Card>
  )
}
