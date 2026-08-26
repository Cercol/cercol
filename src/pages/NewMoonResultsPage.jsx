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
import { decodeScores, CLIPBOARD_FEEDBACK_MS } from '../utils/share-url'
import { shareResult } from '../utils/role-share'
import { radarScoreToPercent, radarScoreLabel } from '../utils/new-moon-scoring'
import { logResult } from '../utils/logger'
import AccuracyRating from '../components/AccuracyRating'
import { useAuth } from '../context/AuthContext'
import { colors } from '../design/tokens'
import { Card, Button, SectionLabel } from '../components/ui'
import { NewMoonIcon } from '../components/MoonIcons'
import { DimensionRow, ReportPageHeader, RadarDataCard, MethodologyNote } from '../components/report'
import InstrumentNudge from '../components/InstrumentNudge'
import SaveResultCard from '../components/SaveResultCard'


export default function NewMoonResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  // Set once the result row exists; the accuracy question needs its id.
  const [resultId, setResultId] = useState(null)
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

  useEffect(() => {
    if (!scores) navigate('/')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!scores) return null

  // Log on real test completion only
  useEffect(() => {
    if (fromTest && !loggedRef.current) {
      loggedRef.current = true
      logResult(scores, i18n.language, 'newMoon', user?.id ?? null).then(setResultId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleShare() {
    // 'newMoon' matters: these scores are on 1-7 and must be measured
    // against the 1-7 prior (see priorFor in role-scoring.js).
    shareResult(scores, t, () => {
      setCopied(true)
      setTimeout(() => setCopied(false), CLIPBOARD_FEEDBACK_MS)
    }, 'newMoon')
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

        {/* ── Save-to-account bridge: only for a result just taken, which is
             the one that exists in the database with no owner ── */}
        {fromTest && <SaveResultCard instrument="newMoon" />}

        {/* ── Next instrument nudge ── */}
        <InstrumentNudge target="firstQuarter" />

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
        <AccuracyRating resultId={resultId} />

        <MethodologyNote>{t('newMoonResults.disclaimer')}</MethodologyNote>

      </div>
    </main>
  )
}
