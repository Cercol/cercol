/**
 * FullMoonResultsPage — Cèrcol Full Moon results.
 * 5 domains · 30 facets · IPIP-NEO-120
 *
 * Receives scores via:
 *   a) location.state.{ domains, facets, fromTest } — from FullMoonPage navigation
 *   b) ?r=BASE64 query param — encoded domain scores for sharing
 *      (facet scores not available in shared links)
 *
 * All facets are shown unconditionally — Full Moon is the complete portrait.
 * Facet labels and descriptions reuse the fqFacets namespace (same 30 facets).
 */
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FM_DOMAIN_META } from '../data/full-moon'
import { DOMAIN_KEYS } from '../data/domains'
import { fmScoreToPercent, fmScoreLabel } from '../utils/full-moon-scoring'
import { logResult } from '../utils/logger'
import { computeRole } from '../utils/role-scoring'
import { useAuth } from '../context/AuthContext'
import { colors } from '../design/tokens'
import RadarChart from '../components/RadarChart'
import RoleProbabilityBars from '../components/RoleProbabilityBars'
import { Card, Button, Badge, SectionLabel } from '../components/ui'

const LABEL_STYLES = {
  low:      'bg-gray-100 text-gray-600',
  moderate: 'bg-blue-100 text-blue-700',
  high:     'bg-[#0047ba] text-white',
}

const DOMAIN_BAR_COLOR = {
  depth:      'bg-red-500',
  presence:   'bg-amber-400',
  vision:     'bg-[#427c42]',
  bond:       'bg-emerald-500',
  discipline: 'bg-blue-600',
}

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
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const loggedRef = useRef(false)

  const stateScores = location.state
  const sharedParam = searchParams.get('r')

  let domains  = null
  let facets   = null
  let fromTest = false

  if (stateScores?.domains) {
    domains  = stateScores.domains
    facets   = stateScores.facets ?? null
    fromTest = stateScores.fromTest === true
  } else if (sharedParam) {
    domains = decodeScores(sharedParam)
  }

  if (!domains) {
    navigate('/')
    return null
  }

  // Log on real test completion only
  useEffect(() => {
    if (fromTest && !loggedRef.current) {
      loggedRef.current = true
      logResult(domains, i18n.language, 'fullMoon', user?.id ?? null)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleShare() {
    const encoded = encodeScores(domains)
    const url = `${window.location.origin}${window.location.pathname}?r=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const domainKeys = DOMAIN_KEYS
  const roleResult = computeRole(domains)

  return (
    <main className="py-10 sm:py-16">
      <div className="flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.textPrimary }}>{t('fmResults.title')}</h1>
          <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>{t('fmResults.subtitle')}</p>
        </div>

        {/* ── Section 1: Role (top, full width) ── */}
        <section>
          <Card accent="red" className="p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              <Badge variant="beta" className="self-start">
                {t('roles.beta_label')}
              </Badge>
              <h2
                className="text-4xl sm:text-5xl font-bold leading-tight"
                style={{ color: colors.textPrimary }}
              >
                {t(`roles.${roleResult.role}.name`)}
              </h2>
              <p className="text-base leading-relaxed" style={{ color: colors.textMuted }}>
                {t(`roles.${roleResult.role}.essence`)}
              </p>
              {roleResult.arc.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: colors.textMuted }}
                  >
                    {t('roles.arc_label')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roleResult.arc.map(r => (
                      <Badge key={r} variant="default">
                        {t(`roles.${r}.name`)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* ── Section 2: Radar + domain rows ── */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Radar chart */}
            <Card className="shadow-sm p-5">
              <RadarChart
                scores={domains}
                domainKeys={domainKeys}
                labelFn={(key) => t(`fmDomains.${key}.name`)}
              />
            </Card>

            {/* Domain rows */}
            <Card className="shadow-sm p-5">
              <SectionLabel color="gray" className="mb-3">
                {t('fmResults.domainSection')}
              </SectionLabel>
              <div className="flex flex-col divide-y divide-gray-100">
                {domainKeys.map((key) => {
                  const score = domains[key]
                  const pct = fmScoreToPercent(score)
                  const label = fmScoreLabel(score)
                  const barColor = DOMAIN_BAR_COLOR[key]
                  const descVariant = score > 3.5 ? 'high' : score < 2.5 ? 'low' : null
                  return (
                    <div key={key} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                          {t(`fmDomains.${key}.name`)}
                        </span>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                            {score}<span className="text-xs font-normal" style={{ color: colors.textMuted }}>/5</span>
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${LABEL_STYLES[label]}`}>
                            {t(`fmResults.scoreLabels.${label}`)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      {descVariant && (
                        <p className="text-xs leading-relaxed mt-1.5" style={{ color: colors.textMuted }}>
                          {t(`dimensions.${key}.${descVariant}`)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </section>

        {/* ── Section 3: Role probability bars (2-column) ── */}
        <section>
          <RoleProbabilityBars result={roleResult} columns={2} />
        </section>

        {/* ── Section 4: Facet breakdown ── */}
        {facets && (
          <section>
            <SectionLabel color="gray" className="mb-4">
              {t('fmResults.facetSection')}
            </SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {domainKeys.map((domainKey) => {
                const domainFacets = FM_DOMAIN_META[domainKey].facets
                return (
                  <Card key={domainKey} className="shadow-sm p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                      <span className={`w-2 h-2 rounded-full inline-block ${DOMAIN_BAR_COLOR[domainKey]}`} />
                      {t(`fmDomains.${domainKey}.name`)}
                    </h3>
                    <div className="flex flex-col gap-4">
                      {domainFacets.map((facetKey) => {
                        const facetScore       = facets[facetKey]
                        const facetPct         = fmScoreToPercent(facetScore)
                        const facetLabel       = fmScoreLabel(facetScore)
                        const facetDescVariant = facetScore > 3.5 ? 'high' : facetScore < 2.5 ? 'low' : null
                        return (
                          <div key={facetKey}>
                            <div className="flex items-center justify-between mb-1">
                              {/* Reuse fqFacets — same 30 facets, same names and descriptions */}
                              <span className="text-sm" style={{ color: colors.textPrimary }}>{t(`fqFacets.${facetKey}.label`)}</span>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{facetScore}/5</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${LABEL_STYLES[facetLabel]}`}>
                                  {t(`fmResults.scoreLabels.${facetLabel}`)}
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${DOMAIN_BAR_COLOR[domainKey]}`}
                                style={{ width: `${facetPct}%` }}
                              />
                            </div>
                            {facetDescVariant && (
                              <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                                {t(`fqFacets.${facetKey}.${facetDescVariant}`)}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Witness Cèrcol CTA ── */}
        {fromTest && (
          <Card className="shadow-sm p-5">
            <SectionLabel color="blue" className="mb-2">
              🌕 {t('fmResults.witnessCta.eyebrow')}
            </SectionLabel>
            <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>
              {t('fmResults.witnessCta.heading')}
            </h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: colors.textMuted }}>
              {t('fmResults.witnessCta.body')}
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={() => navigate('/witness-setup')} className="w-full shadow-sm">
                {t('fmResults.witnessCta.cta')}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/full-moon/report')} className="w-full">
                {t('fmResults.witnessCta.report')}
              </Button>
            </div>
          </Card>
        )}

        {/* ── Actions row ── */}
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleShare} className="flex-1 shadow-sm">
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
