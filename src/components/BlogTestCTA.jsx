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

// Localized copy. es/fr/de/da are flagged for human review in the PR.
const COPY = {
  en: { h: 'See yourself in five dimensions.', p: 'A free 2-minute snapshot. No account, no card.', b: 'Start the free test' },
  ca: { h: "Mira't en cinc dimensions.", p: 'Una instantània gratuïta de 2 minuts. Sense compte, sense targeta.', b: 'Comença el test gratuït' },
  es: { h: 'Mírate en cinco dimensiones.', p: 'Una instantánea gratuita de 2 minutos. Sin cuenta, sin tarjeta.', b: 'Empieza el test gratis' },
  fr: { h: 'Découvrez-vous en cinq dimensions.', p: 'Un aperçu gratuit de 2 minutes. Sans compte, sans carte.', b: 'Commencer le test gratuit' },
  de: { h: 'Sieh dich in fünf Dimensionen.', p: 'Eine kostenlose 2-Minuten-Momentaufnahme. Kein Konto, keine Karte.', b: 'Kostenlosen Test starten' },
  da: { h: 'Se dig selv i fem dimensioner.', p: 'Et gratis 2-minutters øjebliksbillede. Ingen konto, intet kort.', b: 'Start den gratis test' },
}

export default function BlogTestCTA({ lang = 'en' }) {
  const c = COPY[lang] || COPY.en
  return (
    <Card accent="blue" className="p-6 mt-12 max-w-3xl">
      <SectionLabel color="blue" className="mb-2">Cèrcol</SectionLabel>
      <h2
        className="text-xl font-bold text-gray-900 mb-1"
        style={{ fontFamily: 'var(--mm-font-display)' }}
      >
        {c.h}
      </h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{c.p}</p>
      <Link
        to="/new-moon"
        className="font-semibold inline-flex items-center justify-center transition-colors rounded text-sm px-5 py-2.5 bg-[var(--mm-color-blue)] text-white hover:opacity-90"
      >
        {c.b}
      </Link>
    </Card>
  )
}
