/**
 * SciencePage — public informational page at /science.
 * No auth required. Explains the scientific foundation of Cèrcol:
 * open instruments, five-factor model, role taxonomy, Full Moon design,
 * academic references, and open-source statement.
 * Brand voice: grounded, accessible, no jargon (PRODUCT.md).
 */
import { useTranslation } from 'react-i18next'

function Section({ eyebrow, heading, children, accent = 'text-gray-400' }) {
  return (
    <section className="mb-12">
      {eyebrow && (
        <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${accent}`}>
          {eyebrow}
        </p>
      )}
      <h2 className="text-xl font-bold text-gray-900 mb-4">{heading}</h2>
      {children}
    </section>
  )
}

// Academic references — same in all languages; not i18n'd
const REFERENCES = [
  {
    key: 'tipi',
    text: 'Gosling, S. D., Rentfrow, P. J., & Swann, W. B., Jr. (2003). A very brief measure of the Big Five personality domains. Journal of Research in Personality, 37, 504–528.',
    url: null,
  },
  {
    key: 'ipip',
    text: 'Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. Journal of Research in Personality, 40, 84–96.',
    url: 'https://doi.org/10.1177/1073191106293419',
  },
  {
    key: 'ipip-neo-60',
    text: 'Maples-Keller, J. L., et al. (2019). Using item response theory to develop a 60-item representation of the NEO PI-R using the IPIP. Psychological Assessment, 31(2), 188–203.',
    url: 'https://doi.org/10.1037/pas0000571',
  },
  {
    key: 'ab5c',
    text: 'Hofstee, W. K. B., De Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. Journal of Personality and Social Psychology, 63, 146–163.',
    url: null,
  },
  {
    key: 'digman',
    text: 'Digman, J. M. (1997). Higher-order factors of the Big Five. Journal of Personality and Social Psychology, 73, 1246–1256.',
    url: null,
  },
  {
    key: 'nestsiarovich',
    text: 'Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. PLoS ONE. PMC7071388.',
    url: 'https://doi.org/10.1371/journal.pone.0230069',
  },
  {
    key: 'johnson2014',
    text: 'Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory. Journal of Research in Personality, 51, 78–89.',
    url: 'https://doi.org/10.1016/j.jrp.2014.05.003',
  },
  {
    key: 'maples2019',
    text: 'Maples-Keller, J. L., et al. (2019). [Normative data for IPIP-NEO-60.] Psychological Assessment, 31(2).',
    url: 'https://doi.org/10.1080/00223891.2018.1467425',
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
          accent="text-blue-600"
        >
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('science.openInstruments.body')}
          </p>
        </Section>

        {/* ── Five-factor model ─────────────────────────────────── */}
        <Section
          eyebrow={t('science.fiveFactors.eyebrow')}
          heading={t('science.fiveFactors.heading')}
          accent="text-amber-500"
        >
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {t('science.fiveFactors.body')}
          </p>
          <p className="text-xs text-gray-400 bg-gray-100 rounded-xl px-4 py-3 leading-relaxed">
            {t('science.fiveFactors.note')}
          </p>
        </Section>

        {/* ── Role taxonomy ─────────────────────────────────────── */}
        <Section
          eyebrow={t('science.roles.eyebrow')}
          heading={t('science.roles.heading')}
          accent="text-purple-600"
        >
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {t('science.roles.body')}
          </p>
          <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md shrink-0 mt-0.5">
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
          </div>
        </Section>

        {/* ── Full Moon — three parts ───────────────────────────── */}
        <Section
          eyebrow={t('science.fullMoon.eyebrow')}
          heading={t('science.fullMoon.heading')}
          accent="text-purple-600"
        >
          <div className="flex flex-col gap-4">

            {/* Self-report */}
            <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
              <p className="text-sm font-bold text-gray-900 mb-1.5">
                {t('science.fullMoon.selfReport.heading')}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('science.fullMoon.selfReport.body')}
              </p>
            </div>

            {/* Witness */}
            <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
              <p className="text-sm font-bold text-gray-900 mb-1.5">
                {t('science.fullMoon.witness.heading')}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {t('science.fullMoon.witness.body')}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {t('science.fullMoon.witness.blindSpots')}
              </p>
              <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                  Ideal Witness
                </p>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  {t('science.fullMoon.witness.idealWitness')}
                </p>
              </div>
            </div>

          </div>
        </Section>

        {/* ── References ────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('science.sources.heading')}
          </h2>
          <div className="flex flex-col gap-2">
            {REFERENCES.map((ref) => (
              <div key={ref.key} className="text-xs text-gray-500 leading-relaxed bg-white rounded-xl border border-gray-200 px-4 py-3">
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
              </div>
            ))}
          </div>
        </section>

        {/* ── Open source ───────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">
            {t('science.openSource.heading')}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {t('science.openSource.body')}
          </p>
          <a
            href="https://github.com/miquelmatoses/cercol"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 underline transition-colors"
          >
            {t('science.openSource.cta')}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </section>

    </main>
  )
}
