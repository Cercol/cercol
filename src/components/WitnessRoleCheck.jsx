/**
 * WitnessRoleCheck — the one screen that measures the instrument.
 *
 * A Witness who has just spent five minutes describing someone is shown three
 * role descriptions, one of them the role their own answers produced, and
 * asked which sounds most like the person. The answer never touches that
 * person's score. It goes to its own table and exists to say whether the role
 * assignment means anything at all.
 *
 * Three options rather than two, deliberately. The two most probable roles are
 * neighbours on the circumplex by construction, so a Witness failing to
 * separate them is not evidence of a broken instrument, and detecting a real
 * 60% against a 50% chance line needs about 153 completed sessions. With a
 * distant third option the chance line is 33%, the question becomes the one
 * that cannot be answered today, and about 22 sessions settle it.
 *
 * The agreement slider is secondary and says so by sitting below the choice: a
 * flattering, semi-general description gets agreed with whatever it says
 * (Forer, 1949), so a rating on its own would measure how well the role copy
 * is written. Seven points, because reliability stops improving past about
 * that and an odd scale keeps a real midpoint.
 */
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui'
import { RoleIcon } from './MoonIcons'
import { submitWitnessRoleCheck } from '../lib/api'
import { colors } from '../design/tokens'

const AGREEMENT_POINTS = [1, 2, 3, 4, 5, 6, 7]

/**
 * The three roles to show, and a stable display order.
 *
 * The rival is the runner-up by probability, the distant one is the least
 * probable. Order is derived from the session token rather than from
 * Math.random so a reload shows the same arrangement: a Witness who refreshes
 * should not think the question changed.
 */
export function pickThree(probabilities, computed, token) {
  const ranked = Object.entries(probabilities)
    .filter(([r]) => r !== computed)
    .sort((a, b) => b[1] - a[1])
    .map(([r]) => r)
  const rival = ranked[0]
  const distant = ranked[ranked.length - 1]
  const seed = String(token || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const order = [computed, rival, distant]
  // Rotate by the seed: three positions, so every role reaches every slot.
  const shift = seed % 3
  return { rival, distant, order: order.slice(shift).concat(order.slice(0, shift)) }
}

export default function WitnessRoleCheck({ token, roleResult, subjectName, onDone }) {
  const { t } = useTranslation()
  const [chosen, setChosen] = useState(null)
  const [agreement, setAgreement] = useState(null)
  const [busy, setBusy] = useState(false)

  const { rival, distant, order } = useMemo(
    () => pickThree(roleResult.probabilities, roleResult.role, token),
    [roleResult, token],
  )

  async function submit() {
    setBusy(true)
    try {
      await submitWitnessRoleCheck(token, {
        computed_role: roleResult.role,
        rival_role: rival,
        distant_role: distant,
        chosen_role: chosen,
        agreement,
      })
    } catch {
      // Best effort. A Witness who has finished must never be shown an error
      // for a question that was ours to ask, not theirs to answer.
    } finally {
      onDone()
    }
  }

  return (
    <div className="max-w-lg w-full">
      <h1 className="text-xl font-bold text-gray-900 mb-2">{t('witness.roleCheck.heading')}</h1>
      <p className="text-sm text-gray-600 mb-1">
        {t('witness.roleCheck.body', { name: subjectName })}
      </p>
      <p className="text-xs text-gray-400 mb-6">{t('witness.roleCheck.note')}</p>

      <div className="flex flex-col gap-3 mb-6">
        {order.map((role) => {
          const selected = chosen === role
          return (
            <button
              key={role}
              type="button"
              onClick={() => setChosen(role)}
              aria-pressed={selected}
              className={`flex items-start gap-3 rounded border p-4 text-left transition-colors ${
                selected
                  ? 'border-[var(--mm-color-blue)] bg-blue-50/40'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <RoleIcon role={role} size={28} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900">
                  {t(`roles.${role}.name`)}
                </span>
                <span className="block text-sm text-gray-600">{t(`roles.${role}.essence`)}</span>
              </span>
            </button>
          )
        })}
      </div>

      {chosen && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">{t('witness.roleCheck.agreement')}</p>
          <div className="flex items-center gap-1">
            {AGREEMENT_POINTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAgreement(n)}
                aria-pressed={agreement === n}
                aria-label={String(n)}
                className={`h-9 flex-1 rounded text-xs font-semibold transition-colors ${
                  agreement === n
                    ? 'bg-[var(--mm-color-blue)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-gray-400">
            <span>{t('witness.roleCheck.scaleLow')}</span>
            <span>{t('witness.roleCheck.scaleHigh')}</span>
          </div>
        </div>
      )}

      <Button variant="primary" disabled={!chosen || busy} onClick={submit} className="w-full mb-3">
        {busy ? t('witness.roleCheck.sending') : t('witness.roleCheck.cta')}
      </Button>
      <button
        onClick={onDone}
        className="w-full text-sm text-gray-500 hover:text-gray-800 underline transition-colors"
        style={{ color: colors.textMuted }}
      >
        {t('witness.roleCheck.skip')}
      </button>
    </div>
  )
}
