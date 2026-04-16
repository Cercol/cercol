/**
 * GroupsPage — lists the user's active groups and pending invitations,
 * and provides a form to create a new group.
 * Route: /groups
 * Phase 12.2 — group detail (/groups/:id) is Phase 12.3.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import {
  getMyGroups,
  getPendingInvitations,
  createGroup,
  acceptGroupInvitation,
  declineGroupInvitation,
} from '../lib/api'
import { Card, Button, SectionLabel } from '../components/ui'

function formatDate(iso, language) {
  return new Date(iso).toLocaleDateString(language === 'ca' ? 'ca' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function GroupCard({ group, onClick, t }) {
  const completionRatio = group.member_count > 0
    ? `${group.completed}/${group.member_count}`
    : '0/0'

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left"
    >
      <Card className="p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{group.name}</p>
            <p className="text-xs text-gray-400 mt-1">
              {t('groups.memberCount', { count: group.member_count })}
              {' · '}
              {t('groups.completedCount', { ratio: completionRatio })}
            </p>
          </div>
          {group.is_creator && (
            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded bg-[var(--mm-color-blue)]/10 text-[var(--mm-color-blue)]">
              {t('groups.creatorBadge')}
            </span>
          )}
        </div>
      </Card>
    </button>
  )
}

function PendingCard({ invitation, onAccept, onDecline, accepting, declining, t, language }) {
  return (
    <Card className="p-5 shadow-sm border-amber-200 bg-amber-50">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{invitation.group_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('groups.invitedOn', { date: formatDate(invitation.invited_at, language) })}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAccept(invitation.group_id)}
          disabled={accepting || declining}
        >
          {accepting ? t('groups.accepting') : t('groups.accept')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDecline(invitation.group_id)}
          disabled={accepting || declining}
        >
          {declining ? t('groups.declining') : t('groups.decline')}
        </Button>
      </div>
    </Card>
  )
}

function CreateGroupForm({ onCreated, t }) {
  const [name,    setName]    = useState('')
  const [emails,  setEmails]  = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    const emailList = emails
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    setSaving(true)
    setError(null)
    try {
      const result = await createGroup(trimmedName, emailList)
      setName('')
      setEmails('')
      onCreated(result)
    } catch {
      setError(t('groups.createError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
          {t('groups.nameLabel')}
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('groups.namePlaceholder')}
          maxLength={80}
          required
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
          {t('groups.emailsLabel')}
        </label>
        <input
          type="text"
          value={emails}
          onChange={e => setEmails(e.target.value)}
          placeholder={t('groups.emailsPlaceholder')}
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">{t('groups.emailsNote')}</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={saving || !name.trim()}
      >
        {saving ? t('groups.creating') : t('groups.createCta')}
      </Button>
    </form>
  )
}

export default function GroupsPage() {
  const { t, i18n } = useTranslation()
  const navigate    = useNavigate()
  const { user, loading } = useAuth()

  const [groups,      setGroups]      = useState(null)   // null = loading
  const [pending,     setPending]     = useState(null)
  const [loadError,   setLoadError]   = useState(false)
  const [accepting,   setAccepting]   = useState({})     // groupId → bool
  const [declining,   setDeclining]   = useState({})
  const [showForm,    setShowForm]    = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/auth', { replace: true })
      return
    }
    Promise.all([getMyGroups(), getPendingInvitations()])
      .then(([g, p]) => {
        setGroups(g)
        setPending(p)
      })
      .catch(() => setLoadError(true))
  }, [user, loading, navigate])

  async function handleAccept(groupId) {
    setAccepting(a => ({ ...a, [groupId]: true }))
    try {
      await acceptGroupInvitation(groupId)
      // Remove from pending, reload groups
      setPending(p => p.filter(i => i.group_id !== groupId))
      const updated = await getMyGroups()
      setGroups(updated)
    } catch {
      // Leave state unchanged on error
    } finally {
      setAccepting(a => ({ ...a, [groupId]: false }))
    }
  }

  async function handleDecline(groupId) {
    setDeclining(d => ({ ...d, [groupId]: true }))
    try {
      await declineGroupInvitation(groupId)
      setPending(p => p.filter(i => i.group_id !== groupId))
    } catch {
      // Leave state unchanged on error
    } finally {
      setDeclining(d => ({ ...d, [groupId]: false }))
    }
  }

  function handleGroupCreated() {
    setShowForm(false)
    Promise.all([getMyGroups(), getPendingInvitations()])
      .then(([g, p]) => {
        setGroups(g)
        setPending(p)
      })
      .catch(() => {})
  }

  const isLoading = groups === null && !loadError

  return (
    <main className="py-16">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">{t('groups.heading')}</h1>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(s => !s)}
          >
            {showForm ? t('groups.cancelCreate') : t('groups.newGroup')}
          </Button>
        </div>

        {/* Create group form */}
        {showForm && (
          <Card className="p-5 mb-8 shadow-sm">
            <SectionLabel color="gray" className="mb-4">
              {t('groups.createHeading')}
            </SectionLabel>
            <CreateGroupForm onCreated={handleGroupCreated} t={t} />
          </Card>
        )}

        {isLoading && (
          <p className="text-sm text-gray-400">{t('groups.loading')}</p>
        )}

        {loadError && (
          <p className="text-sm text-red-500">{t('groups.loadError')}</p>
        )}

        {/* Pending invitations */}
        {pending !== null && pending.length > 0 && (
          <section className="mb-8">
            <SectionLabel color="gray" className="mb-3">
              {t('groups.pendingHeading')}
            </SectionLabel>
            <div className="flex flex-col gap-3">
              {pending.map(inv => (
                <PendingCard
                  key={inv.group_id}
                  invitation={inv}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  accepting={!!accepting[inv.group_id]}
                  declining={!!declining[inv.group_id]}
                  t={t}
                  language={i18n.language}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active groups */}
        {groups !== null && groups.length === 0 && pending !== null && pending.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">{t('groups.empty')}</p>
            <p className="text-sm text-gray-400">{t('groups.emptyNote')}</p>
          </div>
        )}

        {groups !== null && groups.length > 0 && (
          <section>
            <SectionLabel color="gray" className="mb-3">
              {t('groups.activeHeading')}
            </SectionLabel>
            <div className="flex flex-col gap-3">
              {groups.map(g => (
                <GroupCard key={g.id} group={g} onClick={() => navigate(`/groups/${g.id}`)} t={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
