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
import { NewMoonIcon, FirstQuarterIcon, FullMoonIcon, RoleIcon } from '../components/MoonIcons'

/** Decorative animal icons scattered across the blue background. */
const BG_ICONS = [
  { role: 'R01', size: 160, style: { top: '-4%',  left: '-3%',  transform: 'rotate(18deg)'  } },
  { role: 'R05', size: 140, style: { top: '1%',   right: '-2%', transform: 'rotate(-22deg)' } },
  { role: 'R10', size: 130, style: { bottom: '4%', right: '-2%', transform: 'rotate(14deg)' } },
  { role: 'R11', size: 115, style: { bottom: '2%', left: '-2%', transform: 'rotate(-20deg)' } },
  { role: 'R07', size: 100, style: { top: '38%',  left: '1%',  transform: 'rotate(32deg)'  } },
  { role: 'R09', size: 88,  style: { top: '42%',  right: '1%', transform: 'rotate(-18deg)' } },
  { role: 'R04', size: 78,  style: { top: '14%',  left: '19%', transform: 'rotate(-10deg)' } },
  { role: 'R02', size: 72,  style: { top: '10%',  right: '20%', transform: 'rotate(24deg)' } },
  { role: 'R08', size: 82,  style: { bottom: '18%', right: '19%', transform: 'rotate(8deg)'} },
  { role: 'R12', size: 68,  style: { bottom: '16%', left: '17%', transform: 'rotate(-38deg)'} },
]

const GITHUB_URL = 'https://github.com/miquelmatoses/cercol'
const ISSUE_URL  = 'https://github.com/miquelmatoses/cercol/issues/new?title=Bug+report&labels=bug'

/**
 * InstrumentCard — white card with colored left border.
 * On hover: fills with accentColor; text inverts (white, or black on yellow).
 */
function InstrumentCard({ icon, name, description, meta, accentColor, darkHover = false, paymentLabel, onClick }) {
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
      <div className="mb-6 leading-none flex justify-center" style={{ color: hovered ? textColor : accentColor }}>{icon}</div>

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
      className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden"
      style={{ backgroundColor: colors.blue }}
    >
      {/* Decorative animal icons — behind cards, low opacity */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {BG_ICONS.map(({ role, size, style }) => (
          <div key={role} className="absolute" style={style}>
            <RoleIcon role={role} size={size} style={{ color: 'white', opacity: 0.12 }} />
          </div>
        ))}
      </div>

      {/* Instrument cards — vertically centered, 3-col desktop, 2 tablet, 1 mobile */}
      <div className="flex-1 flex items-center px-8 lg:px-16 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-xl mx-auto w-full">
          <InstrumentCard
            icon={<NewMoonIcon size={80} />}
            name={t('home.newMoon.name')}
            description={t('home.newMoon.description')}
            meta={t('home.newMoon.meta')}
            accentColor={colors.red}
            onClick={() => navigate('/new-moon')}
          />
          <InstrumentCard
            icon={<FirstQuarterIcon size={80} />}
            name={t('home.firstQuarter.name')}
            description={t('home.firstQuarter.description')}
            meta={t('home.firstQuarter.meta')}
            accentColor={colors.green}
            onClick={() => navigate('/first-quarter')}
          />
          <InstrumentCard
            icon={<FullMoonIcon size={80} />}
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
