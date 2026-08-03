/**
 * GroupOwnerTools — the three things a group owner could not do before:
 * see pending invitations, fix a mistyped one, and ask the team to rate
 * each other.
 *
 * Without this panel a typo in an invited address was unfixable, and the
 * only workaround was deleting the group and rebuilding it from scratch.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { inviteToGroup, removeGroupMember, startWitnessRound } from '../lib/api'
import { Card, Button, SectionLabel } from './ui'

export default function GroupOwnerTools({ groupId, pending = [], memberCount, onChange }) {
  const { t } = useTranslation()
  const [emails, setEmails] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  // One action at a time, and always report the outcome: these all send
  // email to real people, so a silent failure is worse than a slow button.
  async function run(fn, successKey, opts) {
    setBusy(true)
    setNotice(null)
    try {
      const res = await fn()
      setNotice({ ok: true, text: t(successKey, { ...opts, ...res }) })
      onChange?.()
    } catch {
      setNotice({ ok: false, text: t('groupTools.failed') })
    } finally {
      setBusy(false)
    }
  }

  const parsed = emails.split(/[\s,;]+/).map(e => e.trim()).filter(Boolean)

  return (
    <Card className="shadow-sm p-4 flex flex-col gap-4">
      <SectionLabel color="gray">{t('groupTools.heading')}</SectionLabel>

      {pending.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500">{t('groupTools.pendingHeading')}</p>
          {pending.map(p => (
            <div key={p.email} className="flex items-center justify-between gap-2 text-sm py-1">
              <span className="text-gray-700 break-all">{p.email}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(
                  () => removeGroupMember(groupId, p.user_id
                    ? { memberId: p.user_id }
                    : { email: p.email }),
                  'groupTools.removed',
                )}
                className="text-xs text-[var(--mm-color-red)] hover:underline disabled:opacity-50"
              >
                {t('groupTools.remove')}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500" htmlFor="group-invite">
          {t('groupTools.inviteLabel')}
        </label>
        <input
          id="group-invite"
          type="text"
          value={emails}
          onChange={e => setEmails(e.target.value)}
          placeholder={t('groupTools.invitePlaceholder')}
          className="border border-gray-200 rounded px-3 py-2 text-sm"
        />
        <Button
          variant="secondary"
          disabled={busy || parsed.length === 0}
          onClick={() => run(
            () => inviteToGroup(groupId, parsed),
            'groupTools.invited',
            { count: parsed.length },
          ).then(() => setEmails(''))}
        >
          {t('groupTools.invite')}
        </Button>
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-700">{t('groupTools.roundBody')}</p>
        <Button
          disabled={busy || memberCount < 2}
          onClick={() => run(() => startWitnessRound(groupId), 'groupTools.roundStarted')}
        >
          {t('groupTools.roundButton')}
        </Button>
        <p className="text-xs text-gray-400">{t('groupTools.roundNote')}</p>
      </div>

      {notice && (
        <p className={`text-xs ${notice.ok ? 'text-gray-500' : 'text-[var(--mm-color-red)]'}`}>
          {notice.text}
        </p>
      )}
    </Card>
  )
}
