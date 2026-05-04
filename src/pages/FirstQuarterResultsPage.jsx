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
import { encodeScores, decodeScores, CLIPBOARD_FEEDBACK_MS } from '../utils/share-url'
import { fqScoreToPercent, fqScoreLabel } from '../utils/first-quarter-scoring'
import { logResult } from '../utils/logger'
import { computeRole } from '../utils/role-scoring'
import { FullMoonIcon, ShareIcon, FirstQuarterIcon } from '../components/MoonIcons'
import { useAuth } from '../context/AuthContext'
import { colors } from '../design/tokens'
import RoleProbabilityBars from '../components/RoleProbabilityBars'
import { Card, Button, Badge, SectionLabel } from '../components/ui'
import { DimensionRow, FacetAccordion, ReportPageHeader, RoleCard, RadarDataCard } from '../components/report'
import InstrumentNudge from '../components/InstrumentNudge'


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
      logResult(domains, i18n.language, 'firstQuarter', user?.id ?? null, facets)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleShare() {
    const encoded = encodeScores(domains)
    const url = `${window.location.origin}${window.location.pathname}?r=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), CLIPBOARD_FEEDBACK_MS)
    })
  }

  const domainKeys = DOMAIN_KEYS
  const roleResult = computeRole(domains)

  return (
    <main className="py-10 sm:py-16">
      <div className="flex flex-col gap-8">

        {/* Header */}
        <ReportPageHeader
          icon={<FirstQuarterIcon size={18} style={{ color: colors.textMuted }} />}
          eyebrow={t('home.firstQuarter.name')}
          title={t('fqResults.title')}
          subtitle={t('fqResults.subtitle')}
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
            badge={<Badge variant="beta" className="self-start">{t('roles.beta_label')}</Badge>}
          />
        </section>

        {/* ── Section 2: Radar (col 1) + Dimension rows (col 2) + Prob bars (col 3) ── */}
        <section>
          <RadarDataCard
            scores={domains}
            domainKeys={domainKeys}
            labelFn={(key) => t(`fqDomains.${key}.name`)}
          >
            <div>
              <SectionLabel color="gray" className="mb-3">
                {t('fqResults.domainSection')}
              </SectionLabel>
              <div className="flex flex-col divide-y divide-gray-100">
                {domainKeys.map((key) => {
                  const score = domains[key]
                  const tier  = fqScoreLabel(score)
                  return (
                    <div key={key} className="py-3 first:pt-0 last:pb-0">
                      <DimensionRow
                        domainKey={key}
                        domainName={t(`fqDomains.${key}.name`)}
                        score={score}
                        pct={fqScoreToPercent(score)}
                        labelTier={tier}
                        labelText={t(`fqResults.scoreLabels.${tier}`)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            <RoleProbabilityBars result={roleResult} bare />
          </RadarDataCard>
        </section>

        {/* ── Section 3: 30 facets accordion (only when facets available) ── */}
        {facets && (
          <section>
            <SectionLabel color="gray" className="mb-4">
              {t('fqResults.facetSection')}
            </SectionLabel>
            <FacetAccordion
              domainKeys={domainKeys}
              domainMeta={FQ_DOMAIN_META}
              facets={facets}
              scoreToPercent={fqScoreToPercent}
              scoreLabel={fqScoreLabel}
              domainNs="fqDomains"
              labelNs="fqResults"
              facetCountLabel={t('fqResults.facetsCount')}
              domainDescFn={(key) => {
                const score = domains[key]
                const v = score > 3.5 ? 'high' : score < 2.5 ? 'low' : null
                return v ? t(`dimensions.${key}.${v}`) : null
              }}
              t={t}
            />
          </section>
        )}

        {/* ── Section 4: Full Moon nudge ── */}
        <InstrumentNudge target="fullMoon" />

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
