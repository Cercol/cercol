/**
 * SurprisesPanel — roles that appear on one side (self or witness) but not the other.
 *
 * Each surprise shows:
 *   - An emoji indicator (👁 = witness only, 🪞 = self only)
 *   - Role icon + name
 *   - The top-5 adjectives that characterise the role (localised)
 *
 * Props:
 *   surprises — array of {role, probability, type: 'witnessOnly'|'selfOnly'}
 *               (from compareRoleViews().surprises)
 *   t         — i18n translation function
 *   language  — current i18n language code (for adjective localisation)
 */
import { useTranslation } from 'react-i18next'
import { RoleIcon } from '../MoonIcons'
import { ROLE_COLORS, colors } from '../../design/tokens'
import { Card } from '../ui'
import { ROLE_TOP_ADJECTIVES } from '../../utils/witness-scoring'
import { WITNESS_ADJECTIVES } from '../../data/witness-adjectives'

/**
 * Resolve display text for an adjective ID in the given language.
 * Falls back to English if the language is not present on the adjective.
 */
function adjectiveText(id, language) {
  const adj = WITNESS_ADJECTIVES.find(a => a.id === id)
  if (!adj) return id
  return adj[language] ?? adj.en
}

export function SurprisesPanel({ surprises, t }) {
  const { i18n } = useTranslation()
  const lang = i18n.language

  if (!surprises || surprises.length === 0) return null

  return (
    <Card className="px-5 py-4">
      <div className="flex flex-col gap-4">
        {surprises.map(s => {
          const emoji   = s.type === 'witnessOnly' ? '👁' : '🪞'
          const ariaKey = s.type === 'witnessOnly'
            ? 'witnessResults.witnessOnlyNote'
            : 'witnessResults.selfOnlyNote'
          const adjIds  = ROLE_TOP_ADJECTIVES[s.role] ?? []
          const adjList = adjIds.map(id => adjectiveText(id, lang)).join(', ')

          return (
            <div key={s.role} className="flex items-start gap-3">
              <span
                className="text-base shrink-0 mt-0.5"
                aria-label={t(ariaKey)}
                title={t(ariaKey)}
              >
                {emoji}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <RoleIcon
                    role={s.role}
                    size={20}
                    style={{ color: ROLE_COLORS[s.role], flexShrink: 0 }}
                  />
                  <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {t(`roles.${s.role}.name`)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                  {t('witnessResults.definedBy')}: {adjList}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
