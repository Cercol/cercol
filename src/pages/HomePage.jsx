/**
 * HomePage — instrument selection screen.
 * User chooses between Cèrcol Radar (10 items) and Cèrcol Test (30 items).
 */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageToggle from '../components/LanguageToggle'

function InstrumentCard({ name, tagline, meta, description, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>
            {tagline}
          </span>
          <h2 className="mt-1 text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
            {name}
          </h2>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-300 group-hover:text-blue-400 transition-colors mt-1 shrink-0"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      <span className="inline-block text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
        {meta}
      </span>
    </button>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      {/* Language toggle */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-xl">
        {/* Wordmark */}
        <div className="text-center mb-10">
          <span className="text-4xl font-bold tracking-tight text-gray-900">
            {t('nav.brand')}
          </span>
          <p className="mt-2 text-base text-gray-500">{t('home.subtitle')}</p>
        </div>

        {/* Headline */}
        <h1 className="text-center text-xl font-semibold text-gray-700 mb-5">
          {t('home.headline')}
        </h1>

        {/* Instrument cards */}
        <div className="flex flex-col gap-4">
          <InstrumentCard
            name={t('home.radar.name')}
            tagline={t('home.radar.tagline')}
            meta={t('home.radar.meta')}
            description={t('home.radar.description')}
            accent="text-amber-500"
            onClick={() => navigate('/radar')}
          />
          <InstrumentCard
            name={t('home.test.name')}
            tagline={t('home.test.tagline')}
            meta={t('home.test.meta')}
            description={t('home.test.description')}
            accent="text-blue-600"
            onClick={() => navigate('/test')}
          />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          {t('home.footnote')}
          <a
            href="https://github.com/miquelmatoses/cercol"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-600"
          >
            {t('home.viewOnGitHub')}
          </a>
        </p>
      </div>
    </main>
  )
}
