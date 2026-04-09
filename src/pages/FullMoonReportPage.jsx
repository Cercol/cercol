/**
 * FullMoonReportPage — integrated report combining self-report and Witness Cèrcol.
 * Requires authentication (premium already validated by having completed Full Moon).
 *
 * Reading order (narrative flow):
 * 1. Combined role card (self × 2/3 + witness × 1/3 weighting)
 * 2. Combined probability bars (3 rows per role when witness present)
 * 3. Role alignment / convergence (if ≥2 complete)
 * 4. Blind spots (if ≥2 complete)
 * 5. Domain comparison bars (self vs witness average) — two-column layout
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
import { RoleIcon } from '../components/MoonIcons'
import { FullMoonIcon, BlindSpotsIcon, DimensionIcon } from '../components/MoonIcons'
import { averageWitnessScores, detectDivergence, computeConvergence, computeCombinedRole } from '../utils/witness-scoring'
import { DOMAIN_KEYS } from '../data/domains'
import { colors } from '../design/tokens'
import RadarChart from '../components/RadarChart'
import { Card, Button, Badge, SectionLabel } from '../components/ui'

const DOMAIN_BAR_COLOR = {
  depth:      'bg-red-500',
  presence:   'bg-amber-400',
  vision:     'bg-[#427c42]',
  bond:       'bg-emerald-500',
  discipline: 'bg-blue-600',
}

const DOMAIN_ICON_COLOR = {
  depth:      'text-red-500',
  presence:   'text-amber-400',
  vision:     'text-[#427c42]',
  bond:       'text-emerald-500',
  discipline: 'text-blue-600',
}

const MIN_WITNESSES_FOR_REPORT = 2

// ── CombinedRoleBars ──────────────────────────────────────────────────────────
// Shows all 12 roles in a 2×6 grid.
// If witnessResult is present: 3 stacked bars (combined / self / witness).
// If witnessResult is null: single bar (self only, same as FQ/FM results pages).
function CombinedRoleBars({ combinedResult, selfResult, witnessResult, t }) {
  const sorted = Object.entries(combinedResult.probabilities).sort((a, b) => b[1] - a[1])
  const { role: primaryRole, arc } = combinedResult

  return (
    <Card className="shadow-sm p-5 flex flex-col gap-3">
      <SectionLabel color="gray">
        {t('roles.probability_label')}
      </SectionLabel>

      {witnessResult && (
        <div className="flex items-center gap-4 text-xs" style={{ color: colors.textMuted }}>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-2 rounded-full inline-block bg-gray-600" />
            {t('witnessResults.combinedLabel')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-gray-300 inline-block" />
            {t('witnessResults.selfLabel')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-[#99b3e0] inline-block" />
            {t('witnessResults.witnessLabel')}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {sorted.map(([r, combinedProb]) => {
          const isPrimary   = r === primaryRole
          const isArc       = arc.includes(r)
          const combinedPct = Math.round(combinedProb * 100)
          const selfPct     = Math.round((selfResult.probabilities[r] ?? 0) * 100)
          const witnessPct  = witnessResult
            ? Math.round((witnessResult.probabilities[r] ?? 0) * 100)
            : null

          const barColor   = isPrimary ? colors.primary : isArc ? colors.arcBar : colors.border
          const labelColor = isPrimary ? colors.textPrimary : isArc ? colors.arcLabel : colors.textMuted

          return (
            <div key={r}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm ${isPrimary ? 'font-semibold' : 'font-normal'}`}
                  style={{ color: labelColor }}
                >
                  {t(`roles.${r}.name`)}
                </span>
                <span className="text-xs tabular-nums" style={{ color: colors.textMuted }}>
                  {combinedPct}%
                </span>
              </div>
              {/* Combined bar — thicker */}
              <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100 mb-1">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${combinedPct}%`, background: barColor }}
                />
              </div>
              {witnessResult && (
                <>
                  {/* Self bar — thinner */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="flex-1 h-1 rounded-full overflow-hidden bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-gray-400"
                        style={{ width: `${selfPct}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums w-6 text-right shrink-0" style={{ color: colors.textMuted }}>
                      {selfPct}%
                    </span>
                  </div>
                  {/* Witness bar — thinner */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1 rounded-full overflow-hidden bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-[#99b3e0]"
                        style={{ width: `${witnessPct}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums w-6 text-right shrink-0" style={{ color: colors.textMuted }}>
                      {witnessPct}%
                    </span>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

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
    <div className={`rounded border border-gray-200 px-6 py-5 ${bg}`}>
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
    <Card className="px-5 py-4">
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
    </Card>
  )
}

// ── DomainComparisonRow ───────────────────────────────────────────────────────
function DomainComparisonRow({ selfScore, witnessScore, label, barColor, domainKey }) {
  const selfPct    = ((selfScore - 1) / 4) * 100
  const witnessPct = witnessScore !== null ? ((witnessScore - 1) / 4) * 100 : null

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: colors.textPrimary }}>
          {domainKey && <DimensionIcon domain={domainKey} size={15} className={DOMAIN_ICON_COLOR[domainKey]} />}
          {label}
        </span>
        <div className="flex items-center gap-3 text-sm font-semibold shrink-0">
          <span style={{ color: colors.textMuted }}>{selfScore.toFixed(1)}</span>
          {witnessPct !== null && (
            <span className="text-[#0047ba]">{witnessScore.toFixed(1)}</span>
          )}
        </div>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${selfPct}%` }} />
      </div>
      {witnessPct !== null && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
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
          <p className="text-sm mb-4" style={{ color: colors.textMuted }}>{t('witnessResults.noSelf')}</p>
          <Button variant="primary" onClick={() => navigate('/full-moon')} className="shadow-sm">
            {t('witnessResults.startFmCta')}
          </Button>
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

  // Combined role: self × 2/3 + witness × 1/3 (falls back to selfRole when no witnesses)
  const combinedRole = computeCombinedRole(selfRole, witnessRole)

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
          <SectionLabel color="blue" className="mb-1 flex items-center gap-1.5">
            <FullMoonIcon size={13} />Full Moon Cèrcol
          </SectionLabel>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.textPrimary }}>
            {t('witnessResults.title')}
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            {t('witnessResults.subtitle')}
          </p>
        </div>

        {/* ── Section 1: Combined role card (top, full width) ── */}
        <section>
          <SectionLabel color="gray" className="mb-4">
            {t('witnessResults.combinedRoleSection')}
          </SectionLabel>
          <Card accent="red" className="overflow-hidden">
            <div className="flex flex-row">
              {/* Left: icon column — full card height, icon centred */}
              <div className="w-40 shrink-0 flex items-center justify-center">
                <RoleIcon role={combinedRole.role} size={128} style={{ color: colors.red }} />
              </div>
              {/* Right: content */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col gap-4">
                {isDefinitive ? (
                  <div className="flex flex-col gap-1">
                    <Badge className="self-start bg-[#e8eef8] text-[#0047ba]">
                      {t('witnessResults.definitiveLabel')}
                    </Badge>
                    <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                      {t('witnessResults.definitiveNote')}
                    </p>
                  </div>
                ) : (
                  <Badge variant="beta" className="self-start">
                    {t('roles.beta_label')}
                  </Badge>
                )}
                <h2
                  className="text-4xl sm:text-5xl font-bold leading-tight"
                  style={{ color: colors.textPrimary }}
                >
                  {t(`roles.${combinedRole.role}.name`)}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: colors.textMuted }}>
                  {t(`roles.${combinedRole.role}.essence`)}
                </p>
                {combinedRole.arc.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: colors.textMuted }}
                    >
                      {t('roles.arc_label')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {combinedRole.arc.map(r => (
                        <Badge key={r} variant="default">
                          {t(`roles.${r}.name`)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* ── Section 2: Combined probability bars ── */}
        <section>
          <CombinedRoleBars
            combinedResult={combinedRole}
            selfResult={selfRole}
            witnessResult={witnessRole}
            t={t}
          />
        </section>

        {/* ── Section 3: Convergence (if ≥2 complete) ── */}
        {hasEnoughWitnesses && convergence !== null && (
          <section>
            <SectionLabel color="gray" className="mb-4">
              {t('witnessResults.convergenceSection')}
            </SectionLabel>
            <ConvergenceMeter ratio={convergence} t={t} />
          </section>
        )}

        {/* ── Section 4: Blind spots (if ≥2 complete) ── */}
        {hasEnoughWitnesses && (
          <section>
            <SectionLabel color="gray" className="mb-1 flex items-center gap-1.5">
              <BlindSpotsIcon size={16} />{t('witnessResults.blindSpotsTitle')}
            </SectionLabel>
            <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
              {t('witnessResults.blindSpotsNote')}
            </p>
            {divergence.length === 0 ? (
              <Card className="px-5 py-4">
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  {t('witnessResults.noDivergence')}
                </p>
              </Card>
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

        {/* ── Section 5: Domain comparison — two-column layout ── */}
        <section>
          <SectionLabel color="gray" className="mb-4">
            {t('witnessResults.domainsSection')}
          </SectionLabel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Radar chart */}
            <Card className="shadow-sm p-5">
              <RadarChart
                scores={selfReport}
                domainKeys={DOMAIN_KEYS}
                labelFn={(key) => t(`fmDomains.${key}.name`)}
              />
            </Card>

            {/* Domain comparison rows */}
            <Card className="shadow-sm p-5">
              {witnessScores && (
                <div className="flex items-center gap-4 text-xs font-medium mb-3" style={{ color: colors.textMuted }}>
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
              <div className="flex flex-col divide-y divide-gray-100">
                {DOMAIN_KEYS.map(key => (
                  <DomainComparisonRow
                    key={key}
                    selfScore={selfReport[key]}
                    witnessScore={witnessScores ? witnessScores[key] : null}
                    label={t(`fmDomains.${key}.name`)}
                    barColor={DOMAIN_BAR_COLOR[key]}
                    domainKey={key}
                  />
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* ── Section 6: Witness sessions + invite CTA ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <SectionLabel color="gray">
              {t('witnessResults.witnessSessionsSection')}
            </SectionLabel>
            <span className="text-xs font-medium" style={{ color: colors.textMuted }}>
              {t('witnessResults.witnessCount', { count: completedSessions.length })}
            </span>
          </div>

          <Card className="shadow-sm p-5">
            {(completedSessions.length > 0 || pendingSessions.length > 0) && (
              <div className="flex flex-col gap-2 mb-4">
                {completedSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span style={{ color: colors.textPrimary }}>{s.witness_name}</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Done</span>
                  </div>
                ))}
                {pendingSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span style={{ color: colors.textPrimary }}>{s.witness_name}</span>
                    <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded" style={{ color: colors.textMuted }}>Waiting</span>
                  </div>
                ))}
              </div>
            )}
            {!hasEnoughWitnesses && (
              <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                {t('witnessResults.pendingNote')}
              </p>
            )}
            <Button variant="primary" onClick={() => navigate('/witness-setup')} className="w-full shadow-sm">
              {t('witnessResults.setupCta')}
            </Button>
          </Card>
        </section>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded px-5 py-4 text-xs leading-relaxed" style={{ color: colors.textMuted }}>
          {t('witnessResults.disclaimer')}
        </div>

      </div>
    </main>
  )
}
