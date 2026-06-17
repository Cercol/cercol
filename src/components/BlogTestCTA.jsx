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

// Optional category-specific heading override. Localized to all six languages.
// Any other category falls back to the generic COPY[lang].h. p and b stay generic.
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

export default function BlogTestCTA({ slug, lang = 'en', category, compact = false }) {
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
  // compact: a slim early-in-article bridge; full: the end-of-article card.
  return (
    <Card accent="blue" className={`max-w-3xl ${compact ? 'p-4 my-8' : 'p-6 mt-12'}`}>
      {!compact && <SectionLabel color="blue" className="mb-2">Cèrcol</SectionLabel>}
      <p
        className={`font-bold text-gray-900 ${compact ? 'text-base mb-2' : 'text-xl mb-1'}`}
        style={{ fontFamily: 'var(--mm-font-display)' }}
      >
        {heading}
      </p>
      {!compact && <p className="text-sm text-gray-500 leading-relaxed mb-4">{c.p}</p>}
      <Link
        to="/new-moon"
        onClick={handleClick}
        className={`font-semibold inline-flex items-center justify-center transition-colors rounded text-sm bg-[var(--mm-color-blue)] text-white hover:opacity-90 ${compact ? 'px-4 py-2' : 'px-5 py-2.5'}`}
      >
        {c.b}
      </Link>
    </Card>
  )
}
