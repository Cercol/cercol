/**
 * RadarResultsPage — Cèrcol Radar results: domain radar chart + upgrade prompt.
 *
 * Receives scores via:
 *   a) location.state.{ scores, fromTest } — from RadarTestPage navigation
 *   b) ?r=BASE64 query param — encoded domain scores for sharing
 */
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DOMAIN_KEYS } from '../data/domains'
import { radarScoreToPercent, radarScoreLabel } from '../utils/new-moon-scoring'
import { logResult } from '../utils/logger'
import { useAuth } from '../context/AuthContext'
import { colors } from '../design/tokens'
import RadarChart from '../components/RadarChart'
import { Card, Button, SectionLabel } from '../components/ui'

const LABEL_STYLES = {
  low:      'bg-gray-100 text-gray-600',
  moderate: 'bg-blue-100 text-blue-700',
  high:     'bg-[#0047ba] text-white',
}

const DOMAIN_BAR_COLOR = {
  presence:   'bg-amber-400',
  bond:       'bg-emerald-500',
  discipline: 'bg-blue-600',
  depth:      'bg-red-500',
  vision:     'bg-[#427c42]',
}

function encodeScores(scores) {
  const ordered = DOMAIN_KEYS.map((k) => scores[k] ?? 0)
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

export default function NewMoonResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const loggedRef = useRef(false)

  const stateData = location.state
  const sharedParam = searchParams.get('r')

  let scores = null
  let fromTest = false

  if (stateData?.scores) {
    scores = stateData.scores
    fromTest = stateData.fromTest === true
  } else if (sharedParam) {
    scores = decodeScores(sharedParam)
  }

  if (!scores) {
    navigate('/')
    return null
  }

  // Log on real test completion only
  useEffect(() => {
    if (fromTest && !loggedRef.current) {
      loggedRef.current = true
      logResult(scores, i18n.language, 'newMoon', user?.id ?? null)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleShare() {
    const encoded = encodeScores(scores)
    const url = `${window.location.origin}${window.location.pathname}?r=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const domainKeys = DOMAIN_KEYS

  return (
    <main className="py-10 sm:py-16">
      <div className="flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('newMoonResults.title')}</h1>
          <p className="mt-1 text-gray-500 text-sm">{t('newMoonResults.subtitle')}</p>
        </div>

        {/* Radar chart */}
        <section>
          <SectionLabel color="gray" className="mb-4">
            {t('newMoonResults.domainSection')}
          </SectionLabel>
          <Card className="shadow-sm p-6">
            <RadarChart
              scores={scores}
              maxScore={7}
              domainKeys={domainKeys}
              labelFn={(key) => t(`domains.${key}.label`)}
            />
          </Card>

          {/* Domain score cards */}
          <div className="flex flex-col gap-3 mt-4">
            {domainKeys.map((key) => {
              const score = scores[key]
              const pct = radarScoreToPercent(score)
              const label = radarScoreLabel(score)
              const barColor = DOMAIN_BAR_COLOR[key]
              const descVariant = score >= 5.0 ? 'high' : score <= 2.9 ? 'low' : null

              return (
                <Card key={key} className="shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{t(`domains.${key}.label`)}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                      <span className="text-xl font-bold text-gray-900">
                        {score}<span className="text-sm font-normal text-gray-400">/7</span>
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[label]}`}>
                        {t(`results.scoreLabels.${label}`)}
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
                </Card>
              )
            })}
          </div>
        </section>

        {/* ── Upgrade prompt ── */}
        <Card className="px-6 py-5 flex flex-col gap-3 bg-gray-50 border-gray-200">
          <div>
            <p className="font-semibold text-gray-900">{t('newMoonResults.upgrade.heading')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('newMoonResults.upgrade.body')}</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/first-quarter')}
            className="self-start shadow-sm"
          >
            {t('newMoonResults.upgrade.cta')}
          </Button>
        </Card>

        {/* Share + retake */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="w-full py-3 rounded bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {copied ? t('newMoonResults.copied') : t('newMoonResults.share')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            {t('newMoonResults.retake')}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 leading-relaxed text-center">
          {t('newMoonResults.disclaimer')}
        </p>

      </div>
    </main>
  )
}
