/**
 * MyResultsPage — shows the authenticated user's past results.
 * Redirects to /auth if not signed in.
 */
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getMyResults, getMyWitnessContributions } from '../lib/api'
import { DOMAIN_KEYS } from '../data/domains'
import { Card, Button, SectionLabel } from '../components/ui'
import { ChevronRightIcon, DimensionIcon, RoleIcon } from '../components/MoonIcons'
import InstrumentNudge from '../components/InstrumentNudge'
import { DOMAIN_BG_CLASSES, DOMAIN_ICON_CLASSES } from '../design/tokens'
import { radarScoreToPercent } from '../utils/new-moon-scoring'
import { scoreToPercent5 } from '../utils/scoring-utils'

/** Map a domain score to 0–100% for progress bars, using the correct scale per instrument. */
function scorePercent(score, instrument) {
  return instrument === 'newMoon' ? radarScoreToPercent(score) : scoreToPercent5(score)
}

function formatDate(iso, language) {
  return new Date(iso).toLocaleDateString(language === 'ca' ? 'ca' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function ResultCard({ result, t, language, navigate }) {
  const isFullMoon = result.instrument === 'fullMoon'
  const instrumentLabel =
    result.instrument === 'newMoon'    ? t('home.newMoon.name')
    : isFullMoon                       ? t('home.fullMoon.name')
    :                                    t('home.firstQuarter.name')

  const inner = (
    <Card className={`p-6 shadow-sm ${isFullMoon ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-900">{instrumentLabel}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatDate(result.created_at, language)}</span>
          <ChevronRightIcon size={14} className={isFullMoon ? 'text-gray-500' : 'text-gray-300'} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {DOMAIN_KEYS.map((key) => {
          const score = result[key]
          if (score == null) return null
          const pct = scorePercent(score, result.instrument)
          return (
            <div key={key} className="flex items-center gap-3">
              <span className={`w-24 shrink-0 text-xs font-semibold flex items-center gap-1.5 ${DOMAIN_ICON_CLASSES[key]}`}>
                <DimensionIcon domain={key} size={13} />
                <span className="text-gray-600">
                  {t(`dimensions.${key}.label`, { defaultValue: key })}
                </span>
              </span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${DOMAIN_BG_CLASSES[key]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-gray-400">{pct}%</span>
            </div>
          )
        })}
      </div>

      {isFullMoon && (
        <p className="mt-3 text-xs text-blue-600 font-medium">{t('lastQuarter.viewReport')}</p>
      )}
    </Card>
  )

  if (isFullMoon) {
    return (
      <button
        type="button"
        className="w-full text-left"
        onClick={() => navigate('/full-moon/results', {
          state: {
            domains: {
              presence:   result.presence,
              bond:       result.bond,
              discipline: result.discipline,
              depth:      result.depth,
              vision:     result.vision,
            },
            facets: result.facets ?? null,
            fromTest: false,
          }
        })}
      >
        {inner}
      </button>
    )
  }
  return inner
}

function ProfilePrompt({ t }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-sm text-amber-800">{t('profile.completionPrompt.body')}</p>
      <Link
        to="/profile"
        className="shrink-0 text-sm font-semibold text-amber-900 underline hover:no-underline"
      >
        {t('profile.completionPrompt.cta')}
      </Link>
    </div>
  )
}

export default function MyResultsPage() {
  const { t, i18n }     = useTranslation()
  const navigate        = useNavigate()
  const { user, profile, loading } = useAuth()
  const [results,       setResults]       = useState(null)   // null = loading
  const [error,         setError]         = useState(false)
  const [contributions, setContributions] = useState(null)  // null = loading

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/auth', { replace: true })
      return
    }
    getMyResults()
      .then(data => setResults(data ?? []))
      .catch(() => setError(true))
    getMyWitnessContributions()
      .then(setContributions)
      .catch(() => setContributions([]))
  }, [user, loading, navigate])

  return (
    <main className="py-16">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {t('myResults.heading')}
        </h1>

        {/* Non-blocking profile completion prompt */}
        {profile && !profile.first_name && <ProfilePrompt t={t} />}

        {results === null && !error && (
          <p className="text-sm text-gray-400">{t('myResults.loading')}</p>
        )}

        {error && (
          <p className="text-sm text-red-500">{t('myResults.error')}</p>
        )}

        {results !== null && (() => {
          const done = new Set(results.map(r => r.instrument))
          const newMoonDone     = done.has('newMoon')
          const fqDone          = done.has('firstQuarter')
          const fmDone          = done.has('fullMoon')

          // Determine which instrument to nudge towards next.
          const nudgeTarget = !newMoonDone ? null
            : !fqDone ? 'firstQuarter'
            : !fmDone ? 'fullMoon'
            : null

          if (results.length === 0) return (
            <div className="text-center py-16 flex flex-col items-center gap-6">
              <RoleIcon role="R01" size={80} className="text-gray-200" />
              <div>
                <p className="font-semibold text-gray-900">{t('myResults.empty.heading')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('myResults.empty.body')}</p>
              </div>
              <Button variant="primary" size="lg" onClick={() => navigate('/new-moon')}>
                {t('myResults.empty.cta')}
              </Button>
            </div>
          )

          return (
            <div className="flex flex-col gap-4">
              {results.map((r) => (
                <ResultCard key={r.id} result={r} t={t} language={i18n.language} navigate={navigate} />
              ))}
              {nudgeTarget && <InstrumentNudge target={nudgeTarget} />}
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/')}
                className="mt-2 w-full"
              >
                {t('myResults.startCta')}
              </Button>
            </div>
          )
        })()}

        {/* Witness contributions */}
        {contributions !== null && (
          <section className="mt-10">
            <SectionLabel color="gray" className="mb-3">
              {t('myResults.contributionsHeading')}
            </SectionLabel>
            {contributions.length === 0 ? (
              <p className="text-sm text-gray-400">{t('myResults.contributionsEmpty')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {contributions.map((c, i) => (
                  <div key={i} className="bg-white rounded border border-gray-200 px-4 py-3">
                    <p className="text-sm text-gray-900">
                      {t('myResults.contributionItem', { name: c.subject_display || '—' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
