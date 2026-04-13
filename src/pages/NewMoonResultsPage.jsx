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
import { Card, Button, SectionLabel } from '../components/ui'
import { NewMoonIcon } from '../components/MoonIcons'
import { DimensionRow, ReportPageHeader, RadarDataCard } from '../components/report'

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
        <ReportPageHeader
          icon={<NewMoonIcon size={18} style={{ color: colors.textMuted }} />}
          eyebrow={t('home.newMoon.name')}
          title={t('newMoonResults.title')}
          subtitle={t('newMoonResults.subtitle')}
        />

        {/* ── Radar + domain rows ── */}
        <section>
          <RadarDataCard
            scores={scores}
            maxScore={7}
            domainKeys={domainKeys}
            labelFn={(key) => t(`fqDomains.${key}.name`)}
          >
            <div>
              <SectionLabel color="gray" className="mb-3">
                {t('newMoonResults.domainSection')}
              </SectionLabel>
              <div className="flex flex-col divide-y divide-gray-100">
                {domainKeys.map((key) => {
                  const score = scores[key]
                  const pct = radarScoreToPercent(score)
                  const tier = radarScoreLabel(score)
                  return (
                    <div key={key} className="py-3 first:pt-0 last:pb-0">
                      <DimensionRow
                        domainKey={key}
                        domainName={t(`fqDomains.${key}.name`)}
                        score={score}
                        pct={pct}
                        labelTier={tier}
                        labelText={t(`results.scoreLabels.${tier}`)}
                        maxScore={7}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </RadarDataCard>
        </section>

        {/* ── Upgrade prompt ── */}
        <Card className="px-6 py-5 flex flex-col gap-3 bg-gray-50 border-gray-200">
          <div>
            <p className="font-semibold" style={{ color: colors.textPrimary }}>{t('newMoonResults.upgrade.heading')}</p>
            <p className="text-sm mt-1" style={{ color: colors.textMuted }}>{t('newMoonResults.upgrade.body')}</p>
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

        {/* ── Actions row ── */}
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleShare} className="flex-1 shadow-sm">
            {copied ? t('newMoonResults.copied') : t('newMoonResults.share')}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            {t('newMoonResults.retake')}
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded px-5 py-4 text-xs leading-relaxed" style={{ color: colors.textMuted }}>
          {t('newMoonResults.disclaimer')}
        </div>

      </div>
    </main>
  )
}
