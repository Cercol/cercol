/**
 * LikertScale — configurable N-point response selector for a single item.
 * Props:
 *   value       {number|null} — currently selected value or null
 *   onChange    {(value: number) => void}
 *   scalePoints {number}     — number of scale points (default: 5)
 */
import { useTranslation } from 'react-i18next'

export default function LikertScale({ value, onChange, scalePoints = 5 }) {
  const { t } = useTranslation()
  const points = Array.from({ length: scalePoints }, (_, i) => i + 1)

  // Scale label lookup: uses i18n keys "scale.1" … "scale.N"
  // Only 1–5 and 1–7 are defined; fallback to numeric string.
  function getLabel(point) {
    const key = `scale.${point}`
    const translated = t(key)
    return translated !== key ? translated : String(point)
  }

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
            <span>{getLabel(point)}</span>
          </button>
        ))}
      </div>

      {/* Desktop: horizontal row */}
      <div className="hidden sm:block">
        <div className="flex justify-between mb-2 text-xs text-gray-400 px-1">
          <span>{t('scale.disagreeLabel')}</span>
          <span>{t('scale.agreeLabel')}</span>
        </div>
        <div className="flex gap-2 justify-between">
          {points.map((point) => (
            <button
              key={point}
              onClick={() => onChange(point)}
              title={getLabel(point)}
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
            {getLabel(value)}
          </p>
        )}
      </div>
    </div>
  )
}
