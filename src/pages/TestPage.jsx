/**
 * TestPage — renders the TIPI questionnaire one item at a time.
 * On completion, navigates to /results with scores in location state.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TIPI_ITEMS } from '../data/tipi'
import { computeScores } from '../utils/scoring'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'

export default function TestPage() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})   // { itemId: value }
  const [current, setCurrent] = useState(0)    // index into TIPI_ITEMS

  const item = TIPI_ITEMS[current]
  const answered = answers[item.id] ?? null
  const isLast = current === TIPI_ITEMS.length - 1

  function handleAnswer(value) {
    setAnswers((prev) => ({ ...prev, [item.id]: value }))
  }

  function handleNext() {
    if (!answered) return
    if (isLast) {
      const scores = computeScores({ ...answers, [item.id]: answered })
      navigate('/results', { state: { scores } })
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
          <span className="text-lg font-bold text-gray-900">Cèrcol</span>
          <span className="text-sm text-gray-400">Big Five · TIPI</span>
        </div>

        {/* Progress */}
        <ProgressBar current={current + 1} total={TIPI_ITEMS.length} />

        {/* Instruction (only on first item) */}
        {current === 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-800 leading-relaxed">
            <strong>Instructions:</strong> Rate the extent to which each pair of traits applies to you, even if one characteristic applies more strongly than the other.
          </div>
        )}

        {/* Question */}
        <QuestionCard
          item={item}
          index={current + 1}
          value={answered}
          onChange={handleAnswer}
        />

        {/* Navigation */}
        <div className="flex gap-3">
          {current > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Back
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
            {isLast ? 'See my results' : 'Next'}
          </button>
        </div>
      </div>
    </main>
  )
}
