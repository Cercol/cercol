/**
 * ConvergenceMeter — visual convergence indicator between self and Witness scores.
 * Used in FullMoonResultsPage when ≥2 Witnesses have responded.
 *
 * Props:
 *   ratio — number 0–1 (from computeConvergence)
 *   t     — i18n translation function
 */
import { colors } from '../../design/tokens'

export default function ConvergenceMeter({ ratio, t }) {
  const pct = Math.round(ratio * 100)

  let label, barColor, bg, textColor
  if (ratio >= 0.6) {
    label     = t('witnessResults.convergenceHigh')
    barColor  = 'bg-emerald-500'
    bg        = 'bg-emerald-50'
    textColor = 'text-emerald-700'
  } else if (ratio >= 0.3) {
    label     = t('witnessResults.convergenceMod')
    barColor  = 'bg-amber-400'
    bg        = 'bg-amber-50'
    textColor = 'text-amber-700'
  } else {
    label     = t('witnessResults.convergenceLow')
    barColor  = 'bg-red-400'
    bg        = 'bg-red-50'
    textColor = 'text-red-600'
  }

  return (
    <div className={`rounded border border-gray-200 px-6 py-5 ${bg}`}>
      <p className={`text-sm font-semibold mb-3 ${textColor}`}>{label}</p>
      <div className="w-full h-2.5 bg-white rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs" style={{ color: colors.textMuted }}>
        {t('witnessResults.convergenceNote')}
      </p>
    </div>
  )
}
