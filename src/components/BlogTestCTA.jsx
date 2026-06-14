/**
 * BlogTestCTA — end-of-article call to action that bridges readers to the
 * free, no-account New Moon Cercol test (/new-moon).
 *
 * Uses Card + SectionLabel from the ui kit. The action is a real <Link>
 * (crawlable, and lets the reader land on the test directly) styled like the
 * primary Button; the Button primitive renders a <button> and cannot carry an
 * href, so the primary-variant token classes are reused here on the Link.
 *
 * Copy uses Cercol product vocabulary only (never academic instrument names).
 */
import { Link } from 'react-router-dom'
import { Card, SectionLabel } from './ui'
import { trackEvent } from '../lib/api'

// Localized copy. es/fr/de/da are flagged for human review in the PR.
const COPY = {
  en: { h: 'See yourself in five dimensions.', p: 'A free 2-minute snapshot. No account, no card.', b: 'Start the free test' },
  ca: { h: "Mira't en cinc dimensions.", p: 'Una instantània gratuïta de 2 minuts. Sense compte, sense targeta.', b: 'Comença el test gratuït' },
  es: { h: 'Mírate en cinco dimensiones.', p: 'Una instantánea gratuita de 2 minutos. Sin cuenta, sin tarjeta.', b: 'Empieza el test gratis' },
  fr: { h: 'Découvrez-vous en cinq dimensions.', p: 'Un aperçu gratuit de 2 minutes. Sans compte, sans carte.', b: 'Commencer le test gratuit' },
  de: { h: 'Sieh dich in fünf Dimensionen.', p: 'Eine kostenlose 2-Minuten-Momentaufnahme. Kein Konto, keine Karte.', b: 'Kostenlosen Test starten' },
  da: { h: 'Se dig selv i fem dimensioner.', p: 'Et gratis 2-minutters øjebliksbillede. Ingen konto, intet kort.', b: 'Start den gratis test' },
}

// Optional category-specific heading override (en/ca only). Any other category
// or locale falls back to the generic COPY[lang].h. p and b stay generic.
const CATEGORY_H = {
  teams:      { en: "See how you shift a team's balance.", ca: "Mira com mous l'equilibri d'un equip." },
  work:       { en: 'See how you show up at work.',         ca: 'Mira com et mostres a la feina.' },
  leadership: { en: 'See your own leadership profile.',     ca: 'Mira el teu perfil de lideratge.' },
}

export default function BlogTestCTA({ slug, lang = 'en', category }) {
  const c = COPY[lang] || COPY.en
  const heading = CATEGORY_H[category]?.[lang] || c.h
  // Fire the funnel cta_click event, then let navigation proceed (no
  // preventDefault). Fire-and-forget: trackEvent swallows errors.
  const handleClick = () => {
    trackEvent('cta_click', {
      slug,
      lang,
      path: typeof window !== 'undefined' ? (window.location?.pathname ?? null) : null,
    })
  }
  return (
    <Card accent="blue" className="p-6 mt-12 max-w-3xl">
      <SectionLabel color="blue" className="mb-2">Cèrcol</SectionLabel>
      <h2
        className="text-xl font-bold text-gray-900 mb-1"
        style={{ fontFamily: 'var(--mm-font-display)' }}
      >
        {heading}
      </h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{c.p}</p>
      <Link
        to="/new-moon"
        onClick={handleClick}
        className="font-semibold inline-flex items-center justify-center transition-colors rounded text-sm px-5 py-2.5 bg-[var(--mm-color-blue)] text-white hover:opacity-90"
      >
        {c.b}
      </Link>
    </Card>
  )
}
