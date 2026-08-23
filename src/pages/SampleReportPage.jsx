/**
 * SampleReportPage — public, prerendered example report at /sample.
 *
 * A no-account, no-API, no-state view showing what a Cèrcol result looks
 * like, built entirely from a fixed synthetic profile (src/data/sample-profile).
 * Prerendered to static HTML in the six languages so crawlers and cold
 * visitors can see "what do I get" without taking the test.
 *
 * It renders the **Full Moon** report, because that is what it claims to be
 * and what a visitor is deciding whether to spend twenty minutes on. Until
 * 2026-08-22 it showed four of that report's eight sections from a New Moon
 * profile, so the example of the long instrument was shorter than the result
 * of the short one.
 *
 * Everything here is computed from the sample profile by the same functions
 * the real report uses: the role from computeRole, the facet rollup from the
 * scorer's own mean, the self-versus-peer comparison from compareRoleViews.
 * Nothing is hardcoded prose. If the scoring changes, this page changes with
 * it, which is the only way an example stays honest.
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { navHref } from '../lib/navigation'
import usePageMeta from '../hooks/usePageMeta'
import {
  DimensionRow, FacetAccordion, MethodologyNote, RadarDataCard,
  ReportPageHeader, RoleCard, RoleComparisonView, SurprisesPanel,
} from '../components/report'
import RoleProbabilityBars from '../components/RoleProbabilityBars'
import { SectionLabel } from '../components/ui'
import { FM_DOMAIN_META } from '../data/full-moon'
import {
  SAMPLE_FM_DOMAINS, SAMPLE_FM_FACETS, SAMPLE_WITNESS_COUNT, SAMPLE_WITNESS_DOMAINS,
} from '../data/sample-profile'
import { computeRole } from '../utils/role-scoring'
import { compareRoleViews } from '../utils/witness-scoring'
import { roleOgImage } from '../utils/role-share'
import { fmScoreLabel, fmScoreToPercent } from '../utils/full-moon-scoring'
import { FullMoonIcon } from '../components/MoonIcons'
import { colors } from '../design/tokens'

const DOMAIN_KEYS = Object.keys(FM_DOMAIN_META)

export default function SampleReportPage() {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language || 'en').slice(0, 2)

  const selfResult = computeRole(SAMPLE_FM_DOMAINS, 'fullMoon')
  const witnessResult = computeRole(SAMPLE_WITNESS_DOMAINS, 'fullMoon')
  const roleComparison = compareRoleViews(selfResult, witnessResult)
  const { role } = selfResult

  usePageMeta({
    title: t('sample.title'),
    description: t('sample.subtitle'),
    image: roleOgImage(role),
    // The Full Moon sample moved here when /sample became the First Quarter
    // one. Left pointing at /sample/ this would have declared the other page
    // as its canonical, and told a crawler these two are the same document.
    path: '/sample/full-moon/',
  })

  return (
    <main className="py-10 sm:py-16">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto px-4">
        <ReportPageHeader
          icon={<FullMoonIcon size={18} style={{ color: colors.textMuted }} />}
          eyebrow={t('sample.eyebrow')}
          title={t('sample.title')}
          subtitle={t('sample.subtitle')}
        />

        <RoleCard
          role={role}
          roleName={t(`roles.${role}.name`)}
          roleEssence={t(`roles.${role}.essence`)}
        />

        {/* Radar, the five dimensions with the peer view beside them, and the
            role probabilities: the same three-column card the real report uses. */}
        <section>
          <RadarDataCard
            scores={SAMPLE_FM_DOMAINS}
            domainKeys={DOMAIN_KEYS}
            labelFn={(key) => t(`fmDomains.${key}.name`)}
          >
            <div>
              <SectionLabel color="gray" className="mb-3">{t('sample.domainSection')}</SectionLabel>
              <div className="flex items-center gap-4 text-xs font-medium mb-3" style={{ color: colors.textMuted }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-sm inline-block" style={{ backgroundColor: colors.selfBar }} />
                  {t('witnessResults.selfLabel')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-0.5 h-3 rounded-sm" style={{ backgroundColor: colors.blue }} />
                  {t('witnessResults.witnessLabel')}
                </span>
              </div>
              <div className="flex flex-col divide-y divide-gray-100">
                {DOMAIN_KEYS.map((key) => {
                  const score = SAMPLE_FM_DOMAINS[key]
                  const witnessScore = SAMPLE_WITNESS_DOMAINS[key]
                  const tier = fmScoreLabel(score)
                  return (
                    <div key={key} className="py-3 first:pt-0 last:pb-0">
                      <DimensionRow
                        domainKey={key}
                        domainName={t(`fmDomains.${key}.name`)}
                        score={score}
                        pct={fmScoreToPercent(score)}
                        labelTier={tier}
                        labelText={t(`fmResults.scoreLabels.${tier}`)}
                        witnessScore={witnessScore}
                        witnessPct={fmScoreToPercent(witnessScore)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            <RoleProbabilityBars result={selfResult} bare />
          </RadarDataCard>
        </section>

        {/* The thirty facets. This is the section that makes the difference
            between the long instrument and the short one visible. */}
        <section>
          <SectionLabel color="gray" className="mb-4">{t('fmResults.facetSection')}</SectionLabel>
          <FacetAccordion
            domainKeys={DOMAIN_KEYS}
            domainMeta={FM_DOMAIN_META}
            facets={SAMPLE_FM_FACETS}
            scoreToPercent={fmScoreToPercent}
            scoreLabel={fmScoreLabel}
            domainNs="fmDomains"
            labelNs="fmResults"
            facetCountLabel={t('fqResults.facetsCount')}
            t={t}
          />
        </section>

        {roleComparison && (
          <section>
            <SectionLabel color="gray" className="mb-4">{t('witnessResults.roleViewSection')}</SectionLabel>
            <RoleComparisonView roleComparison={roleComparison} t={t} />
          </section>
        )}

        {roleComparison?.surprises.length > 0 && (
          <section>
            <SectionLabel color="gray" className="mb-1">{t('witnessResults.surprisesSection')}</SectionLabel>
            <p className="text-xs mb-4" style={{ color: colors.textMuted }}>{t('witnessResults.surprisesNote')}</p>
            <SurprisesPanel surprises={roleComparison.surprises} t={t} />
          </section>
        )}

        <MethodologyNote>{t('sample.synthetic', { count: SAMPLE_WITNESS_COUNT })}</MethodologyNote>

        {/* What the reader is looking at, before what they can do about it.
            This report is the 120-item instrument with Witness ratings on top;
            the page used to offer it under "your own profile is two minutes
            away", which promised something the two-minute test cannot give.
            The easy entry stays the primary action, it just stops pretending
            to be the same thing. /full-moon is not linked: it bounces an
            anonymous visitor to /auth, so /instruments carries it publicly. */}
        <div className="text-center">
          <p className="mx-auto mb-5 max-w-lg text-sm leading-relaxed text-gray-500">
            {t('sample.whatThisIs')}
          </p>
          <Link
            to={navHref({ to: '/new-moon' }, lang)}
            className="font-semibold inline-flex items-center justify-center transition-colors rounded text-sm px-5 py-2.5 bg-[var(--mm-color-blue)] text-white hover:opacity-90"
          >
            {t('sample.cta')}
          </Link>
          <p className="mt-3 text-xs text-gray-500">{t('sample.cta_note')}</p>
          <p className="mt-5 text-xs">
            <Link to={navHref({ to: '/instruments' }, lang)} className="text-[var(--mm-color-blue)] hover:underline">
              {t('sample.seeAll')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
