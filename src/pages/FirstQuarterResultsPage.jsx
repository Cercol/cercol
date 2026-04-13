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
import { FullMoonIcon, ShareIcon, FirstQuarterIcon } from '../components/MoonIcons'
import { useAuth } from '../context/AuthContext'
import { colors } from '../design/tokens'
import RoleProbabilityBars from '../components/RoleProbabilityBars'
import { Card, Button, Badge, SectionLabel } from '../components/ui'
import { DimensionRow, FacetAccordion, ReportPageHeader, RoleCard, RadarDataCard } from '../components/report'

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
      logResult(domains, i18n.language, 'firstQuarter', user?.id ?? null, facets)
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
              t={t}
            />
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
