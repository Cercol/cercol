/**
 * FullMoonResultsPage — unified Full Moon result page.
 *
 * Score resolution (in priority order):
 *   1. location.state.domains — from FullMoonPage navigation after test
 *   2. ?r=BASE64 — shared link (domain scores only; facets not available)
 *   3. Supabase — most recent fullMoon row for authenticated users navigating directly
 *
 * Phase 2 (async): if authenticated and NOT a shared link, loads Witness sessions
 * and layers them on top when present. Skipped entirely for shared links.
 *
 * Render order:
 *   role card → radar + domain rows + probability bars → facet accordion →
 *   convergence meter (≥2 witnesses) → blind spots (≥2 witnesses) →
 *   witness session list + invite CTA → actions → disclaimer
 */
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FM_DOMAIN_META } from '../data/full-moon'
import { DOMAIN_KEYS } from '../data/domains'
import { fmScoreToPercent, fmScoreLabel } from '../utils/full-moon-scoring'
import { logResult } from '../utils/logger'
import { computeRole } from '../utils/role-scoring'
import { averageWitnessScores, detectDivergence, computeConvergence, computeCombinedRole } from '../utils/witness-scoring'
import { getMyWitnessSessions } from '../lib/api'
import { supabase } from '../lib/supabase'
import { FullMoonIcon, ShareIcon, DimensionIcon, BlindSpotsIcon } from '../components/MoonIcons'
import { useAuth } from '../context/AuthContext'
import { colors } from '../design/tokens'
import RoleProbabilityBars from '../components/RoleProbabilityBars'
import { Card, Button, Badge, SectionLabel } from '../components/ui'
import { DimensionRow, FacetAccordion, ConvergenceMeter, ReportPageHeader, RoleCard, RadarDataCard } from '../components/report'

const DOMAIN_ICON_COLOR = {
  depth:      'text-red-500',
  presence:   'text-amber-400',
  vision:     'text-[#427c42]',
  bond:       'text-emerald-500',
  discipline: 'text-blue-600',
}

const MIN_WITNESSES_FOR_REPORT = 2

function encodeScores(domains) {
  const ordered = DOMAIN_KEYS.map((k) => domains[k] ?? 0)
  return btoa(ordered.join(','))
}

function decodeScores(b64) {
  try {
    const values = atob(b64).split(',').map(Number)
    if (values.length !== DOMAIN_KEYS.length) return null
    return Object.fromEntries(DOMAIN_KEYS.map((k, i) => [k, values[i]]))
  } catch {
    return null
  }
}

export default function FullMoonResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const [copied, setCopied] = useState(false)
  const [sessions, setSessions] = useState([])
  const [loadedDomains, setLoadedDomains] = useState(null)
  const [loadedFacets, setLoadedFacets] = useState(null)
  const loggedRef = useRef(false)

  const stateScores  = location.state
  const sharedParam  = searchParams.get('r')
  const isSharedLink = Boolean(sharedParam)

  // Scores available synchronously (from state or ?r= param)
  let stateDomains = null
  let stateFacets  = null
  let fromTest     = false

  if (stateScores?.domains) {
    stateDomains = stateScores.domains
    stateFacets  = stateScores.facets ?? null
    fromTest     = stateScores.fromTest === true
  } else if (sharedParam) {
    stateDomains = decodeScores(sharedParam)
  }

  // Effective domains and facets: synchronous source first, Supabase fallback second
  const domains = stateDomains ?? loadedDomains
  const facets  = stateFacets ?? loadedFacets

  // Supabase fallback: load domains (+ facets) when navigating directly (no state, no ?r=)
  useEffect(() => {
    if (stateDomains !== null) return    // already have scores
    if (isSharedLink) return             // bad ?r= param → handled below
    if (authLoading) return              // wait for auth to resolve
    if (!user) { navigate('/'); return } // not authenticated → home

    supabase
      .from('results')
      .select('presence,bond,discipline,depth,vision,facets')
      .eq('user_id', user.id)
      .eq('instrument', 'fullMoon')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.length) {
          const r = data[0]
          setLoadedDomains({
            presence:   r.presence,
            bond:       r.bond,
            discipline: r.discipline,
            depth:      r.depth,
            vision:     r.vision,
          })
          setLoadedFacets(r.facets ?? null)
        } else {
          navigate('/')
        }
      })
      .catch(() => navigate('/'))
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Log on real test completion only
  useEffect(() => {
    if (fromTest && domains && !loggedRef.current) {
      loggedRef.current = true
      logResult(domains, i18n.language, 'fullMoon', user?.id ?? null, stateFacets)
    }
  }, [domains]) // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 2: load Witness sessions (skipped for shared links)
  useEffect(() => {
    if (isSharedLink || authLoading || !user) return
    getMyWitnessSessions()
      .then(setSessions)
      .catch(() => {}) // silently fail — solo result still renders
  }, [user, authLoading, isSharedLink]) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if ?r= param is malformed
  if (isSharedLink && stateDomains === null) {
    navigate('/')
    return null
  }

  // Loading: waiting for auth to resolve or Supabase to return
  if (!domains) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-gray-400">{t('witnessResults.loading')}</p>
      </main>
    )
  }

  function handleShare() {
    const encoded = encodeScores(domains)
    const url = `${window.location.origin}${window.location.pathname}?r=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const domainKeys = DOMAIN_KEYS
  const selfRole   = computeRole(domains)

  const completedSessions  = sessions.filter(s => s.completed_at && s.scores)
  const pendingSessions    = sessions.filter(s => !s.completed_at)
  const hasEnoughWitnesses = completedSessions.length >= MIN_WITNESSES_FOR_REPORT
  const hasAnyWitness      = completedSessions.length >= 1

  const witnessScores = hasAnyWitness
    ? averageWitnessScores(completedSessions.map(s => s.scores))
    : null
  const witnessRole = witnessScores ? computeRole(witnessScores) : null

  // Combined role: self × 2/3 + witness × 1/3 (falls back to selfRole when no witnesses)
  const roleResult = computeCombinedRole(selfRole, witnessRole)

  const divergence = hasEnoughWitnesses
    ? detectDivergence(domains, witnessScores)
    : []
  const convergence = (hasEnoughWitnesses && witnessRole)
    ? computeConvergence(selfRole, witnessRole)
    : null

  const showWitnessSection = !isSharedLink && (fromTest || user != null)

  const headerSubtitle = hasAnyWitness
    ? t('witnessResults.subtitle')
    : t('fmResults.subtitle')

  return (
    <main className="py-10 sm:py-16">
      <div className="flex flex-col gap-8">

        {/* Header */}
        <ReportPageHeader
          icon={<FullMoonIcon size={18} style={{ color: colors.textMuted }} />}
          eyebrow={t('home.fullMoon.name')}
          title={t('fmResults.title')}
          subtitle={headerSubtitle}
        />

        {/* ── Section 1: Role card ── */}
        <section>
          <RoleCard
            role={roleResult.role}
            roleName={t(`roles.${roleResult.role}.name`)}
            roleEssence={t(`roles.${roleResult.role}.essence`)}
            arc={roleResult.arc}
            arcName={(r) => t(`roles.${r}.name`)}
            arcLabel={t('roles.arc_label')}
            badge={
              hasEnoughWitnesses ? (
                <Badge className="self-start bg-[#e8eef8] text-[#0047ba]">
                  {t('witnessResults.definitiveLabel')}
                </Badge>
              ) : (
                <Badge variant="beta" className="self-start">
                  {t('roles.beta_label')}
                </Badge>
              )
            }
            badgeNote={hasEnoughWitnesses ? t('witnessResults.definitiveNote') : undefined}
          />
        </section>

        {/* ── Section 2: Radar (col 1) + Domain rows (col 2) + Prob bars (col 3) ── */}
        <section>
          <RadarDataCard
            scores={domains}
            domainKeys={domainKeys}
            labelFn={(key) => t(`fmDomains.${key}.name`)}
          >
            <div>
              <SectionLabel color="gray" className="mb-3">
                {t('fmResults.domainSection')}
              </SectionLabel>
              {witnessScores && (
                <div className="flex items-center gap-4 text-xs font-medium mb-3" style={{ color: colors.textMuted }}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-sm inline-block" style={{ backgroundColor: '#9ca3af' }} />
                    {t('witnessResults.selfLabel')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-0.5 h-3 rounded-sm" style={{ backgroundColor: colors.blue }} />
                    {t('witnessResults.witnessLabel')}
                  </span>
                </div>
              )}
              <div className="flex flex-col divide-y divide-gray-100">
                {domainKeys.map((key) => {
                  const score  = domains[key]
                  const tier   = fmScoreLabel(score)
                  const wScore = witnessScores ? witnessScores[key] : undefined
                  return (
                    <div key={key} className="py-3 first:pt-0 last:pb-0">
                      <DimensionRow
                        domainKey={key}
                        domainName={t(`fmDomains.${key}.name`)}
                        score={score}
                        pct={fmScoreToPercent(score)}
                        labelTier={tier}
                        labelText={t(`fmResults.scoreLabels.${tier}`)}
                        witnessScore={wScore}
                        witnessPct={wScore != null ? fmScoreToPercent(wScore) : undefined}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            <RoleProbabilityBars result={roleResult} bare />
          </RadarDataCard>
        </section>

        {/* ── Section 3: Facet accordion ── */}
        {facets && (
          <section>
            <SectionLabel color="gray" className="mb-4">
              {t('fmResults.facetSection')}
            </SectionLabel>
            <FacetAccordion
              domainKeys={domainKeys}
              domainMeta={FM_DOMAIN_META}
              facets={facets}
              scoreToPercent={fmScoreToPercent}
              scoreLabel={fmScoreLabel}
              domainNs="fmDomains"
              labelNs="fmResults"
              facetCountLabel={t('fqResults.facetsCount')}
              domainDescFn={(key) => {
                const score = domains[key]
                const v = !witnessScores && (score > 3.5 ? 'high' : score < 2.5 ? 'low' : null)
                return v ? t(`dimensions.${key}.${v}`) : null
              }}
              t={t}
            />
          </section>
        )}

        {/* ── Section 4: Convergence meter (≥2 witnesses) ── */}
        {hasEnoughWitnesses && convergence !== null && (
          <section>
            <SectionLabel color="gray" className="mb-4">
              {t('witnessResults.convergenceSection')}
            </SectionLabel>
            <ConvergenceMeter ratio={convergence} t={t} />
          </section>
        )}

        {/* ── Section 5: Blind spots (≥2 witnesses) ── */}
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
              <Card className="px-5 py-4">
                <ul className="flex flex-col gap-2.5">
                  {divergence.map(({ domain, selfScore, witnessScore }) => {
                    const direction  = witnessScore > selfScore ? 'witnessHigher' : 'selfHigher'
                    const desc       = t(`witnessResults.blindSpots.${domain}.${direction}`)
                    const domainName = t(`fmDomains.${domain}.name`)
                    return (
                      <li key={domain} className="text-sm leading-relaxed flex items-start gap-2">
                        <DimensionIcon
                          domain={domain}
                          size={14}
                          className={`mt-0.5 shrink-0 ${DOMAIN_ICON_COLOR[domain]}`}
                        />
                        <span style={{ color: colors.textMuted }}>
                          <span className="font-semibold" style={{ color: colors.textPrimary }}>
                            {domainName}:
                          </span>{' '}
                          {desc}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            )}
          </section>
        )}

        {/* ── Section 6: Witness session list + invite CTA ── */}
        {showWitnessSection && (
          <section>
            {user != null ? (
              /* Authenticated: full session list */
              <>
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
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Done
                          </span>
                        </div>
                      ))}
                      {pendingSessions.map(s => (
                        <div key={s.id} className="flex items-center justify-between text-sm">
                          <span style={{ color: colors.textPrimary }}>{s.witness_name}</span>
                          <span
                            className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded"
                            style={{ color: colors.textMuted }}
                          >
                            Waiting
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!hasEnoughWitnesses && (
                    <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                      {t('witnessResults.pendingNote')}
                    </p>
                  )}
                  <Button
                    variant="primary"
                    onClick={() => navigate('/witness-setup')}
                    className="w-full shadow-sm"
                  >
                    {t('witnessResults.setupCta')}
                  </Button>
                </Card>
              </>
            ) : (
              /* Not authenticated (fromTest): simple invite CTA */
              <Card className="shadow-sm p-5">
                <SectionLabel color="blue" className="mb-2 flex items-center gap-1.5">
                  <FullMoonIcon size={13} />{t('fmResults.witnessCta.eyebrow')}
                </SectionLabel>
                <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  {t('fmResults.witnessCta.heading')}
                </h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: colors.textMuted }}>
                  {t('fmResults.witnessCta.body')}
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/witness-setup')}
                  className="w-full shadow-sm"
                >
                  {t('fmResults.witnessCta.cta')}
                </Button>
              </Card>
            )}
          </section>
        )}

        {/* ── Actions row ── */}
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleShare} className="flex-1 shadow-sm gap-1.5">
            {!copied && <ShareIcon size={15} />}
            {copied ? t('fmResults.copied') : t('fmResults.share')}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            {t('fmResults.retake')}
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded px-5 py-4 text-xs leading-relaxed" style={{ color: colors.textMuted }}>
          {t('fmResults.disclaimer')}
        </div>

      </div>
    </main>
  )
}
