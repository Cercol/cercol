/**
 * HomePage — instrument selection screen.
 * Full-width blue background. Three instrument cards in a horizontal grid.
 * Each card has its own brand color background. Clicking anywhere on the
 * card navigates to the instrument.
 */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'

const GITHUB_URL  = 'https://github.com/miquelmatoses/cercol'
const ISSUE_URL   = 'https://github.com/miquelmatoses/cercol/issues/new?title=Bug+report&labels=bug'

function InstrumentCard({ emoji, name, description, meta, bgColor, textColor, paymentLabel, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full p-8 hover:brightness-90 transition-[filter] duration-200 cursor-pointer"
      style={{ backgroundColor: bgColor, color: textColor, borderRadius: 4 }}
    >
      <div className="text-5xl mb-6 leading-none">{emoji}</div>
      <h2 className="text-2xl font-bold mb-2">{name}</h2>
      <p className="text-sm mb-6" style={{ opacity: 0.8 }}>{description}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs px-2.5 py-1 font-medium"
          style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 4 }}
        >
          {meta}
        </span>
        {paymentLabel && (
          <span
            className="text-xs px-2.5 py-1 font-medium"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4 }}
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

      {/* Instrument cards — 3 columns desktop, 2 tablet, 1 mobile */}
      <div className="flex-1 px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-xl mx-auto">
          <InstrumentCard
            emoji="🌑"
            name={t('home.newMoon.name')}
            description={t('home.newMoon.description')}
            meta={t('home.newMoon.meta')}
            bgColor={colors.red}
            textColor={colors.white}
            onClick={() => navigate('/new-moon')}
          />
          <InstrumentCard
            emoji="🌓"
            name={t('home.firstQuarter.name')}
            description={t('home.firstQuarter.description')}
            meta={t('home.firstQuarter.meta')}
            bgColor={colors.green}
            textColor={colors.white}
            onClick={() => navigate('/first-quarter')}
          />
          <InstrumentCard
            emoji="🌕"
            name={t('home.fullMoon.name')}
            description={t('home.fullMoon.description')}
            meta={t('home.fullMoon.meta')}
            bgColor={colors.yellow}
            textColor={colors.black}
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
