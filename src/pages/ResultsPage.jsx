/**
 * ResultsPage — Big Five domain radar + facet breakdown + share button.
 *
 * Receives scores via:
 *   a) location.state.{ domains, facets, fromTest } — from TestPage navigation
 *   b) ?r=BASE64 query param — encoded domain scores for sharing
 *      (facet scores are not available in shared links)
 */
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DOMAIN_META, FACET_META } from '../data/cercol-big-five'
import { scoreLabel, scoreToPercent } from '../utils/cbf-scoring'
import { logResult } from '../utils/logger'
import RadarChart from '../components/RadarChart'
import LanguageToggle from '../components/LanguageToggle'

// Maps scoreLabel key to Tailwind classes
const LABEL_STYLES = {
  low:      'bg-gray-100 text-gray-600',
  moderate: 'bg-blue-100 text-blue-700',
  high:     'bg-blue-600 text-white',
}

// Domain → Tailwind progress bar bg color
const DOMAIN_BAR_COLOR = {
  extraversion:          'bg-amber-400',
  agreeableness:         'bg-emerald-500',
  conscientiousness:     'bg-blue-600',
  negativeEmotionality:  'bg-red-500',
  openMindedness:        'bg-purple-500',
}

/** Encode domain scores as base64 for sharing */
function encodeScores(domains) {
  const ordered = Object.keys(DOMAIN_META).map((k) => domains[k] ?? 0)
  return btoa(ordered.join(','))
}

/** Decode base64 back to { domain: score } */
function decodeScores(b64) {
  try {
    const values = atob(b64).split(',').map(Number)
    const keys = Object.keys(DOMAIN_META)
    if (values.length !== keys.length) return null
    return Object.fromEntries(keys.map((k, i) => [k, values[i]]))
  } catch {
    return null
  }
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const [copied, setCopied] = useState(false)
  const loggedRef = useRef(false)

  // Resolve scores: from navigation state or from ?r= param
  const stateScores = location.state
  const sharedParam = searchParams.get('r')

  let domains = null
  let facets = null
  let fromTest = false

  if (stateScores?.domains) {
    domains = stateScores.domains
    facets = stateScores.facets ?? null
    fromTest = stateScores.fromTest === true
  } else if (sharedParam) {
    domains = decodeScores(sharedParam)
  }

  // Guard: no valid scores anywhere
  if (!domains) {
    navigate('/')
    return null
  }

  // Anonymous logging — fire once, only for real test completions
  useEffect(() => {
    if (fromTest && !loggedRef.current) {
      loggedRef.current = true
      logResult(domains, i18n.language, 'test')
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

  const domainKeys = Object.keys(DOMAIN_META)

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">{t('nav.brand')}</span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">{t('results.title')}</h1>
            <p className="mt-1 text-gray-500 text-sm">{t('results.subtitle')}</p>
          </div>
          <LanguageToggle />
        </div>

        {/* ── Section 1: Domain radar chart ── */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
            {t('results.domainSection')}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <RadarChart scores={domains} />
          </div>

          {/* Domain score cards */}
          <div className="flex flex-col gap-3 mt-4">
            {domainKeys.map((key) => {
              const score = domains[key]
              const pct = scoreToPercent(score)
              const label = scoreLabel(score)
              const barColor = DOMAIN_BAR_COLOR[key]

              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{t(`domains.${key}.label`)}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{t(`domains.${key}.description`)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                      <span className="text-xl font-bold text-gray-900">
                        {score}<span className="text-sm font-normal text-gray-400">/5</span>
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[label]}`}>
                        {t(`results.scoreLabels.${label}`)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Section 2: Facet breakdown (only available from real test) ── */}
        {facets && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              {t('results.facetSection')}
            </h2>
            <div className="flex flex-col gap-6">
              {domainKeys.map((domainKey) => {
                const domainFacets = DOMAIN_META[domainKey].facets

                return (
                  <div key={domainKey} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full inline-block ${DOMAIN_BAR_COLOR[domainKey]}`} />
                      {t(`domains.${domainKey}.label`)}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {domainFacets.map((facetKey) => {
                        const facetScore = facets[facetKey]
                        const facetPct = scoreToPercent(facetScore)
                        const facetLabel = scoreLabel(facetScore)

                        return (
                          <div key={facetKey}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-700">{t(`facets.${facetKey}`)}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">{facetScore}/5</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[facetLabel]}`}>
                                  {t(`results.scoreLabels.${facetLabel}`)}
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${DOMAIN_BAR_COLOR[domainKey]}`}
                                style={{ width: `${facetPct}%` }}
                              />
                            </div>
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

        {/* ── Section 3: Share + actions ── */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
          >
            {copied ? t('results.copied') : t('results.share')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {t('results.retake')}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-xl px-5 py-4 text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">{t('results.scoreLabels.moderate') ? '' : ''}</strong>
          {t('results.disclaimer')}
        </div>

      </div>
    </main>
  )
}
