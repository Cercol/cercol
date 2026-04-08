/**
 * RoleProbabilityBars — ranked probability bars for all 12 roles.
 * Phase 5.4. Replaces RoleWheel.
 *
 * Shows each role as a horizontal bar proportional to its softmax
 * probability. Sorted descending. Primary role highlighted; arc roles
 * (>15%, excluding primary) visually distinct.
 *
 * Props:
 *   result — return value of computeRole() from role-scoring.js
 */
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'
import { Card, SectionLabel } from './ui'

export default function RoleProbabilityBars({ result, columns = 1 }) {
  const { t } = useTranslation()
  const { role: primaryRole, arc, probabilities } = result

  // Sort all roles by probability descending
  const sorted = Object.entries(probabilities).sort((a, b) => b[1] - a[1])

  return (
    <Card className="shadow-sm p-5 flex flex-col gap-3">

      <SectionLabel color="gray">
        {t('roles.probability_label')}
      </SectionLabel>

      <div className={columns === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2' : 'flex flex-col gap-2'}>
        {sorted.map(([r, prob]) => {
          const isPrimary = r === primaryRole
          const isArc     = arc.includes(r)
          const pct       = Math.round(prob * 100)

          // Bar fill colour
          const barColor = isPrimary
            ? colors.primary
            : isArc
              ? colors.arcBar
              : colors.border

          // Label colour
          const labelColor = isPrimary
            ? colors.textPrimary
            : isArc
              ? colors.arcLabel
              : colors.textMuted

          return (
            <div key={r}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm ${isPrimary ? 'font-semibold' : 'font-normal'}`}
                  style={{ color: labelColor }}
                >
                  {t(`roles.${r}.name`)}
                </span>
                <span className="text-xs tabular-nums" style={{ color: colors.textMuted }}>
                  {pct}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>

    </Card>
  )
}
