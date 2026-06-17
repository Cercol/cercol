/**
 * SampleReportPage — public, prerendered example report at /sample.
 *
 * A no-account, no-API, no-state view that shows what a Cèrcol result looks
 * like, built entirely from a fixed synthetic profile (src/data/sample-profile).
 * Prerendered to static HTML (path-based in the six languages) so crawlers and
 * cold visitors can see "what do I get" without taking the test. Reuses the
 * report components and the per-role OG image from the share loop (E1).
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import usePageMeta from '../hooks/usePageMeta'
import { DimensionRow, ReportPageHeader, RadarDataCard, RoleCard } from '../components/report'
import { SectionLabel } from '../components/ui'
import { DOMAIN_KEYS } from '../data/domains'
import { SAMPLE_SCORES, SAMPLE_MAX_SCORE } from '../data/sample-profile'
import { computeRole } from '../utils/role-scoring'
import { roleOgImage } from '../utils/role-share'
import { radarScoreToPercent, radarScoreLabel } from '../utils/new-moon-scoring'
import { NewMoonIcon } from '../components/MoonIcons'
import { colors } from '../design/tokens'

export default function SampleReportPage() {
  const { t } = useTranslation()
  const { role } = computeRole(SAMPLE_SCORES)

  usePageMeta({
    title: t('sample.title'),
    description: t('sample.subtitle'),
    image: roleOgImage(role),
    path: '/sample/',
  })

  return (
    <main className="py-10 sm:py-16">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto px-4">
        <ReportPageHeader
          icon={<NewMoonIcon size={18} style={{ color: colors.textMuted }} />}
          eyebrow={t('sample.eyebrow')}
          title={t('sample.title')}
          subtitle={t('sample.subtitle')}
        />

        <RoleCard
          role={role}
          roleName={t(`roles.${role}.name`)}
          roleEssence={t(`roles.${role}.essence`)}
        />

        <section>
          <RadarDataCard
            scores={SAMPLE_SCORES}
            maxScore={SAMPLE_MAX_SCORE}
            domainKeys={DOMAIN_KEYS}
            labelFn={(key) => t(`fqDomains.${key}.name`)}
          >
            <div>
              <SectionLabel color="gray" className="mb-3">{t('sample.domainSection')}</SectionLabel>
              <div className="flex flex-col divide-y divide-gray-100">
                {DOMAIN_KEYS.map((key) => {
                  const score = SAMPLE_SCORES[key]
                  const tier = radarScoreLabel(score)
                  return (
                    <div key={key} className="py-3 first:pt-0 last:pb-0">
                      <DimensionRow
                        domainKey={key}
                        domainName={t(`fqDomains.${key}.name`)}
                        score={score}
                        pct={radarScoreToPercent(score)}
                        labelTier={tier}
                        labelText={t(`results.scoreLabels.${tier}`)}
                        maxScore={SAMPLE_MAX_SCORE}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </RadarDataCard>
        </section>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">{t('sample.cta_note')}</p>
          <Link
            to="/new-moon"
            className="font-semibold inline-flex items-center justify-center transition-colors rounded text-sm px-5 py-2.5 bg-[var(--mm-color-blue)] text-white hover:opacity-90"
          >
            {t('sample.cta')}
          </Link>
        </div>
      </div>
    </main>
  )
}
