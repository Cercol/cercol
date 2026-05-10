/**
 * FaqPage — public informational page at /faq.
 * No auth required. Questions grouped into four thematic sections:
 * Data & Privacy, Science & Methodology, The Instruments, For Teams.
 * Uses HTML details/summary for accessible accordion without JS state.
 */
import { useTranslation } from 'react-i18next'
import { SectionLabel } from '../components/ui'

const SECTIONS = [
  { labelKey: 'faq.cat.data',        keys: ['q1', 'q10'] },
  { labelKey: 'faq.cat.science',     keys: ['q2', 'q7', 'q8'] },
  { labelKey: 'faq.cat.instruments', keys: ['q3', 'q4', 'q5', 'q6', 'q11', 'q12'] },
  { labelKey: 'faq.cat.teams',       keys: ['q9'] },
]

function FaqItem({ question, answer }) {
  return (
    <details className="group bg-white rounded border border-gray-200 overflow-hidden">
      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none">
        <span className="text-sm font-semibold text-gray-900">{question}</span>
        {/* Chevron — rotates when open via group-open */}
        <svg
          className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="border-t border-gray-100 px-5 py-4">
        <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </details>
  )
}

function FaqSection({ label, children }) {
  return (
    <section className="mb-10">
      <h2
        className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 px-1"
      >
        {label}
      </h2>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </section>
  )
}

export default function FaqPage() {
  const { t } = useTranslation()

  return (
    <main className="py-12">

      <SectionLabel color="blue" className="mb-3">
        {t('faq.label')}
      </SectionLabel>
      <h1
        className="text-3xl font-bold text-gray-900 mb-8"
        style={{ fontFamily: 'var(--mm-font-display)' }}
      >
        {t('faq.heading')}
      </h1>

      {SECTIONS.map(({ labelKey, keys }) => (
        <FaqSection key={labelKey} label={t(labelKey)}>
          {keys.map(key => (
            <FaqItem
              key={key}
              question={t(`faq.${key}.q`)}
              answer={t(`faq.${key}.a`)}
            />
          ))}
        </FaqSection>
      ))}

    </main>
  )
}
