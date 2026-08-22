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
import { colors } from '../design/tokens'

export default function LikertScale({ value, onChange, scalePoints = 5, scaleLabels = {} }) {
  const points = Array.from({ length: scalePoints }, (_, i) => i + 1)

  return (
    <div className="w-full">
      {/* Mobile: vertical list with full labels */}
      <div className="flex flex-col gap-2 sm:hidden">
        {points.map((point) => {
          const isSelected = value === point
          return (
            <button
              key={point}
              onClick={() => onChange(point)}
              className={[
                'w-full flex items-center gap-3 px-4 py-3 rounded border text-sm font-medium transition-all',
                isSelected
                  ? 'shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-[var(--mm-color-blue)] hover:bg-[var(--mm-color-interactive-hover-bg)]',
              ].join(' ')}
              style={isSelected ? {
                backgroundColor: colors.blue,
                borderColor: colors.blue,
                color: colors.white,
              } : undefined}
            >
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'border-white text-white' : 'border-gray-400 text-gray-500'}`}
              >
                {point}
              </span>
              <span>{scaleLabels[point] ?? point}</span>
            </button>
          )
        })}
      </div>

      {/* Desktop: horizontal buttons + fixed anchor labels at extremes */}
      <div className="hidden sm:block">
        <div className="flex gap-2 justify-between">
          {points.map((point) => {
            const isSelected = value === point
            return (
              <button
                key={point}
                onClick={() => onChange(point)}
                title={scaleLabels[point]}
                className={[
                  'flex-1 flex flex-col items-center py-3 rounded border text-sm font-semibold transition-all',
                  isSelected
                    ? 'shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[var(--mm-color-blue)] hover:bg-[var(--mm-color-interactive-hover-bg)]',
                ].join(' ')}
                style={isSelected ? {
                  backgroundColor: colors.blue,
                  borderColor: colors.blue,
                  color: colors.white,
                } : undefined}
              >
                {point}
              </button>
            )
          })}
        </div>
        {/* Every point labelled, on both viewports. This showed anchors 1 and
            scalePoints only and left the interior as bare numerals, but the
            IPIP-NEO norms were collected on a fully verbalised scale, and a
            fully labelled scale and an endpoint-labelled one do not produce
            the same distribution. The interior labels are the ones the
            philologists were asked to make equidistant; hiding them wasted
            that and scored the result against norms it no longer matched. */}
        <div className="flex mt-2 text-xs text-gray-400">
          {Array.from({ length: scalePoints }, (_, i) => i + 1).map((point) => (
            <span
              key={point}
              className={`flex-1 leading-snug px-0.5 ${point === 1 ? 'text-left' : point === scalePoints ? 'text-right' : 'text-center'}`}
            >
              {scaleLabels[point]}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
