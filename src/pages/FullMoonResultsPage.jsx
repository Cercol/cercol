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
import { RoleIcon } from '../components/MoonIcons'
import { FullMoonIcon, ShareIcon, DimensionIcon } from '../components/MoonIcons'
import { useAuth } from '../context/AuthContext'
import { colors } from '../design/tokens'
import RadarChart from '../components/RadarChart'
import RoleProbabilityBars from '../components/RoleProbabilityBars'
import { Card, Button, Badge, SectionLabel } from '../components/ui'
import { DimensionRow, FacetAccordion } from '../components/report'

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
          <Card accent="red" className="overflow-hidden">
            <div className="flex flex-row">
              {/* Left: icon column — full card height, icon centred */}
              <div className="w-40 shrink-0 flex items-center justify-center">
                <RoleIcon role={roleResult.role} size={128} style={{ color: colors.red }} />
              </div>
              {/* Right: content */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col gap-4">
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {domainKeys.map((key) => {
                  const score = domains[key]
                  const tier  = fmScoreLabel(score)
                  const descVariant = score > 3.5 ? 'high' : score < 2.5 ? 'low' : null
                  return (
                    <DimensionRow
                      key={key}
                      domainKey={key}
                      domainName={t(`fmDomains.${key}.name`)}
                      score={score}
                      pct={fmScoreToPercent(score)}
                      labelTier={tier}
                      labelText={t(`fmResults.scoreLabels.${tier}`)}
                      description={descVariant ? t(`dimensions.${key}.${descVariant}`) : undefined}
                    />
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
            <FacetAccordion
              domainKeys={domainKeys}
              domainMeta={FM_DOMAIN_META}
              facets={facets}
              scoreToPercent={fmScoreToPercent}
              scoreLabel={fmScoreLabel}
              domainNs="fmDomains"
              labelNs="fmResults"
              facetCountLabel={t('fqResults.facetsCount')}
              t={t}
            />
          </section>
        )}

        {/* ── Witness Cèrcol CTA ── */}
        {fromTest && (
          <Card className="shadow-sm p-5">
            <SectionLabel color="blue" className="mb-2 flex items-center gap-1.5">
              <FullMoonIcon size={13} />{t('fmResults.witnessCta.eyebrow')}
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
          <Button variant="primary" onClick={handleShare} className="flex-1 shadow-sm gap-1.5">
            {!copied && <ShareIcon size={15} />}{copied ? t('fmResults.copied') : t('fmResults.share')}
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
