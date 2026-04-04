/**
 * ResultsPage — displays Big Five scores as a radar chart + dimension cards.
 * Expects location.state.scores from TestPage navigation.
 */
import { useLocation, useNavigate } from 'react-router-dom'
import { DIMENSION_META } from '../data/tipi'
import { scoreLabel, scoreToPercent } from '../utils/scoring'
import RadarChart from '../components/RadarChart'

const SCORE_LABELS = {
  low:      { text: 'Low',      classes: 'bg-gray-100 text-gray-600' },
  moderate: { text: 'Moderate', classes: 'bg-blue-100 text-blue-700' },
  high:     { text: 'High',     classes: 'bg-blue-600 text-white' },
}

const DIMENSION_COLORS = {
  openness:          'bg-purple-500',
  conscientiousness: 'bg-blue-600',
  extraversion:      'bg-amber-500',
  agreeableness:     'bg-emerald-500',
  neuroticism:       'bg-red-500',
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const scores = location.state?.scores

  // Guard: if user lands here directly without scores, redirect to home
  if (!scores) {
    navigate('/')
    return null
  }

  const dimensions = Object.keys(DIMENSION_META)

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <span className="text-lg font-bold text-gray-900">Cèrcol</span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Your personality profile</h1>
          <p className="mt-2 text-gray-500 text-base">
            Based on the Big Five model (TIPI · 10 items)
          </p>
        </div>

        {/* Radar chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <RadarChart scores={scores} />
        </div>

        {/* Dimension cards */}
        <div className="flex flex-col gap-3">
          {dimensions.map((key) => {
            const meta = DIMENSION_META[key]
            const score = scores[key]
            const pct = scoreToPercent(score)
            const label = scoreLabel(score)
            const { text, classes } = SCORE_LABELS[label]
            const barColor = DIMENSION_COLORS[key]

            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">{meta.label}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{meta.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                    <span className="text-xl font-bold text-gray-900">{score}<span className="text-sm font-normal text-gray-400">/7</span></span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${classes}`}>{text}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-xl px-5 py-4 text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">Note:</strong> The TIPI is a brief screening instrument. Scores reflect tendencies, not fixed traits. For research-grade measurement, consider a full Big Five inventory (BFI-44 or NEO-PI-R).
        </div>

        {/* Retake */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
        >
          Take the assessment again
        </button>
      </div>
    </main>
  )
}
