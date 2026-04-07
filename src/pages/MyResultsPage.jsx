/**
 * MyResultsPage — shows the authenticated user's past results.
 * Redirects to /auth if not signed in.
 * Fetches from Supabase using the anon client; RLS filters to own rows only.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { DOMAIN_KEYS } from '../data/domains'

const DOMAIN_BAR_COLOR = {
  presence:   'bg-amber-400',
  bond:       'bg-emerald-500',
  discipline: 'bg-blue-600',
  depth:      'bg-red-500',
  vision:     'bg-purple-500',
}

const INSTRUMENT_SCALE = {
  newMoon:      { min: 1, max: 7 },
  firstQuarter: { min: 1, max: 5 },
  fullMoon:     { min: 1, max: 5 },
}

function scorePercent(score, instrument) {
  const { min, max } = INSTRUMENT_SCALE[instrument] ?? { min: 1, max: 5 }
  return Math.round(((score - min) / (max - min)) * 100)
}

function formatDate(iso, language) {
  return new Date(iso).toLocaleDateString(language === 'ca' ? 'ca' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function ResultCard({ result, t, language }) {
  const instrumentLabel =
    result.instrument === 'newMoon'      ? t('home.newMoon.name')
    : result.instrument === 'fullMoon'   ? t('home.fullMoon.name')
    :                                      t('home.firstQuarter.name')

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-900">{instrumentLabel}</span>
        <span className="text-xs text-gray-400">{formatDate(result.created_at, language)}</span>
      </div>

      <div className="flex flex-col gap-2">
        {DOMAIN_KEYS.map((key) => {
          const score = result[key]
          if (score == null) return null
          const pct = scorePercent(score, result.instrument)
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-widest text-gray-500 capitalize">
                {t(`dimensions.${key}.label`, { defaultValue: key })}
              </span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${DOMAIN_BAR_COLOR[key]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-gray-400">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MyResultsPage() {
  const { t, i18n }     = useTranslation()
  const navigate        = useNavigate()
  const { user, loading } = useAuth()
  const [results, setResults] = useState(null)   // null = loading
  const [error,   setError]   = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/auth', { replace: true })
      return
    }
    supabase
      .from('results')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(true); return }
        setResults(data ?? [])
      })
  }, [user, loading, navigate])

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {t('myResults.heading')}
        </h1>

        {results === null && !error && (
          <p className="text-sm text-gray-400">{t('myResults.loading')}</p>
        )}

        {error && (
          <p className="text-sm text-red-500">{t('myResults.error')}</p>
        )}

        {results !== null && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-6">{t('myResults.empty')}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors"
            >
              {t('myResults.startCta')}
            </button>
          </div>
        )}

        {results !== null && results.length > 0 && (
          <div className="flex flex-col gap-4">
            {results.map((r) => (
              <ResultCard key={r.id} result={r} t={t} language={i18n.language} />
            ))}
            <button
              onClick={() => navigate('/')}
              className="mt-2 w-full border border-gray-200 hover:border-blue-300 text-gray-500 hover:text-blue-700 font-semibold rounded-xl px-4 py-3 text-sm transition-colors"
            >
              {t('myResults.startCta')}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
