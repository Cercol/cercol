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
import RoleResult from '../components/RoleResult'
import RoleProbabilityBars from '../components/RoleProbabilityBars'

const LABEL_STYLES = {
  low:      'bg-gray-100 text-gray-600',
  moderate: 'bg-blue-100 text-blue-700',
  high:     'bg-blue-600 text-white',
}

const DOMAIN_BAR_COLOR = {
  depth:      'bg-red-500',
  presence:   'bg-amber-400',
  vision:     'bg-purple-500',
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
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('fmResults.title')}</h1>
          <p className="mt-1 text-gray-500 text-sm">{t('fmResults.subtitle')}</p>
        </div>

        {/* ── Section 1: Domain radar chart ── */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
            {t('fmResults.domainSection')}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <RadarChart
              scores={domains}
              domainKeys={domainKeys}
              labelFn={(key) => t(`fmDomains.${key}.name`)}
            />
          </div>

          {/* Domain score cards */}
          <div className="flex flex-col gap-3 mt-4">
            {domainKeys.map((key) => {
              const score = domains[key]
              const pct = fmScoreToPercent(score)
              const label = fmScoreLabel(score)
              const barColor = DOMAIN_BAR_COLOR[key]
              const descVariant = score > 3.5 ? 'high' : score < 2.5 ? 'low' : null

              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{t(`fmDomains.${key}.name`)}</h3>
                    <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                      <span className="text-xl font-bold text-gray-900">
                        {score}<span className="text-sm font-normal text-gray-400">/5</span>
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[label]}`}>
                        {t(`fmResults.scoreLabels.${label}`)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  {descVariant && (
                    <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
                      {t(`dimensions.${key}.${descVariant}`)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Section 2: Facet breakdown ── */}
        {facets && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              {t('fmResults.facetSection')}
            </h2>
            <div className="flex flex-col gap-6">
              {domainKeys.map((domainKey) => {
                const domainFacets = FM_DOMAIN_META[domainKey].facets
                return (
                  <div key={domainKey} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full inline-block ${DOMAIN_BAR_COLOR[domainKey]}`} />
                      {t(`fmDomains.${domainKey}.name`)}
                    </h3>
                    <div className="flex flex-col gap-5">
                      {domainFacets.map((facetKey) => {
                        const facetScore       = facets[facetKey]
                        const facetPct         = fmScoreToPercent(facetScore)
                        const facetLabel       = fmScoreLabel(facetScore)
                        const facetDescVariant = facetScore > 3.5 ? 'high' : facetScore < 2.5 ? 'low' : null

                        return (
                          <div key={facetKey}>
                            <div className="flex items-center justify-between mb-1">
                              {/* Reuse fqFacets — same 30 facets, same names and descriptions */}
                              <span className="text-sm text-gray-700">{t(`fqFacets.${facetKey}.label`)}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">{facetScore}/5</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[facetLabel]}`}>
                                  {t(`fmResults.scoreLabels.${facetLabel}`)}
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
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
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Section 3: Role result (beta) ── */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
            {t('fmResults.roleSection')}
          </h2>
          <div className="flex flex-col gap-4">
            <RoleResult result={roleResult} />
            <RoleProbabilityBars result={roleResult} />
          </div>
        </section>

        {/* ── Share + actions ── */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
          >
            {copied ? t('fmResults.copied') : t('fmResults.share')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {t('fmResults.retake')}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-xl px-5 py-4 text-xs text-gray-500 leading-relaxed">
          {t('fmResults.disclaimer')}
        </div>

      </div>
    </main>
  )
}
