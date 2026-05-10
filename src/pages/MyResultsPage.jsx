/**
 * MyResultsPage — shows the authenticated user's past results.
 * Redirects to /auth if not signed in.
 *
 * Layout:
 * - Three instrument sections (New Moon, First Quarter, Full Moon), each showing
 *   only the most recent result for that instrument.
 * - If the user has older results for an instrument, a subtle count note is shown.
 * - Delete button anonymises the result (sets user_id = NULL in DB).
 *   A confirmation dialog warns that the action is irreversible.
 * - After deletion the user is invited to retake.
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getMyResults, getMyWitnessContributions, anonymiseResult } from '../lib/api'
import { DOMAIN_KEYS } from '../data/domains'
import { Card, Button, SectionLabel } from '../components/ui'
import { ChevronRightIcon, DimensionIcon, RoleIcon } from '../components/MoonIcons'
import InstrumentNudge from '../components/InstrumentNudge'
import { DOMAIN_BG_CLASSES, DOMAIN_ICON_CLASSES } from '../design/tokens'
import { radarScoreToPercent } from '../utils/new-moon-scoring'
import { scoreToPercent5 } from '../utils/scoring-utils'

/** Map a domain score to 0–100% for progress bars. */
function scorePercent(score, instrument) {
  return instrument === 'newMoon' ? radarScoreToPercent(score) : scoreToPercent5(score)
}

function formatDate(iso, language) {
  return new Date(iso).toLocaleDateString(language === 'ca' ? 'ca' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/** Modal de confirmació d'esborrat */
function DeleteConfirmModal({ t, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          {t('myResults.confirmDelete.title')}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {t('myResults.confirmDelete.body')}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {t('myResults.confirmDelete.cancel')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '…' : t('myResults.confirmDelete.confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Score bars for a single result */
function ScoreBars({ result }) {
  return (
    <div className="flex flex-col gap-2">
      {DOMAIN_KEYS.map((key) => {
        const score = result[key]
        if (score == null) return null
        const pct = scorePercent(score, result.instrument)
        return (
          <div key={key} className="flex items-center gap-3">
            <span className={`w-24 shrink-0 text-xs font-semibold flex items-center gap-1.5 ${DOMAIN_ICON_CLASSES[key]}`}>
              <DimensionIcon domain={key} size={13} />
              <span className="text-gray-600 truncate">
                {key}
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
  )
}

/** Card for one instrument section — shows latest result or a "not yet" state */
function InstrumentSection({ instrumentKey, label, results, t, language, navigate, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [deleteErr,  setDeleteErr]  = useState(false)

  const latest = results[0] ?? null
  const olderCount = results.length - 1

  const RETAKE_PATHS = {
    newMoon:      '/new-moon',
    firstQuarter: '/first-quarter',
    fullMoon:     '/full-moon',
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteErr(false)
    try {
      await anonymiseResult(latest.id)
      setConfirming(false)
      onDelete(latest.id)
    } catch {
      setDeleteErr(true)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section>
      <SectionLabel color="blue" className="mb-3">{label}</SectionLabel>

      {latest ? (
        <Card className="p-6 shadow-sm">
          {/* Header row: date + actions */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <span className="text-xs text-gray-400">{formatDate(latest.created_at, language)}</span>
            <div className="flex items-center gap-2">
              {olderCount > 0 && (
                <span className="text-xs text-gray-400">
                  {t('myResults.olderResults', { count: olderCount })}
                </span>
              )}
              <button
                type="button"
                onClick={() => { setConfirming(true); setDeleteErr(false) }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
              >
                {t('myResults.deleteResult')}
              </button>
            </div>
          </div>

          {/* Score bars — clickable for Full Moon */}
          {instrumentKey === 'fullMoon' ? (
            <button
              type="button"
              className="w-full text-left"
              onClick={() => navigate('/full-moon/results', {
                state: {
                  domains: {
                    presence:   latest.presence,
                    bond:       latest.bond,
                    discipline: latest.discipline,
                    depth:      latest.depth,
                    vision:     latest.vision,
                  },
                  facets: latest.facets ?? null,
                  fromTest: false,
                }
              })}
            >
              <ScoreBars result={latest} />
              <p className="mt-3 text-xs text-blue-600 font-medium">{t('lastQuarter.viewReport')}</p>
            </button>
          ) : (
            <ScoreBars result={latest} />
          )}

          {deleteErr && (
            <p className="mt-3 text-xs text-red-500">{t('myResults.deleteError')}</p>
          )}
        </Card>
      ) : (
        /* Not yet taken */
        <Card className="p-6 shadow-sm border-dashed">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-400">{t('myResults.empty.body')}</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(RETAKE_PATHS[instrumentKey])}
            >
              {t('myResults.empty.cta')}
            </Button>
          </div>
        </Card>
      )}

      {/* Confirmation modal */}
      {confirming && (
        <DeleteConfirmModal
          t={t}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
          loading={deleting}
        />
      )}
    </section>
  )
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

const INSTRUMENT_KEYS = ['newMoon', 'firstQuarter', 'fullMoon']

export default function MyResultsPage() {
  const { t, i18n }     = useTranslation()
  const navigate        = useNavigate()
  const { user, profile, loading } = useAuth()
  const [results,       setResults]       = useState(null)
  const [error,         setError]         = useState(false)
  const [contributions, setContributions] = useState(null)

  useEffect(() => {
    if (loading) return
    if (!user) { navigate('/auth', { replace: true }); return }
    getMyResults()
      .then(data => setResults(data ?? []))
      .catch(() => setError(true))
    getMyWitnessContributions()
      .then(setContributions)
      .catch(() => setContributions([]))
  }, [user, loading, navigate])

  /** Remove a result from local state after anonymisation */
  const handleDelete = useCallback((deletedId) => {
    setResults(prev => prev.filter(r => r.id !== deletedId))
  }, [])

  /** Group results by instrument, newest first within each group */
  const byInstrument = INSTRUMENT_KEYS.reduce((acc, key) => {
    acc[key] = (results ?? []).filter(r => r.instrument === key)
    return acc
  }, {})

  const instrumentLabels = {
    newMoon:      t('home.newMoon.name'),
    firstQuarter: t('home.firstQuarter.name'),
    fullMoon:     t('home.fullMoon.name'),
  }

  const totalResults = results?.length ?? 0
  const done = new Set((results ?? []).map(r => r.instrument))
  const nudgeTarget = !done.has('newMoon') ? null
    : !done.has('firstQuarter') ? 'firstQuarter'
    : !done.has('fullMoon')     ? 'fullMoon'
    : null

  return (
    <main className="py-16">

      <h1 className="text-xl font-bold text-gray-900 mb-6">
        {t('myResults.heading')}
      </h1>

      {profile && !profile.first_name && <ProfilePrompt t={t} />}

      {results === null && !error && (
        <p className="text-sm text-gray-400">{t('myResults.loading')}</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{t('myResults.error')}</p>
      )}

      {results !== null && totalResults === 0 && (
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
      )}

      {results !== null && totalResults > 0 && (
        <div className="flex flex-col gap-8">
          {INSTRUMENT_KEYS.map(key => (
            <InstrumentSection
              key={key}
              instrumentKey={key}
              label={instrumentLabels[key]}
              results={byInstrument[key]}
              t={t}
              language={i18n.language}
              navigate={navigate}
              onDelete={handleDelete}
            />
          ))}

          {nudgeTarget && <InstrumentNudge target={nudgeTarget} />}

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/')}
            className="w-full"
          >
            {t('myResults.startCta')}
          </Button>
        </div>
      )}

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

    </main>
  )
}
