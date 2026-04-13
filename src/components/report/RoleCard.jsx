/**
 * RoleCard — shared role result card for FQ and FM report pages.
 *
 * Props:
 *   role        — role key e.g. 'R01'
 *   roleName    — translated role name
 *   roleEssence — translated role essence/tagline
 *   arc         — array of arc role keys
 *   arcName     — function (roleKey) => string (translated arc role name)
 *   arcLabel    — translated "arc roles" label
 *   badge       — JSX for the badge/label above the role name (e.g. <Badge variant="beta">)
 *   badgeNote   — optional muted note below the badge
 */
import { RoleIcon } from '../MoonIcons'
import { Card, Badge } from '../ui'
import { colors } from '../../design/tokens'

export default function RoleCard({ role, roleName, roleEssence, arc, arcName, arcLabel, badge, badgeNote }) {
  return (
    <Card accent="red" className="overflow-hidden">
      <div className="flex flex-row">
        <div className="w-40 shrink-0 flex items-center justify-center">
          <RoleIcon role={role} size={128} style={{ color: colors.red }} />
        </div>
        <div className="flex-1 p-6 sm:p-8 flex flex-col gap-4">
          {badge && (
            <div className="flex flex-col gap-1">
              {badge}
              {badgeNote && (
                <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                  {badgeNote}
                </p>
              )}
            </div>
          )}
          <h2
            className="text-5xl sm:text-6xl font-bold leading-tight"
            style={{ color: colors.textPrimary }}
          >
            {roleName}
          </h2>
          <p className="text-base leading-relaxed" style={{ color: colors.textMuted }}>
            {roleEssence}
          </p>
          {arc && arc.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                {arcLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {arc.map(r => (
                  <Badge key={r} variant="default">{arcName(r)}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
