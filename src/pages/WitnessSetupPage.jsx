/**
 * WitnessSetupPage — invite witnesses to complete the Witness Cèrcol instrument.
 * Requires: authenticated + premium (Full Moon paid).
 *
 * Flow:
 * 1. Check auth → redirect /auth if not signed in.
 * 2. Check premium → redirect /full-moon if not premium.
 * 3. Load existing witness sessions from the API.
 * 4. Form: up to 12 witnesses, each with name (required) + email (optional).
 * 5. Submit → creates sessions, shows unique share links.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { createWitnessSessions, getMyWitnessSessions } from '../lib/api'
import { Card, Button, SectionLabel } from '../components/ui'
import { FullMoonIcon, CheckIcon, CloseIcon } from '../components/MoonIcons'

const MAX_WITNESSES = 12

function WitnessRow({ index, name, email, onChange, onRemove, showRemove, t }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          placeholder={`${t('witness.setup.witnessLabel')} ${index + 1}`}
          value={name}
          onChange={(e) => onChange(index, 'name', e.target.value)}
          className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mm-color-blue)]/40"
        />
        <input
          type="email"
          placeholder={t('witness.setup.emailPlaceholder')}
          value={email}
          onChange={(e) => onChange(index, 'email', e.target.value)}
          className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mm-color-blue)]/40"
        />
      </div>
      {showRemove && (
        <button
          onClick={() => onRemove(index)}
          className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors pt-2"
          aria-label="Remove"
        >
          <CloseIcon size={18} />
        </button>
      )}
    </div>
  )
}

function CopyButton({ text, label, copiedLabel }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 text-xs font-semibold text-[var(--mm-color-blue)] hover:opacity-70 transition-opacity"
    >
      {copied
        ? <span className="flex items-center gap-1"><CheckIcon size={12} />{copiedLabel}</span>
        : label}
    </button>
  )
}

function ProfilePrompt({ t }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-sm text-amber-800">{t('profile.completionPrompt.body')}</p>
      <Link
        to="/profile"
        className="shrink-0 text-sm font-semibold text-amber-900 underline hover:no-underline"
      >
        {t('profile.completionPrompt.cta')}
      </Link>
    </div>
  )
}

export default function WitnessSetupPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, profile, loading: authLoading } = useAuth()

  const [gateState, setGateState] = useState('checking')

  // Form state — each witness has a stable id for React key stability (C29)
  const nextId = useRef(2)
  const [witnesses, setWitnesses] = useState([{ id: 1, name: '', email: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [formError,  setFormError]  = useState(null)

  // Existing sessions
  const [sessions,      setSessions]      = useState([])
  const [sessionsError, setSessionsError] = useState(null)

  // Newly created links (shown after submit)
  const [newLinks, setNewLinks] = useState([])

  // ── Gate check ────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/auth')
      return
    }

    // profile is loaded by AuthContext — no separate API call needed
    if (profile?.premium) {
      setGateState('ready')
    } else if (profile !== null) {
      // profile loaded but not premium
      navigate('/full-moon')
    }
    // if profile is still null (loading), the effect re-runs when it arrives
  }, [user, profile, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load existing sessions ─────────────────────────────────────────────
  useEffect(() => {
    if (gateState !== 'ready') return

    getMyWitnessSessions()
      .then(setSessions)
      .catch(() => setSessionsError(t('witness.setup.error')))
  }, [gateState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Form handlers ──────────────────────────────────────────────────────
  function handleChange(index, field, value) {
    setWitnesses(prev =>
      prev.map((w, i) => i === index ? { ...w, [field]: value } : w)
    )
  }

  function handleAdd() {
    if (witnesses.length < MAX_WITNESSES) {
      setWitnesses(prev => [...prev, { id: nextId.current++, name: '', email: '' }])
    }
  }

  function handleRemove(index) {
    setWitnesses(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const valid = witnesses.filter(w => w.name.trim())
    if (!valid.length) return

    setSubmitting(true)
    setFormError(null)

    try {
      const created = await createWitnessSessions(valid)
      setNewLinks(created)
      // Refresh session list
      const updated = await getMyWitnessSessions()
      setSessions(updated)
      // Reset form
      nextId.current = 1
      setWitnesses([{ id: nextId.current++, name: '', email: '' }])
    } catch {
      setFormError(t('witness.setup.error'))
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render gates ───────────────────────────────────────────────────────
  if (gateState === 'checking' || authLoading) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-gray-400">{t('witness.setup.checking')}</p>
      </main>
    )
  }

  const completedSessions = sessions.filter(s => s.completed_at)
  const pendingSessions   = sessions.filter(s => !s.completed_at)

  return (
    <main className="py-10 sm:py-16">
      <div className="flex flex-col gap-8">

        {/* Header */}
        <div>
          <SectionLabel color="blue" className="mb-1 flex items-center gap-1.5">
            <FullMoonIcon size={13} />{t('fmResults.witnessCta.eyebrow')}
          </SectionLabel>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('witness.setup.title')}</h1>
          <p className="mt-1 text-gray-500 text-sm">{t('witness.setup.subtitle')}</p>
        </div>

        {/* Non-blocking profile completion prompt */}
        {profile && !profile.first_name && <ProfilePrompt t={t} />}

        {/* Informational: authenticated witnesses get linked for team features */}
        <p className="text-xs text-gray-400 leading-relaxed">
          {t('witness.setup.linkedNote')}
        </p>

        {/* New links (shown after successful create) */}
        {newLinks.length > 0 && (
          <Card className="shadow-sm p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-900">{t('witness.setup.linksHeading')}</p>
            <p className="text-xs text-gray-500">{t('witness.setup.shareInstruction')}</p>
            {newLinks.map(link => (
              <div key={link.token} className="flex items-center justify-between gap-3 bg-gray-50 rounded px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{link.name}</p>
                  <p className="text-xs text-gray-400 truncate">{link.link}</p>
                </div>
                <CopyButton text={link.link} label={t('witness.setup.copyLink')} copiedLabel={t('witness.setup.copied')} />
              </div>
            ))}
          </Card>
        )}

        {/* Add witnesses form */}
        <Card className="shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{t('witness.setup.addHeading')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {witnesses.map((w, i) => (
              <WitnessRow
                key={w.id}
                index={i}
                name={w.name}
                email={w.email}
                onChange={handleChange}
                onRemove={handleRemove}
                showRemove={witnesses.length > 1}
                t={t}
              />
            ))}

            {witnesses.length < MAX_WITNESSES && (
              <button
                type="button"
                onClick={handleAdd}
                className="text-sm text-[#0047ba] hover:text-[#003090] font-medium text-left transition-colors"
              >
                + {t('witness.setup.addRow')}
              </button>
            )}

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !witnesses.some(w => w.name.trim())}
              className="mt-1 w-full shadow-sm"
            >
              {submitting ? t('witness.setup.generating') : t('witness.setup.generate')}
            </Button>
          </form>
        </Card>

        {/* Existing sessions */}
        {sessions.length > 0 && (
          <section>
            <SectionLabel color="gray" className="mb-3">
              {t('witness.setup.existingHeading')}
            </SectionLabel>
            {sessionsError && (
              <p className="text-sm text-red-600 mb-2">{sessionsError}</p>
            )}
            <div className="flex flex-col gap-2">
              {completedSessions.map(s => (
                <div key={s.id} className="bg-white rounded border border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.witness_name}</p>
                    {s.witness_email && (
                      <p className="text-xs text-gray-400">{s.witness_email}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {t('witness.setup.statusComplete')}
                  </span>
                </div>
              ))}
              {pendingSessions.map(s => (
                <div key={s.id} className="bg-white rounded border border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{s.witness_name}</p>
                    {s.witness_email && (
                      <p className="text-xs text-gray-400">{s.witness_email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {t('witness.setup.statusPending')}
                    </span>
                    <CopyButton text={s.link} label={t('witness.setup.copyLink')} copiedLabel={t('witness.setup.copied')} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* View report CTA */}
        <div className="flex flex-col gap-3">
          <Button variant="secondary" onClick={() => navigate('/full-moon/results')} className="w-full">
            {t('witness.setup.viewReport')}
          </Button>
        </div>

      </div>
    </main>
  )
}
