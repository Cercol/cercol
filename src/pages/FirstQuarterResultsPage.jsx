/**
 * FirstQuarterResultsPage — Cèrcol First Quarter results.
 * 5 domains · 30 facets · IPIP-NEO-60
 *
 * Receives scores via:
 *   a) location.state.{ domains, facets, fromTest } — from FirstQuarterPage navigation
 *   b) ?r=BASE64 query param — encoded domain scores for sharing
 *      (facet scores not available in shared links)
 *
 * Premium gate:
 *   Facet breakdown is hidden for non-premium users.
 *   Clicking "Unlock" creates a Stripe Checkout session.
 *   Facets are saved to sessionStorage before the Stripe redirect
 *   so they survive the round-trip back to this page.
 */
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FQ_DOMAIN_META } from '../data/first-quarter'
import { DOMAIN_KEYS } from '../data/domains'
import { fqScoreToPercent, fqScoreLabel } from '../utils/first-quarter-scoring'
import { logResult } from '../utils/logger'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { createCheckoutSession } from '../lib/api'
import { colors } from '../design/tokens'
import RadarChart from '../components/RadarChart'

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

const FACETS_SESSION_KEY = 'cercol_fq_facets'

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
  const [premium, setPremium] = useState(null)    // null = loading
  const [checkingOut, setCheckingOut] = useState(false)
  const loggedRef = useRef(false)

  const stateScores  = location.state
  const sharedParam  = searchParams.get('r')
  const paymentParam = searchParams.get('payment')

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

  // Restore facets from sessionStorage after a Stripe redirect
  if (!facets && paymentParam) {
    try {
      const saved = sessionStorage.getItem(FACETS_SESSION_KEY)
      if (saved) facets = JSON.parse(saved)
    } catch { /* ignore */ }
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

  // Check premium status whenever user is known
  useEffect(() => {
    if (!user) { setPremium(false); return }
    supabase
      .from('profiles')
      .select('premium')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setPremium(data?.premium ?? false))
  }, [user])

  // Clear sessionStorage once payment confirmed and premium loaded
  useEffect(() => {
    if (paymentParam === 'success' && premium === true) {
      sessionStorage.removeItem(FACETS_SESSION_KEY)
    }
  }, [paymentParam, premium])

  async function handleUnlock() {
    if (!user) { navigate('/auth'); return }
    try {
      setCheckingOut(true)
      // Persist facets so they survive the Stripe redirect
      if (facets) sessionStorage.setItem(FACETS_SESSION_KEY, JSON.stringify(facets))
      const { url } = await createCheckoutSession()
      window.location.href = url
    } catch {
      setCheckingOut(false)
    }
  }

  function handleShare() {
    const encoded = encodeScores(domains)
    const url = `${window.location.origin}${window.location.pathname}?r=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const domainKeys     = DOMAIN_KEYS
  const facetsUnlocked = premium === true
  const showFacets     = facets && facetsUnlocked
  const showGate       = facets && !facetsUnlocked

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl mx-auto flex flex-col gap-8">

        {/* Payment success banner */}
        {paymentParam === 'success' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 text-sm text-emerald-800 font-medium">
            {t('fqResults.paymentSuccess')}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('fqResults.title')}</h1>
          <p className="mt-1 text-gray-500 text-sm">{t('fqResults.subtitle')}</p>
        </div>

        {/* ── Section 1: Domain radar chart ── */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
            {t('fqResults.domainSection')}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <RadarChart
              scores={domains}
              domainKeys={domainKeys}
              labelFn={(key) => t(`fqDomains.${key}.name`)}
            />
          </div>

          {/* Domain score cards */}
          <div className="flex flex-col gap-3 mt-4">
            {domainKeys.map((key) => {
              const score = domains[key]
              const pct = fqScoreToPercent(score)
              const label = fqScoreLabel(score)
              const barColor = DOMAIN_BAR_COLOR[key]
              const descVariant = score > 3.5 ? 'high' : score < 2.5 ? 'low' : null

              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{t(`fqDomains.${key}.name`)}</h3>
                    <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                      <span className="text-xl font-bold text-gray-900">
                        {score}<span className="text-sm font-normal text-gray-400">/5</span>
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[label]}`}>
                        {t(`fqResults.scoreLabels.${label}`)}
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

        {/* ── Section 2: Facet breakdown (premium) ── */}
        {facets && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              {t('fqResults.facetSection')}
            </h2>

            {/* Gate overlay — shown for non-premium users who have facet data */}
            {showGate && (
              <div className="relative">
                {/* Blurred preview of first domain */}
                <div className="pointer-events-none select-none blur-sm opacity-60">
                  {(() => {
                    const domainKey = domainKeys[0]
                    const domainFacets = FQ_DOMAIN_META[domainKey].facets
                    return (
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full inline-block ${DOMAIN_BAR_COLOR[domainKey]}`} />
                          {t(`fqDomains.${domainKey}.name`)}
                        </h3>
                        <div className="flex flex-col gap-5">
                          {domainFacets.map((facetKey) => {
                            const facetScore = facets[facetKey]
                            const facetPct   = fqScoreToPercent(facetScore)
                            const facetLabel = fqScoreLabel(facetScore)
                            return (
                              <div key={facetKey}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-700">{t(`fqFacets.${facetKey}.label`)}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{facetScore}/5</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[facetLabel]}`}>
                                      {t(`fqResults.scoreLabels.${facetLabel}`)}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${DOMAIN_BAR_COLOR[domainKey]}`}
                                    style={{ width: `${facetPct}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* CTA overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200">
                  <p className="text-base font-bold text-gray-900 mb-1">{t('fqResults.unlock.heading')}</p>
                  <p className="text-sm text-gray-500 mb-5 text-center px-6">{t('fqResults.unlock.body')}</p>
                  <button
                    onClick={handleUnlock}
                    disabled={checkingOut}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors"
                  >
                    {checkingOut ? t('fqResults.unlock.loading') : t('fqResults.unlock.cta')}
                  </button>
                  {!user && (
                    <p className="mt-3 text-xs text-gray-400">{t('fqResults.unlock.signInNote')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Full facet breakdown — premium users only */}
            {showFacets && (
              <div className="flex flex-col gap-6">
                {domainKeys.map((domainKey) => {
                  const domainFacets = FQ_DOMAIN_META[domainKey].facets
                  return (
                    <div key={domainKey} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full inline-block ${DOMAIN_BAR_COLOR[domainKey]}`} />
                        {t(`fqDomains.${domainKey}.name`)}
                      </h3>
                      <div className="flex flex-col gap-5">
                        {domainFacets.map((facetKey) => {
                          const facetScore      = facets[facetKey]
                          const facetPct        = fqScoreToPercent(facetScore)
                          const facetLabel      = fqScoreLabel(facetScore)
                          const facetDescVariant = facetScore > 3.5 ? 'high' : facetScore < 2.5 ? 'low' : null

                          return (
                            <div key={facetKey}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700">{t(`fqFacets.${facetKey}.label`)}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-900">{facetScore}/5</span>
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[facetLabel]}`}>
                                    {t(`fqResults.scoreLabels.${facetLabel}`)}
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
            )}
          </section>
        )}

        {/* ── Share + actions ── */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
          >
            {copied ? t('fqResults.copied') : t('fqResults.share')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {t('fqResults.retake')}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-xl px-5 py-4 text-xs text-gray-500 leading-relaxed">
          {t('fqResults.disclaimer')}
        </div>

      </div>
    </main>
  )
}
