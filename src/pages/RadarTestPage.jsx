/**
 * RadarTestPage — Cèrcol Radar: 10-item quick assessment.
 * Uses the TIPI instrument, Likert 1-7 scale.
 * On completion, navigates to /radar/results.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TIPI_ITEMS } from '../data/tipi'
import { computeRadarScores } from '../utils/radar-scoring'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import LanguageToggle from '../components/LanguageToggle'

// Extend LikertScale to 7 points for TIPI
const SCALE_POINTS = 7

export default function RadarTestPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)

  const item = TIPI_ITEMS[current]
  const answered = answers[item.id] ?? null
  const isLast = current === TIPI_ITEMS.length - 1

  function handleAnswer(value) {
    setAnswers((prev) => ({ ...prev, [item.id]: value }))
  }

  function handleNext() {
    if (!answered) return
    const updatedAnswers = { ...answers, [item.id]: answered }
    if (isLast) {
      const scores = computeRadarScores(updatedAnswers)
      navigate('/radar/results', { state: { scores, fromTest: true } })
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
            <span className="ml-2 text-sm text-gray-400">{t('radar.subtitle')}</span>
          </div>
          <LanguageToggle />
        </div>

        {/* Progress */}
        <ProgressBar
          current={current + 1}
          total={TIPI_ITEMS.length}
          label={t('radar.progress', { current: current + 1, total: TIPI_ITEMS.length })}
        />

        {/* Instruction (only on first item) */}
        {current === 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-800 leading-relaxed">
            {t('radar.instructions')}
          </div>
        )}

        {/* Question */}
        <QuestionCard
          item={item}
          index={current + 1}
          value={answered}
          onChange={handleAnswer}
          scalePoints={SCALE_POINTS}
          prefixKey="radar.itemPrefix"
        />

        {/* Navigation */}
        <div className="flex gap-3">
          {current > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              {t('radar.back')}
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
            {isLast ? t('radar.seeResults') : t('radar.next')}
          </button>
        </div>
      </div>
    </main>
  )
}
