/**
 * RoleComparisonView — side-by-side panel showing self vs witness role relevance.
 *
 * Renders two columns: "You see yourself as" (self-relevant roles) and
 * "Witnesses see you as" (witness-relevant roles). Roles appearing in both
 * sides are marked with a green dot.
 *
 * Props:
 *   roleComparison — return value of compareRoleViews()
 *                    { selfRelevant, witnessRelevant, shared: Set, surprises }
 *   t              — i18n translation function
 */
import { RoleIcon } from '../MoonIcons'
import { ROLE_COLORS, colors } from '../../design/tokens'
import { Card } from '../ui'

function RoleRow({ entry, isShared, t }) {
  return (
    <li className="flex items-center gap-2 py-1">
      <RoleIcon
        role={entry.role}
        size={20}
        style={{ color: ROLE_COLORS[entry.role], flexShrink: 0 }}
      />
      <span className="text-sm font-semibold flex-1" style={{ color: colors.textPrimary }}>
        {t(`roles.${entry.role}.name`)}
      </span>
      <span className="text-xs tabular-nums" style={{ color: colors.textMuted }}>
        {Math.round(entry.probability * 100)}%
      </span>
      {isShared && (
        <span
          className="w-2 h-2 rounded-full bg-green-500 shrink-0"
          aria-label={t('witnessResults.matchLabel')}
          title={t('witnessResults.matchLabel')}
        />
      )}
    </li>
  )
}

export function RoleComparisonView({ roleComparison, t }) {
  if (!roleComparison) return null
  const { selfRelevant, witnessRelevant, shared } = roleComparison

  return (
    <Card className="shadow-sm p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: colors.textMuted }}
          >
            {t('witnessResults.selfViewLabel')}
          </h3>
          <ul className="flex flex-col gap-1">
            {selfRelevant.map(entry => (
              <RoleRow
                key={entry.role}
                entry={entry}
                isShared={shared.has(entry.role)}
                t={t}
              />
            ))}
          </ul>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-gray-100 pt-6 sm:pt-0 sm:pl-8">
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: colors.textMuted }}
          >
            {t('witnessResults.witnessViewLabel')}
          </h3>
          <ul className="flex flex-col gap-1">
            {witnessRelevant.map(entry => (
              <RoleRow
                key={entry.role}
                entry={entry}
                isShared={shared.has(entry.role)}
                t={t}
              />
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
