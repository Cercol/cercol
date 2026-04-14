/**
 * RoleProbabilityBars — ranked probability bars for all 12 roles.
 *
 * Each row: RoleIcon | name | filled bar (0→pct%) | explicit percentage.
 * Primary role: full opacity, bold name, brand red bar.
 * Arc roles: medium opacity, blue bar.
 * Others: low opacity, gray bar.
 *
 * Props:
 *   result  — return value of computeRole() from role-scoring.js
 *   columns — 1 (default) or 2 for a 2-col grid layout
 */
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'
import { Card, SectionLabel } from './ui'
import { RoleIcon } from './MoonIcons'

export default function RoleProbabilityBars({ result, columns = 1, bare = false }) {
  const { t } = useTranslation()
  const { role: primaryRole, arc, probabilities } = result

  const sorted = Object.entries(probabilities).sort((a, b) => b[1] - a[1])

  const content = (
    <>
      <SectionLabel color="gray">
        {t('roles.probability_label')}
      </SectionLabel>

      <div className={columns === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5' : 'flex flex-col gap-1.5'}>
        {sorted.map(([r, prob]) => {
          const isPrimary  = r === primaryRole
          const isArc      = arc.includes(r)
          const pct        = Math.round(prob * 100)

          const barColor   = isPrimary ? colors.primary : isArc ? colors.arcBar : colors.border
          const labelColor = isPrimary ? colors.textPrimary : isArc ? colors.arcLabel : colors.textMuted
          const rowOpacity = isPrimary ? 1 : isArc ? 0.7 : 0.45

          return (
            <div key={r} className="flex items-center gap-2" style={{ opacity: rowOpacity }}>
              <RoleIcon role={r} size={16} style={{ flexShrink: 0 }} />
              <span
                className={`text-xs ${isPrimary ? 'font-semibold' : 'font-normal'} flex-1 min-w-0 truncate`}
                style={{ color: labelColor }}
              >
                {t(`roles.${r}.name`)}
              </span>
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
              <span className="text-xs tabular-nums w-7 text-right shrink-0" style={{ color: colors.textMuted }}>
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </>
  )

  if (bare) {
    return <div className="flex flex-col gap-3">{content}</div>
  }

  return (
    <Card className="shadow-sm p-5 flex flex-col gap-3">
      {content}
    </Card>
  )
}
