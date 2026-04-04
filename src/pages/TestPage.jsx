/**
 * TestPage — renders the Cèrcol Big Five questionnaire one item at a time.
 * 30 items, Likert 1-5 scale.
 * On completion, navigates to /results with scores in location state.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CBF_ITEMS } from '../data/cercol-big-five'
import { computeScores } from '../utils/cbf-scoring'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import LanguageToggle from '../components/LanguageToggle'

export default function TestPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)

  const item = CBF_ITEMS[current]
  const answered = answers[item.id] ?? null
  const isLast = current === CBF_ITEMS.length - 1

  function handleAnswer(value) {
    setAnswers((prev) => ({ ...prev, [item.id]: value }))
  }

  function handleNext() {
    if (!answered) return
    const updatedAnswers = { ...answers, [item.id]: answered }
    if (isLast) {
      const { domains, facets } = computeScores(updatedAnswers)
      navigate('/results', { state: { domains, facets, fromTest: true } })
    } else {
      setCurrent((i) => i + 1)
    }
  }

  function handleBack() {
    if (current > 0) setCurrent((i) => i - 1)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">{t('nav.brand')}</span>
            <span className="ml-2 text-sm text-gray-400">{t('test.subtitle')}</span>
          </div>
          <LanguageToggle />
        </div>

        {/* Progress */}
        <ProgressBar
          current={current + 1}
          total={CBF_ITEMS.length}
          label={t('test.progress', { current: current + 1, total: CBF_ITEMS.length })}
        />

        {/* Instruction (only on first item) */}
        {current === 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-800 leading-relaxed">
            {t('test.instructions')}
          </div>
        )}

        {/* Question */}
        <QuestionCard
          item={item}
          index={current + 1}
          value={answered}
          onChange={handleAnswer}
          scalePoints={5}
        />

        {/* Navigation */}
        <div className="flex gap-3">
          {current > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              {t('test.back')}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!answered}
            className={[
              'flex-1 py-3 rounded-xl font-semibold text-white transition-colors',
              answered
                ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            {isLast ? t('test.seeResults') : t('test.next')}
          </button>
        </div>
      </div>
    </main>
  )
}
