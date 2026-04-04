/**
 * LikertScale — 7-point response selector for a single TIPI item.
 * Props:
 *   value     {number|null} — currently selected value (1–7) or null
 *   onChange  {(value: number) => void}
 */
import { SCALE_LABELS } from '../data/tipi'

export default function LikertScale({ value, onChange }) {
  const points = [1, 2, 3, 4, 5, 6, 7]

  return (
    <div className="w-full">
      {/* Mobile: vertical list */}
      <div className="flex flex-col gap-2 sm:hidden">
        {points.map((point) => (
          <button
            key={point}
            onClick={() => onChange(point)}
            className={[
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
              value === point
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50',
            ].join(' ')}
          >
            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${value === point ? 'border-white text-white' : 'border-gray-400 text-gray-500'}`}>
              {point}
            </span>
            <span>{SCALE_LABELS[point]}</span>
          </button>
        ))}
      </div>

      {/* Desktop: horizontal row */}
      <div className="hidden sm:block">
        <div className="flex justify-between mb-2 text-xs text-gray-400 px-1">
          <span>Disagree strongly</span>
          <span>Agree strongly</span>
        </div>
        <div className="flex gap-2 justify-between">
          {points.map((point) => (
            <button
              key={point}
              onClick={() => onChange(point)}
              title={SCALE_LABELS[point]}
              className={[
                'flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-semibold transition-all',
                value === point
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50',
              ].join(' ')}
            >
              <span>{point}</span>
            </button>
          ))}
        </div>
        {value && (
          <p className="mt-2 text-center text-xs text-gray-500">
            {SCALE_LABELS[value]}
          </p>
        )}
      </div>
    </div>
  )
}
