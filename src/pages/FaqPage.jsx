/**
 * FaqPage — public informational page at /faq.
 * No auth required. Practical questions about privacy, accuracy,
 * the Witness instrument, instrument differences, and retaking.
 * Uses HTML details/summary for accessible accordion without JS state.
 */
import { useTranslation } from 'react-i18next'

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

export default function FaqPage() {
  const { t } = useTranslation()

  const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12']

  return (
    <main className="py-12">

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('faq.heading')}
        </h1>

        <div className="flex flex-col gap-3">
          {questions.map((key) => (
            <FaqItem
              key={key}
              question={t(`faq.${key}.q`)}
              answer={t(`faq.${key}.a`)}
            />
          ))}
        </div>

    </main>
  )
}
