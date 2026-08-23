/**
 * SampleFirstQuarterPage — the public example report at /sample.
 *
 * /sample used to show the Full Moon report, which is the paid instrument and
 * needs four Witnesses invited by hand. So the most motivated reader on the
 * page, the one who clicked "see a sample" instead of leaving, was shown a
 * beautiful artefact, told it costs money and four colleagues, and offered a
 * ten-question consolation prize. Meanwhile no sample existed for First
 * Quarter, which is where every blog card actually sends them.
 *
 * This is the same synthetic person as the Full Moon sample, read at the
 * resolution First Quarter gives: the same thirty facets from two items each
 * instead of four. Showing one person at both resolutions is the honest way
 * to say what the longer instrument adds, and it is why the Full Moon sample
 * stayed, at /sample/full-moon.
 *
 * Everything is computed by the functions the real report uses: the role from
 * computeRole, the facet rollup from the scorer's own mean. Nothing is
 * hardcoded prose, so if the scoring changes this page changes with it.
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { navHref } from '../lib/navigation'
import usePageMeta from '../hooks/usePageMeta'
import {
  DimensionRow, FacetAccordion, MethodologyNote, RadarDataCard,
  ReportPageHeader, RoleCard,
} from '../components/report'
import RoleProbabilityBars from '../components/RoleProbabilityBars'
import { Badge, SectionLabel } from '../components/ui'
import { FQ_DOMAIN_META } from '../data/first-quarter'
import { DOMAIN_KEYS } from '../data/domains'
import { SAMPLE_FM_DOMAINS, SAMPLE_FM_FACETS } from '../data/sample-profile'
import { computeRole } from '../utils/role-scoring'
import { fqScoreLabel, fqScoreToPercent } from '../utils/first-quarter-scoring'
import { roleOgImage } from '../utils/role-share'
import { FirstQuarterIcon } from '../components/MoonIcons'
import { colors } from '../design/tokens'

export default function SampleFirstQuarterPage() {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language || 'en').slice(0, 2)

  const domains = SAMPLE_FM_DOMAINS
  const facets = SAMPLE_FM_FACETS
  const domainKeys = DOMAIN_KEYS
  const roleResult = computeRole(domains, 'firstQuarter')

  usePageMeta({
    title: t('sample.fq.title'),
    description: t('sample.fq.subtitle'),
    image: roleOgImage(roleResult.role),
    path: '/sample/',
  })

  return (
    <main className="py-10 sm:py-16">
      <div className="flex flex-col gap-8">

        <ReportPageHeader
          icon={<FirstQuarterIcon size={18} style={{ color: colors.textMuted }} />}
          title={t('sample.fq.title')}
          subtitle={t('sample.fq.subtitle')}
        />

        {/* Section 1: the role. It is the first thing the real report shows
            and the one concrete thing on offer, and no blog card mentions it. */}
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

        {/* Section 2: radar, the five dimension rows, and the role probabilities. */}
        <section>
          <RadarDataCard
            scores={domains}
            domainKeys={domainKeys}
            labelFn={(key) => t(`fqDomains.${key}.name`)}
          >
            <div>
              <SectionLabel color="gray" className="mb-3">{t('fqResults.domainSection')}</SectionLabel>
              <div className="flex flex-col divide-y divide-gray-100">
                {domainKeys.map((key) => {
                  const score = domains[key]
                  const tier = fqScoreLabel(score)
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

        {/* Section 3: the thirty facets. This is the part worth the ten
            minutes, and it is the part the card promises by name. */}
        <section>
          <SectionLabel color="gray" className="mb-4">{t('fqResults.facetSection')}</SectionLabel>
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
            domainDescFn={(key) => {
              const score = domains[key]
              const v = score > 3.5 ? 'high' : score < 2.5 ? 'low' : null
              return v ? t(`dimensions.${key}.${v}`) : null
            }}
          />
        </section>

        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">{t('sample.fq.closing')}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={navHref({ to: '/first-quarter' }, lang)}
              className="inline-flex shrink-0 items-center rounded bg-[var(--mm-color-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              {t('sample.fq.cta')}
            </Link>
            <Link to="/sample/full-moon" className="text-sm text-[var(--mm-color-blue)] hover:underline">
              {t('sample.fq.seeFullMoon')}
            </Link>
          </div>
        </section>

        <MethodologyNote>{t('fqResults.disclaimer')}</MethodologyNote>
      </div>
    </main>
  )
}
