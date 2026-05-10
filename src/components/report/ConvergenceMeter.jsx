/**
 * ConvergenceMeter — Spearman rank-correlation display between self and Witness scores.
 * Used in FullMoonResultsPage when ≥2 Witnesses have responded.
 *
 * Props:
 *   rho        — Spearman ρ number in [-1, 1] (from spearmanRho)
 *   comparison — array of {domain, selfRank, witnessRank} (from computeRankComparison)
 *   t          — i18n translation function
 */
import { spearmanLabel } from '../../utils/witness-scoring'
import { colors } from '../../design/tokens'

// Map domain key → i18n label key for the domains section
const DOMAIN_LABEL_KEY = {
  presence:   'domains.extraversion.label',
  bond:       'domains.agreeableness.label',
  vision:     'domains.openMindedness.label',
  discipline: 'domains.conscientiousness.label',
  depth:      'domains.negativeEmotionality.label',
}

export default function ConvergenceMeter({ rho, comparison = [], t }) {
  const level = spearmanLabel(rho ?? 0)

  let label, bg, textColor, borderColor
  if (level === 'strong') {
    label       = t('witnessResults.convergenceStrong')
    bg          = 'bg-emerald-50'
    textColor   = 'text-emerald-700'
    borderColor = 'border-emerald-200'
  } else if (level === 'moderate') {
    label       = t('witnessResults.convergenceModerate')
    bg          = 'bg-amber-50'
    textColor   = 'text-amber-700'
    borderColor = 'border-amber-200'
  } else {
    label       = t('witnessResults.convergenceDivergent')
    bg          = 'bg-red-50'
    textColor   = 'text-red-600'
    borderColor = 'border-red-200'
  }

  return (
    <div className={`rounded border ${borderColor} px-6 py-5 ${bg}`}>
      <p className={`text-sm font-semibold mb-1 ${textColor}`}>{label}</p>
      <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
        {t('witnessResults.convergenceNote')}
      </p>

      {comparison.length > 0 && (
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1 font-medium" style={{ color: colors.textMuted }}>
                {t('witnessResults.rankColumnHeader')}
              </th>
              <th className="text-center py-1 font-medium w-24" style={{ color: colors.textMuted }}>
                {t('witnessResults.rankSelf')}
              </th>
              <th className="text-center py-1 font-medium w-28" style={{ color: colors.textMuted }}>
                {t('witnessResults.rankWitness')}
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map(({ domain, selfRank, witnessRank }) => (
              <tr key={domain} className="border-b border-gray-100 last:border-0">
                <td className="py-1.5" style={{ color: colors.textBase }}>
                  {t(DOMAIN_LABEL_KEY[domain])}
                </td>
                <td className="text-center py-1.5" style={{ color: colors.textBase }}>
                  {Math.round(selfRank)}
                </td>
                <td className="text-center py-1.5" style={{ color: colors.textBase }}>
                  {Math.round(witnessRank)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
