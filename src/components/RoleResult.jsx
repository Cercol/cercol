/**
 * RoleResult — beta role card for FirstQuarterResultsPage (Phase 5.1)
 *
 * Displays the primary role name, essence, and personal arc (secondary
 * roles with probability > 15%). Prominently labelled as beta because
 * this is a theoretical model, not yet empirically validated.
 *
 * Props:
 *   result — return value of computeRole() from src/utils/role-scoring.js
 */
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'

export default function RoleResult({ result }) {
  const { t } = useTranslation()

  const { role, arc } = result

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">

      {/* Beta badge */}
      <span
        className="self-start text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded-md bg-gray-100"
        style={{ color: colors.textMuted }}
      >
        {t('roles.beta_label')}
      </span>

      {/* Role name */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: colors.textMuted }}
        >
          {t('fqResults.roleSection')}
        </p>
        <h3
          className="text-2xl font-bold"
          style={{ color: colors.textPrimary }}
        >
          {t(`roles.${role}.name`)}
        </h3>
      </div>

      {/* Essence */}
      <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
        {t(`roles.${role}.essence`)}
      </p>

      {/* Personal arc — secondary roles */}
      {arc.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: colors.textMuted }}
          >
            {t('roles.arc_label')}
          </p>
          <div className="flex flex-wrap gap-2">
            {arc.map(r => (
              <span
                key={r}
                className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100"
                style={{ color: colors.textMuted }}
              >
                {t(`roles.${r}.name`)}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
