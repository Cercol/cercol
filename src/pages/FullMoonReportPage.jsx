/**
 * FullMoonReportPage — integrated report combining self-report and Witness Cèrcol.
 * Requires authentication (premium already validated by having completed Full Moon).
 *
 * Reading order (narrative flow):
 * 1. Self role (primary + arc + probability bars)
 * 2. Witness role (if ≥1 complete Witness)
 * 3. Role alignment / convergence (if ≥2 complete)
 * 4. Blind spots (if ≥2 complete)
 * 5. Domain comparison bars (self vs witness average)
 * 6. Witness session list + invite CTA
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
import { averageWitnessScores, detectDivergence, computeConvergence } from '../utils/witness-scoring'
import { DOMAIN_KEYS } from '../data/domains'
import { colors } from '../design/tokens'
import RadarChart from '../components/RadarChart'
import RoleResult from '../components/RoleResult'
import RoleProbabilityBars from '../components/RoleProbabilityBars'

const DOMAIN_BAR_COLOR = {
  depth:      'bg-red-500',
  presence:   'bg-amber-400',
  vision:     'bg-[#427c42]',
  bond:       'bg-emerald-500',
  discipline: 'bg-blue-600',
}

const MIN_WITNESSES_FOR_REPORT = 2

// ── ConvergenceMeter ──────────────────────────────────────────────────────────
function ConvergenceMeter({ ratio, t }) {
  const pct = Math.round(ratio * 100)

  let label, barColor, bg, textColor
  if (ratio >= 0.6) {
    label     = t('witnessResults.convergenceHigh')
    barColor  = 'bg-emerald-500'
    bg        = 'bg-emerald-50'
    textColor = 'text-emerald-700'
  } else if (ratio >= 0.3) {
    label     = t('witnessResults.convergenceMod')
    barColor  = 'bg-amber-400'
    bg        = 'bg-amber-50'
    textColor = 'text-amber-700'
  } else {
    label     = t('witnessResults.convergenceLow')
    barColor  = 'bg-red-400'
    bg        = 'bg-red-50'
    textColor = 'text-red-600'
  }

  return (
    <div className={`rounded-2xl border border-gray-200 px-6 py-5 ${bg}`}>
      <p className={`text-sm font-semibold mb-3 ${textColor}`}>{label}</p>
      <div className="w-full h-2.5 bg-white rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs" style={{ color: colors.textMuted }}>
        {t('witnessResults.convergenceNote')}
      </p>
    </div>
  )
}

// ── BlindSpotCard ─────────────────────────────────────────────────────────────
function BlindSpotCard({ domain, selfScore, witnessScore, t }) {
  const direction = witnessScore > selfScore ? 'witnessHigher' : 'selfHigher'
  const desc = t(`witnessResults.blindSpots.${domain}.${direction}`)
  const domainName = t(`fmDomains.${domain}.name`)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
          {domainName}
        </p>
        <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
          <span style={{ color: colors.textMuted }}>{selfScore.toFixed(1)}</span>
          <span className="text-[#0047ba]">{witnessScore.toFixed(1)}</span>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
        {desc}
      </p>
    </div>
  )
}

// ── DomainComparisonBar ───────────────────────────────────────────────────────
function DomainComparisonBar({ domainKey, selfScore, witnessScore, label, barColor }) {
  const selfPct    = ((selfScore - 1) / 4) * 100
  const witnessPct = witnessScore !== null ? ((witnessScore - 1) / 4) * 100 : null

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>{label}</span>
        <div className="flex items-center gap-3 text-sm font-semibold shrink-0">
          <span style={{ color: colors.textMuted }}>{selfScore.toFixed(1)}</span>
          {witnessPct !== null && (
            <span className="text-[#0047ba]">{witnessScore.toFixed(1)}</span>
          )}
        </div>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${selfPct}%` }} />
      </div>
      {witnessPct !== null && (
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 bg-[#99b3e0]" style={{ width: `${witnessPct}%` }} />
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FullMoonReportPage() {
  const navigate   = useNavigate()
  const { t }      = useTranslation()
  const { user, loading: authLoading } = useAuth()

  const [selfReport,  setSelfReport]  = useState(null)
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
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-gray-400">{t('witnessResults.loading')}</p>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-red-500">{loadError}</p>
      </main>
    )
  }

  if (!selfReport) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-sm">
          <p className="text-gray-500 text-sm mb-4">{t('witnessResults.noSelf')}</p>
          <button
            onClick={() => navigate('/full-moon')}
            className="py-2.5 px-5 rounded-xl bg-[#0047ba] hover:opacity-90 text-white text-sm font-semibold transition-opacity shadow-sm"
          >
            {t('witnessResults.startFmCta')}
          </button>
        </div>
      </main>
    )
  }

  const completedSessions  = sessions.filter(s => s.completed_at && s.scores)
  const pendingSessions    = sessions.filter(s => !s.completed_at)
  const hasEnoughWitnesses = completedSessions.length >= MIN_WITNESSES_FOR_REPORT
  const hasAnyWitness      = completedSessions.length >= 1
  const isDefinitive       = hasEnoughWitnesses

  const selfRole = computeRole(selfReport)

  const witnessScores = hasAnyWitness
    ? averageWitnessScores(completedSessions.map(s => s.scores))
    : null
  const witnessRole = witnessScores ? computeRole(witnessScores) : null

  const divergence = hasEnoughWitnesses
    ? detectDivergence(selfReport, witnessScores)
    : []

  const convergence = (hasEnoughWitnesses && witnessRole)
    ? computeConvergence(selfRole, witnessRole)
    : null

  return (
    <main className="py-10 sm:py-16">
      <div className="flex flex-col gap-10">

        {/* ── Header ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0047ba] mb-1">
            🌕 Full Moon Cèrcol
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.textPrimary }}>
            {t('witnessResults.title')}
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            {t('witnessResults.subtitle')}
          </p>
        </div>

        {/* ── Section 1: Self role ── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: colors.textMuted }}>
            {t('witnessResults.selfRoleSection')}
          </h2>
          <div className="flex flex-col gap-4">
            <RoleResult result={selfRole} definitive={isDefinitive} />
            <RoleProbabilityBars result={selfRole} />
          </div>
        </section>

        {/* ── Section 2: Witness role (if ≥1 complete) ── */}
        {hasAnyWitness && witnessRole && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: colors.textMuted }}>
              {t('witnessResults.roleSection')}
            </h2>
            <div className="flex flex-col gap-4">
              <RoleResult result={witnessRole} />
              <RoleProbabilityBars result={witnessRole} />
            </div>
          </section>
        )}

        {/* ── Section 3: Convergence (if ≥2 complete) ── */}
        {hasEnoughWitnesses && convergence !== null && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: colors.textMuted }}>
              {t('witnessResults.convergenceSection')}
            </h2>
            <ConvergenceMeter ratio={convergence} t={t} />
          </section>
        )}

        {/* ── Section 4: Blind spots (if ≥2 complete) ── */}
        {hasEnoughWitnesses && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>
              {t('witnessResults.blindSpotsTitle')}
            </h2>
            <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
              {t('witnessResults.blindSpotsNote')}
            </p>
            {divergence.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  {t('witnessResults.noDivergence')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {divergence.map(({ domain, selfScore, witnessScore }) => (
                  <BlindSpotCard
                    key={domain}
                    domain={domain}
                    selfScore={selfScore}
                    witnessScore={witnessScore}
                    t={t}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Section 5: Domain comparison bars ── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: colors.textMuted }}>
            {t('witnessResults.domainsSection')}
          </h2>

          {/* Radar chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <RadarChart
              scores={selfReport}
              domainKeys={DOMAIN_KEYS}
              labelFn={(key) => t(`fmDomains.${key}.name`)}
            />
          </div>

          {/* Domain bars */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            {witnessScores && (
              <div className="flex items-center gap-4 text-xs font-medium mb-4" style={{ color: colors.textMuted }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-gray-400 inline-block" />
                  {t('witnessResults.selfLabel')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-[#99b3e0] inline-block" />
                  {t('witnessResults.witnessLabel')}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-5">
              {DOMAIN_KEYS.map(key => (
                <DomainComparisonBar
                  key={key}
                  domainKey={key}
                  selfScore={selfReport[key]}
                  witnessScore={witnessScores ? witnessScores[key] : null}
                  label={t(`fmDomains.${key}.name`)}
                  barColor={DOMAIN_BAR_COLOR[key]}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 6: Witness sessions + invite CTA ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              {t('witnessResults.witnessSessionsSection')}
            </h2>
            <span className="text-xs font-medium" style={{ color: colors.textMuted }}>
              {t('witnessResults.witnessCount', { count: completedSessions.length })}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            {(completedSessions.length > 0 || pendingSessions.length > 0) && (
              <div className="flex flex-col gap-2 mb-4">
                {completedSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span style={{ color: colors.textPrimary }}>{s.witness_name}</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Done</span>
                  </div>
                ))}
                {pendingSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span style={{ color: colors.textPrimary }}>{s.witness_name}</span>
                    <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full" style={{ color: colors.textMuted }}>Waiting</span>
                  </div>
                ))}
              </div>
            )}
            {!hasEnoughWitnesses && (
              <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                {t('witnessResults.pendingNote')}
              </p>
            )}
            <button
              onClick={() => navigate('/witness-setup')}
              className="w-full py-2.5 rounded-xl bg-[#0047ba] hover:opacity-90 text-white text-sm font-semibold transition-opacity shadow-sm"
            >
              {t('witnessResults.setupCta')}
            </button>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-xl px-5 py-4 text-xs leading-relaxed" style={{ color: colors.textMuted }}>
          {t('witnessResults.disclaimer')}
        </div>

      </div>
    </main>
  )
}
