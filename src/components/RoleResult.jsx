/**
 * RoleResult — role card shown on results pages.
 *
 * Displays the primary role name, essence, and personal arc (secondary
 * roles with probability > 15%).
 *
 * Props:
 *   result     — return value of computeRole() from src/utils/role-scoring.js
 *   definitive — when true, replaces beta badge with Witness-confirmed indicator
 *                (used on FullMoonReportPage when ≥2 Witnesses have completed)
 */
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'
import { Card, Badge } from './ui'

export default function RoleResult({ result, definitive = false }) {
  const { t } = useTranslation()

  const { role, arc } = result

  return (
    <Card className="shadow-sm p-6 flex flex-col gap-4">

      {/* Beta badge or Witness-confirmed indicator */}
      {definitive ? (
        <div className="flex flex-col gap-1">
          <Badge className="self-start bg-[#e8eef8] text-[#0047ba]">
            {t('witnessResults.definitiveLabel')}
          </Badge>
          <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
            {t('witnessResults.definitiveNote')}
          </p>
        </div>
      ) : (
        <Badge variant="default" className="self-start">
          {t('roles.beta_label')}
        </Badge>
      )}

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
              <Badge key={r} variant="default">
                {t(`roles.${r}.name`)}
              </Badge>
            ))}
          </div>
        </div>
      )}

    </Card>
  )
}
