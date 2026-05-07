/**
 * SciencePage — public informational page at /science.
 * No auth required. Explains the scientific foundation of Cèrcol:
 * open instruments, five-factor model, role taxonomy, Full Moon design,
 * academic references, and open-source statement.
 * Brand voice: grounded, accessible, no jargon (PRODUCT.md).
 */
import { useTranslation } from 'react-i18next'
import { Card, SectionLabel } from '../components/ui'
import { DimensionIcon, ExternalLinkIcon } from '../components/MoonIcons'
import { colors, DOMAIN_COLORS } from '../design/tokens'

const DIMENSION_KEYS = ['presence', 'bond', 'vision', 'discipline', 'depth']

function Section({ eyebrow, heading, children, accent = 'gray' }) {
  return (
    <section className="mb-12">
      {eyebrow && (
        <SectionLabel color={accent} className="mb-2">
          {eyebrow}
        </SectionLabel>
      )}
      <h2 className="text-xl font-bold text-gray-900 mb-4">{heading}</h2>
      {children}
    </section>
  )
}

// Academic references — same in all languages; not i18n'd
const REFERENCES = [
  {
    key: 'gosling2003',
    text: 'Gosling, S. D., Rentfrow, P. J., & Swann, W. B., Jr. (2003). A very brief measure of the Big Five personality domains. Journal of Research in Personality, 37, 504–528.',
    url: 'https://doi.org/10.1016/S0092-6566(03)00046-1',
  },
  {
    key: 'goldberg2006',
    text: 'Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. Journal of Research in Personality, 40, 84–96.',
    url: 'https://doi.org/10.1177/1073191106293419',
  },
  {
    key: 'johnson2014',
    text: 'Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory. Journal of Research in Personality, 51, 78–89.',
    url: 'https://doi.org/10.1016/j.jrp.2014.05.003',
  },
  {
    key: 'maples2019',
    text: 'Maples-Keller, J. L., et al. (2019). Using item response theory to develop a 60-item representation of the NEO PI-R using the IPIP. Psychological Assessment, 31(2), 188–203.',
    url: 'https://doi.org/10.1037/pas0000571',
  },
  {
    key: 'hofstee1992',
    text: 'Hofstee, W. K. B., De Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. Journal of Personality and Social Psychology, 63, 146–163.',
    url: 'https://doi.org/10.1037/0022-3514.63.1.146',
  },
  {
    key: 'digman1997',
    text: 'Digman, J. M. (1997). Higher-order factors of the Big Five. Journal of Personality and Social Psychology, 73, 1246–1256.',
    url: 'https://doi.org/10.1037/0022-3514.73.6.1246',
  },
  {
    key: 'bell2007',
    text: 'Bell, S. T. (2007). Deep-level composition variables as predictors of team performance: A meta-analysis. Journal of Applied Psychology, 92(3), 595–615.',
    url: 'https://doi.org/10.1037/0021-9010.92.3.595',
  },
  {
    key: 'barrick1991',
    text: 'Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. Personnel Psychology, 44(1), 1–26.',
    url: 'https://doi.org/10.1111/j.1744-6570.1991.tb00688.x',
  },
  {
    key: 'nestsiarovich2020',
    text: 'Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. PLoS ONE, 15(3), e0230069.',
    url: 'https://doi.org/10.1371/journal.pone.0230069',
  },
]

export default function SciencePage() {
  const { t } = useTranslation()

  return (
    <main className="py-12">

        {/* ── Open instruments ──────────────────────────────────── */}
        <Section
          eyebrow={t('science.openInstruments.eyebrow')}
          heading={t('science.openInstruments.heading')}
          accent="blue"
        >
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('science.openInstruments.body')}
          </p>
        </Section>

        {/* ── Five-factor model ─────────────────────────────────── */}
        <Section
          eyebrow={t('science.fiveFactors.eyebrow')}
          heading={t('science.fiveFactors.heading')}
          accent="amber"
        >
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {t('science.fiveFactors.body')}
          </p>
          <p className="text-xs text-gray-400 bg-gray-100 rounded px-4 py-3 leading-relaxed">
            {t('science.fiveFactors.note')}
          </p>
        </Section>

        {/* ── Five dimensions ───────────────────────────────────── */}
        <Section
          eyebrow={t('science.dimensions.eyebrow')}
          heading={t('science.dimensions.heading')}
          accent="red"
        >
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {t('science.dimensions.intro')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DIMENSION_KEYS.map((key) => (
              <Card key={key} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <DimensionIcon domain={key} size={16} style={{ color: DOMAIN_COLORS[key] }} />
                  <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                    {t(`fqDomains.${key}.name`)}
                  </span>
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    · {t(`science.dimensions.${key}.academic`)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-2" style={{ color: colors.textMuted }}>
                  {t(`science.dimensions.${key}.body`)}
                </p>
                <p className="text-xs" style={{ color: colors.textMuted, opacity: 0.7 }}>
                  {t(`science.dimensions.${key}.ref`)}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        {/* ── Role taxonomy ─────────────────────────────────────── */}
        <Section
          eyebrow={t('science.roles.eyebrow')}
          heading={t('science.roles.heading')}
          accent="green"
        >
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {t('science.roles.body')}
          </p>
          <Card className="px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded shrink-0 mt-0.5">
                Beta
              </span>
              <div>
                <p className="text-sm text-gray-700 leading-relaxed mb-1.5">
                  {t('science.roles.beta')}
                </p>
                <p className="text-xs text-gray-400">
                  {t('science.roles.betaNote')}
                </p>
              </div>
            </div>
          </Card>
        </Section>

        {/* ── Full Moon — three parts ───────────────────────────── */}
        <Section
          eyebrow={t('science.fullMoon.eyebrow')}
          heading={t('science.fullMoon.heading')}
          accent="green"
        >
          <div className="flex flex-col gap-4">

            {/* Self-report */}
            <Card className="px-5 py-4">
              <p className="text-sm font-bold text-gray-900 mb-1.5">
                {t('science.fullMoon.selfReport.heading')}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('science.fullMoon.selfReport.body')}
              </p>
            </Card>

            {/* Witness */}
            <Card className="px-5 py-4">
              <p className="text-sm font-bold text-gray-900 mb-1.5">
                {t('science.fullMoon.witness.heading')}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {t('science.fullMoon.witness.body')}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {t('science.fullMoon.witness.blindSpots')}
              </p>
              <div className="bg-gray-50 rounded px-4 py-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                  Ideal Witness
                </p>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  {t('science.fullMoon.witness.idealWitness')}
                </p>
              </div>
            </Card>

          </div>
        </Section>

        {/* ── Validation plan ───────────────────────────────────── */}
        <Section
          eyebrow={t('science.validation.eyebrow')}
          heading={t('science.validation.heading')}
          accent="amber"
        >
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {t('science.validation.body')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['n300', 'n1000', 'preprint'].map((key) => (
              <Card key={key} className="px-4 py-3">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
                  {t(`science.validation.milestones.${key}.label`)}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {t(`science.validation.milestones.${key}.desc`)}
                </p>
              </Card>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            {t('science.validation.note')}
          </p>
        </Section>

        {/* ── References ────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('science.sources.heading')}
          </h2>
          <div className="flex flex-col gap-2">
            {REFERENCES.map((ref) => (
              <Card key={ref.key} className="px-4 py-3 text-xs text-gray-500 leading-relaxed">
                {ref.url ? (
                  <>
                    {ref.text.replace(/\.$/, '')} —{' '}
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-gray-700 transition-colors"
                    >
                      {ref.url.replace('https://doi.org/', 'doi:')}
                    </a>
                  </>
                ) : (
                  ref.text
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* ── Open source ───────────────────────────────────────── */}
        <Card className="px-6 py-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">
            {t('science.openSource.heading')}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {t('science.openSource.body')}
          </p>
          <a
            href="https://github.com/cercol/cercol"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 underline transition-colors"
          >
            {t('science.openSource.cta')}
            <ExternalLinkIcon size={13} />
          </a>
        </Card>

    </main>
  )
}
