/**
 * RoleProbabilityBars — ranked probability dot-markers for all 12 roles.
 * Phase 13.8. Replaces filled-bar design.
 *
 * Shows each role as a thin track with a single filled dot positioned at
 * the role's softmax probability. Sorted descending. Primary role
 * highlighted; arc roles (>15%, excluding primary) visually distinct.
 *
 * Props:
 *   result  — return value of computeRole() from role-scoring.js
 *   columns — 1 (default) or 2 for a 2-col grid layout
 */
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'
import { Card, SectionLabel } from './ui'
import { RoleIcon } from './MoonIcons'

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

          // Dot fill colour
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

          // Row opacity: primary = full, arc = medium, others = low
          const rowOpacity = isPrimary ? 1 : isArc ? 0.7 : 0.45

          return (
            <div key={r} style={{ opacity: rowOpacity }}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm flex items-center gap-1.5 ${isPrimary ? 'font-semibold' : 'font-normal'}`}
                  style={{ color: labelColor }}
                >
                  <RoleIcon role={r} size={18} />
                  {t(`roles.${r}.name`)}
                </span>
                <span className="text-xs tabular-nums" style={{ color: colors.textMuted }}>
                  {pct}%
                </span>
              </div>

              {/* Dot-marker track */}
              <div style={{ position: 'relative', height: '12px', display: 'flex', alignItems: 'center' }}>
                {/* Thin track line */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  width: '100%',
                  height: '1px',
                  backgroundColor: '#e5e7eb',
                  transform: 'translateY(-50%)',
                }} />
                {/* Filled dot marker */}
                <div style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: barColor,
                  left: `${pct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }} />
              </div>
            </div>
          )
        })}
      </div>

    </Card>
  )
}
