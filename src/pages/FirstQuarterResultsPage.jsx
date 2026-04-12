/**
 * FirstQuarterResultsPage — Cèrcol First Quarter results.
 * 5 domains · 30 facets · IPIP-NEO-60
 *
 * Receives scores via:
 *   a) location.state.{ domains, facets, fromTest } — from FirstQuarterPage navigation
 *   b) ?r=BASE64 query param — encoded domain scores for sharing
 *      (facet scores not available in shared links)
 *
 * All facets are shown unconditionally — First Quarter is a free instrument.
 */
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FQ_DOMAIN_META } from '../data/first-quarter'
import { DOMAIN_KEYS } from '../data/domains'
import { fqScoreToPercent, fqScoreLabel } from '../utils/first-quarter-scoring'
import { logResult } from '../utils/logger'
import { computeRole } from '../utils/role-scoring'
import { RoleIcon } from '../components/MoonIcons'
import { FullMoonIcon, ShareIcon, DimensionIcon } from '../components/MoonIcons'
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

const DOMAIN_ICON_COLOR = {
  depth:      'text-red-500',
  presence:   'text-amber-400',
  vision:     'text-[#427c42]',
  bond:       'text-emerald-500',
  discipline: 'text-blue-600',
}

const DOMAIN_BAR_HEX = {
  depth:      '#ef4444',
  presence:   '#fbbf24',
  vision:     '#427c42',
  bond:       '#10b981',
  discipline: '#2563eb',
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

export default function FirstQuarterResultsPage() {
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
      logResult(domains, i18n.language, 'firstQuarter', user?.id ?? null)
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

  const [expandedDomains, setExpandedDomains] = useState(
    Object.fromEntries(domainKeys.map((k, i) => [k, i === 0]))
  )

  function toggleDomain(key) {
    setExpandedDomains(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <main className="py-10 sm:py-16">
      <div className="flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.textPrimary }}>{t('fqResults.title')}</h1>
          <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>{t('fqResults.subtitle')}</p>
        </div>

        {/* ── Section 1: Role card (full width, red left border) ── */}
        <section>
          <Card accent="red" className="overflow-hidden">
            <div className="flex flex-row">
              <div className="w-40 shrink-0 flex items-center justify-center">
                <RoleIcon role={roleResult.role} size={128} style={{ color: colors.red }} />
              </div>
              <div className="flex-1 p-6 sm:p-8 flex flex-col gap-4">
                <Badge variant="beta" className="self-start">
                  {t('roles.beta_label')}
                </Badge>
                <h2
                  className="text-5xl sm:text-6xl font-bold leading-tight"
                  style={{ color: colors.textPrimary }}
                >
                  {t(`roles.${roleResult.role}.name`)}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: colors.textMuted }}>
                  {t(`roles.${roleResult.role}.essence`)}
                </p>
                {roleResult.arc.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                      {t('roles.arc_label')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {roleResult.arc.map(r => (
                        <Badge key={r} variant="default">{t(`roles.${r}.name`)}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* ── Section 2: Radar (left) + Role probability bars (right) ── */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm p-5 flex items-center justify-center">
              <RadarChart
                scores={domains}
                domainKeys={domainKeys}
                labelFn={(key) => t(`fqDomains.${key}.name`)}
              />
            </Card>
            <RoleProbabilityBars result={roleResult} columns={1} />
          </div>
        </section>

        {/* ── Section 3: 30 facets accordion (only when facets available) ── */}
        {facets && (
          <section>
            <SectionLabel color="gray" className="mb-4">
              {t('fqResults.facetSection')}
            </SectionLabel>
            <div className="flex flex-col gap-2">
              {domainKeys.map((domainKey) => {
                const domainFacets = FQ_DOMAIN_META[domainKey].facets
                const isExpanded   = expandedDomains[domainKey] ?? false
                const barHex       = DOMAIN_BAR_HEX[domainKey]

                return (
                  <Card key={domainKey} className="overflow-hidden">
                    {/* Domain header row — clickable */}
                    <button
                      onClick={() => toggleDomain(domainKey)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: barHex }}
                      />
                      <span className="text-sm font-semibold flex-1" style={{ color: colors.textPrimary }}>
                        {t(`fqDomains.${domainKey}.name`)}
                      </span>
                      <span className="text-xs" style={{ color: colors.textMuted }}>
                        {domainFacets.length} {t('fqResults.facetsCount')}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                        style={{ color: colors.textMuted }}
                      >
                        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {/* Facet grid — shown when expanded */}
                    {isExpanded && (
                      <div className="px-5 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                          {domainFacets.map((facetKey) => {
                            const facetScore       = facets[facetKey]
                            const facetPct         = fqScoreToPercent(facetScore)
                            const facetLabel       = fqScoreLabel(facetScore)
                            const facetDescVariant = facetScore > 3.5 ? 'high' : facetScore < 2.5 ? 'low' : null
                            return (
                              <div key={facetKey}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                                    {t(`fqFacets.${facetKey}.label`)}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    <span className="text-xs font-semibold tabular-nums" style={{ color: colors.textMuted }}>
                                      {facetScore}/5
                                    </span>
                                    <span
                                      className="text-xs font-semibold px-1.5 py-0.5 rounded"
                                      style={{
                                        backgroundColor: barHex + '22',
                                        color: barHex,
                                      }}
                                    >
                                      {t(`fqResults.scoreLabels.${facetLabel}`)}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${facetPct}%`, backgroundColor: barHex }}
                                  />
                                </div>
                                {facetDescVariant && (
                                  <p className="text-xs leading-relaxed mt-1" style={{ color: colors.textMuted }}>
                                    {t(`fqFacets.${facetKey}.${facetDescVariant}`)}
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Section 4: Full Moon upgrade CTA ── */}
        <Card accent="blue" className="p-5">
          <div className="flex items-start gap-3">
            <FullMoonIcon size={22} style={{ color: colors.blue, flexShrink: 0, marginTop: 2 }} />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: colors.blue }}>
                {t('fqResults.fullMoonCta.eyebrow')}
              </p>
              <h3 className="font-bold mb-1" style={{ color: colors.textPrimary }}>
                {t('fqResults.fullMoonCta.heading')}
              </h3>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: colors.textMuted }}>
                {t('fqResults.fullMoonCta.body')}
              </p>
              <Button variant="primary" onClick={() => navigate('/full-moon')} className="shadow-sm">
                {t('fqResults.fullMoonCta.cta')}
              </Button>
            </div>
          </div>
        </Card>

        {/* ── Actions row ── */}
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleShare} className="flex-1 shadow-sm gap-1.5">
            {!copied && <ShareIcon size={15} />}{copied ? t('fqResults.copied') : t('fqResults.share')}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            {t('fqResults.retake')}
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded px-5 py-4 text-xs leading-relaxed" style={{ color: colors.textMuted }}>
          {t('fqResults.disclaimer')}
        </div>

      </div>
    </main>
  )
}
