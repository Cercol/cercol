/**
 * FullMoonReportPage — integrated report combining self-report and Witness Cèrcol.
 * Requires authentication (premium already validated by having completed Full Moon).
 *
 * Sections:
 * 1. Self-report: domain bars + role result from the most recent Full Moon completion.
 * 2. Witness results (requires ≥ 2 completed witnesses):
 *    - Averaged domain bars
 *    - Role from witness perspective
 *    - Divergence / blind spots (|self_z − witness_z| > 0.8)
 * 3. Pending witnesses prompt (if < 2 complete).
 *
 * Data sources:
 * - Self-report: `results` Supabase table (most recent fullMoon row for this user)
 * - Witness: API GET /witness/my-sessions (returns sessions + scores)
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getMyWitnessSessions } from '../lib/api'
import { computeRole } from '../utils/role-scoring'
import { averageWitnessScores, detectDivergence } from '../utils/witness-scoring'
import { DOMAIN_KEYS } from '../data/domains'
import { colors } from '../design/tokens'
import RadarChart from '../components/RadarChart'
import RoleResult from '../components/RoleResult'
import RoleProbabilityBars from '../components/RoleProbabilityBars'

const DOMAIN_BAR_COLOR = {
  depth:      'bg-red-500',
  presence:   'bg-amber-400',
  vision:     'bg-purple-500',
  bond:       'bg-emerald-500',
  discipline: 'bg-blue-600',
}

const MIN_WITNESSES_FOR_REPORT = 2

function DomainBar({ domainKey, selfScore, witnessScore, label, barColor }) {
  const selfPct    = ((selfScore - 1) / 4) * 100
  const witnessPct = witnessScore !== null ? ((witnessScore - 1) / 4) * 100 : null

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
          <span className="text-gray-900">{selfScore.toFixed(1)}</span>
          {witnessPct !== null && (
            <span className="text-purple-600">{witnessScore.toFixed(1)}</span>
          )}
        </div>
      </div>
      {/* Self bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${selfPct}%` }} />
      </div>
      {/* Witness bar */}
      {witnessPct !== null && (
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 bg-purple-400" style={{ width: `${witnessPct}%` }} />
        </div>
      )}
    </div>
  )
}

export default function FullMoonReportPage() {
  const navigate   = useNavigate()
  const { t }      = useTranslation()
  const { user, loading: authLoading } = useAuth()

  const [selfReport,  setSelfReport]  = useState(null)   // domain scores from results table
  const [sessions,    setSessions]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadError,   setLoadError]   = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/auth')
      return
    }

    async function loadData() {
      try {
        // Fetch most recent Full Moon self-report
        const { data: results } = await supabase
          .from('results')
          .select('presence,bond,discipline,depth,vision,created_at')
          .eq('user_id', user.id)
          .eq('instrument', 'fullMoon')
          .order('created_at', { ascending: false })
          .limit(1)

        if (results?.length) {
          const r = results[0]
          setSelfReport({ presence: r.presence, bond: r.bond, discipline: r.discipline, depth: r.depth, vision: r.vision })
        }

        // Fetch witness sessions
        const witnessSessions = await getMyWitnessSessions()
        setSessions(witnessSessions)
      } catch {
        setLoadError(t('witnessResults.error'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">{t('witnessResults.loading')}</p>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-sm text-red-500">{loadError}</p>
      </main>
    )
  }

  if (!selfReport) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-gray-500 text-sm mb-4">{t('witnessResults.noSelf')}</p>
          <button
            onClick={() => navigate('/full-moon')}
            className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            {t('witnessResults.startFmCta')}
          </button>
        </div>
      </main>
    )
  }

  const completedSessions = sessions.filter(s => s.completed_at && s.scores)
  const pendingSessions   = sessions.filter(s => !s.completed_at)
  const hasEnoughWitnesses = completedSessions.length >= MIN_WITNESSES_FOR_REPORT

  const selfRole = computeRole(selfReport)

  // Witness aggregation
  const witnessScores  = hasEnoughWitnesses
    ? averageWitnessScores(completedSessions.map(s => s.scores))
    : null
  const witnessRole    = witnessScores ? computeRole(witnessScores) : null
  const divergence     = (selfReport && witnessScores)
    ? detectDivergence(selfReport, witnessScores)
    : []

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 mb-1">
            🌕 Full Moon Cèrcol
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('witnessResults.title')}</h1>
          <p className="mt-1 text-gray-500 text-sm">{t('witnessResults.subtitle')}</p>
        </div>

        {/* ── Section 1: Self-report ── */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
            {t('witnessResults.selfSection')}
          </h2>

          {/* Radar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <RadarChart
              scores={selfReport}
              domainKeys={DOMAIN_KEYS}
              labelFn={(key) => t(`fmDomains.${key}.name`)}
            />
          </div>

          {/* Domain bars — self only */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
            {DOMAIN_KEYS.map(key => (
              <DomainBar
                key={key}
                domainKey={key}
                selfScore={selfReport[key]}
                witnessScore={null}
                label={t(`fmDomains.${key}.name`)}
                barColor={DOMAIN_BAR_COLOR[key]}
              />
            ))}
          </div>
        </section>

        {/* ── Section 2: Self role ── */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
            {t('witnessResults.selfRoleSection')}
          </h2>
          <div className="flex flex-col gap-4">
            <RoleResult result={selfRole} />
            <RoleProbabilityBars result={selfRole} />
          </div>
        </section>

        {/* ── Section 3: Witness results ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              {t('witnessResults.witnessSection')}
            </h2>
            <span className="text-xs font-medium text-gray-500">
              {t('witnessResults.witnessCount', { count: completedSessions.length })}
            </span>
          </div>

          {!hasEnoughWitnesses ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-4">{t('witnessResults.pendingNote')}</p>
              <div className="flex flex-col gap-2 mb-4">
                {completedSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{s.witness_name}</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Done</span>
                  </div>
                ))}
                {pendingSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{s.witness_name}</span>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Waiting</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/witness-setup')}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                {t('witnessResults.setupCta')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Comparison domain bars */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-gray-400 inline-block" />
                    {t('witnessResults.selfLabel')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-purple-400 inline-block" />
                    {t('witnessResults.witnessLabel')}
                  </span>
                </div>
                <div className="flex flex-col gap-5">
                  {DOMAIN_KEYS.map(key => (
                    <DomainBar
                      key={key}
                      domainKey={key}
                      selfScore={selfReport[key]}
                      witnessScore={witnessScores[key]}
                      label={t(`fmDomains.${key}.name`)}
                      barColor={DOMAIN_BAR_COLOR[key]}
                    />
                  ))}
                </div>
              </div>

              {/* Witness role */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  {t('witnessResults.roleSection')}
                </h3>
                <div className="flex flex-col gap-4">
                  <RoleResult result={witnessRole} />
                  <RoleProbabilityBars result={witnessRole} />
                </div>
              </div>

              {/* Divergence / blind spots */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{t('witnessResults.divergenceHeading')}</h3>
                {divergence.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('witnessResults.noDivergence')}</p>
                ) : (
                  <div className="flex flex-col gap-4 mt-3">
                    <p className="text-xs text-gray-400">{t('witnessResults.divergenceNote')}</p>
                    {divergence.map(({ domain, selfScore, witnessScore }) => {
                      const direction = witnessScore > selfScore ? 'higher' : 'lower'
                      return (
                        <div key={domain} className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{t(`fmDomains.${domain}.name`)}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {t(`witnessResults.divergenceDirection.${direction}`, { domain: t(`fmDomains.${domain}.name`) })}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-gray-900">{selfScore.toFixed(1)}</p>
                            <p className="text-sm font-semibold text-purple-600">{witnessScore.toFixed(1)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Witness count summary */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{t('witnessResults.witnessCount', { count: completedSessions.length })}</span>
          <button
            onClick={() => navigate('/witness-setup')}
            className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            {t('witnessResults.setupCta')}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-xl px-5 py-4 text-xs text-gray-500 leading-relaxed">
          {t('witnessResults.disclaimer')}
        </div>

      </div>
    </main>
  )
}
