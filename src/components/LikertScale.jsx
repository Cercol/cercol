/**
 * LikertScale — configurable N-point response selector.
 * Props:
 *   value       {number|null}              — currently selected value or null
 *   onChange    {(value: number) => void}
 *   scalePoints {number}                   — number of scale points (default: 5)
 *   scaleLabels {Record<number, string>}   — label for each point (required)
 *
 * Desktop display: numbered buttons in a row.
 *   Anchor labels are shown fixed below the first and last button only.
 *   No floating label follows the selected value.
 *
 * Mobile display: vertical list with number + full label per option.
 */
export default function LikertScale({ value, onChange, scalePoints = 5, scaleLabels = {} }) {
  const points = Array.from({ length: scalePoints }, (_, i) => i + 1)

  return (
    <div className="w-full">
      {/* Mobile: vertical list with full labels */}
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
            <span>{scaleLabels[point] ?? point}</span>
          </button>
        ))}
      </div>

      {/* Desktop: horizontal buttons + fixed anchor labels at extremes */}
      <div className="hidden sm:block">
        <div className="flex gap-2 justify-between">
          {points.map((point) => (
            <button
              key={point}
              onClick={() => onChange(point)}
              title={scaleLabels[point]}
              className={[
                'flex-1 flex flex-col items-center py-3 rounded-xl border text-sm font-semibold transition-all',
                value === point
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50',
              ].join(' ')}
            >
              {point}
            </button>
          ))}
        </div>
        {/* Anchor labels: first (left) and last (right) only, always visible */}
        <div className="flex justify-between mt-2 text-xs text-gray-400 px-0.5">
          <span className="max-w-[40%] leading-snug">{scaleLabels[1]}</span>
          <span className="max-w-[40%] text-right leading-snug">{scaleLabels[scalePoints]}</span>
        </div>
      </div>
    </div>
  )
}
