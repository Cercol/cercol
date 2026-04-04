/**
 * HomePage — landing screen with project intro and CTA to start the test.
 */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageToggle from '../components/LanguageToggle'

const DOMAIN_PILLS = [
  { key: 'extraversion',         color: 'bg-amber-100 text-amber-700' },
  { key: 'agreeableness',        color: 'bg-emerald-100 text-emerald-700' },
  { key: 'conscientiousness',    color: 'bg-blue-100 text-blue-700' },
  { key: 'negativeEmotionality', color: 'bg-red-100 text-red-700' },
  { key: 'openMindedness',       color: 'bg-purple-100 text-purple-700' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      {/* Language toggle — top right */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-xl text-center">
        {/* Wordmark */}
        <div className="mb-10">
          <span className="text-4xl font-bold tracking-tight text-gray-900">
            {t('nav.brand')}
          </span>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-blue-600">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Hero */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {t('home.headline')}
        </h1>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
          {t('home.body')}
        </p>

        {/* Dimension pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {DOMAIN_PILLS.map(({ key, color }) => (
            <span key={key} className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
              {t(`domains.${key}.label`)}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/test')}
          className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-2xl shadow-md transition-colors"
        >
          {t('home.startButton')}
        </button>

        <p className="mt-6 text-xs text-gray-400">
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
