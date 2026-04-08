/**
 * HomePage — instrument selection screen.
 * Full-width blue background. Three instrument cards in a horizontal grid.
 * Cards are white with a 3px left border in the instrument color.
 * On hover: card fills with the instrument color, text inverts.
 * This page opts out of Layout's white content wrapper via the home-route
 * exception in Layout.jsx (useLocation check).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'

const GITHUB_URL = 'https://github.com/miquelmatoses/cercol'
const ISSUE_URL  = 'https://github.com/miquelmatoses/cercol/issues/new?title=Bug+report&labels=bug'

/**
 * InstrumentCard — white card with colored left border.
 * On hover: fills with accentColor; text inverts (white, or black on yellow).
 */
function InstrumentCard({ emoji, name, description, meta, accentColor, darkHover = false, paymentLabel, onClick }) {
  const [hovered, setHovered] = useState(false)

  // Text color: black by default; on hover → white (or black for yellow cards)
  const textColor = hovered ? (darkHover ? colors.black : colors.white) : colors.black

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left w-full p-8 cursor-pointer"
      style={{
        backgroundColor: hovered ? accentColor : colors.white,
        color: textColor,
        borderStyle:  'solid',
        borderWidth:  '0 0 0 3px',
        borderColor:  accentColor,
        borderRadius: 4,
        transition:   'background-color 200ms, color 200ms',
      }}
    >
      <div className="text-5xl mb-6 leading-none">{emoji}</div>

      {/* Name in accent color when idle; inverts on hover */}
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: hovered ? textColor : accentColor, transition: 'color 200ms' }}
      >
        {name}
      </h2>

      <p className="text-sm mb-6" style={{ opacity: hovered ? 0.85 : 0.65 }}>
        {description}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs px-2.5 py-1 font-medium"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4 }}
        >
          {meta}
        </span>
        {paymentLabel && (
          <span
            className="text-xs px-2.5 py-1 font-medium"
            style={{ backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 4 }}
          >
            {paymentLabel}
          </span>
        )}
      </div>
    </button>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <main
      className="min-h-[calc(100vh-4rem)] flex flex-col"
      style={{ backgroundColor: colors.blue }}
    >
      {/* Breathing space above cards */}
      <div style={{ height: 80 }} />

      {/* Instrument cards — 3-col desktop, 2 tablet, 1 mobile */}
      <div className="flex-1 px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-xl mx-auto">
          <InstrumentCard
            emoji="🌑"
            name={t('home.newMoon.name')}
            description={t('home.newMoon.description')}
            meta={t('home.newMoon.meta')}
            accentColor={colors.red}
            onClick={() => navigate('/new-moon')}
          />
          <InstrumentCard
            emoji="🌓"
            name={t('home.firstQuarter.name')}
            description={t('home.firstQuarter.description')}
            meta={t('home.firstQuarter.meta')}
            accentColor={colors.green}
            onClick={() => navigate('/first-quarter')}
          />
          <InstrumentCard
            emoji="🌕"
            name={t('home.fullMoon.name')}
            description={t('home.fullMoon.description')}
            meta={t('home.fullMoon.meta')}
            accentColor={colors.yellow}
            darkHover
            paymentLabel={t('home.fullMoon.paid')}
            onClick={() => navigate('/full-moon')}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 lg:px-16 pt-10 pb-8">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {t('home.footnote')}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-white transition-colors"
          >
            {t('home.viewOnGitHub')}
          </a>
          {' · '}
          <a
            href={ISSUE_URL}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-white transition-colors"
          >
            {t('feedback.reportIssue')}
          </a>
        </p>
      </footer>
    </main>
  )
}
