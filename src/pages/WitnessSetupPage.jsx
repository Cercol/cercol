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
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { createWitnessSessions, getMyWitnessSessions } from '../lib/api'

const MAX_WITNESSES = 12

function WitnessRow({ index, name, email, onChange, onRemove, showRemove }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          placeholder={`Witness ${index + 1}`}
          value={name}
          onChange={(e) => onChange(index, 'name', e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => onChange(index, 'email', e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>
      {showRemove && (
        <button
          onClick={() => onRemove(index)}
          className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors pt-2"
          aria-label="Remove"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      )}
    </div>
  )
}

function CopyButton({ text, label }) {
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
      className="shrink-0 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

export default function WitnessSetupPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()

  const [gateState, setGateState] = useState('checking')

  // Form state
  const [witnesses, setWitnesses] = useState([{ name: '', email: '' }])
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

    supabase
      .from('profiles')
      .select('premium')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.premium) {
          setGateState('ready')
        } else {
          navigate('/full-moon')
        }
      })
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

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
      setWitnesses(prev => [...prev, { name: '', email: '' }])
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
      setWitnesses([{ name: '', email: '' }])
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
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 mb-1">
            🌕 Witness Cèrcol
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('witness.setup.title')}</h1>
          <p className="mt-1 text-gray-500 text-sm">{t('witness.setup.subtitle')}</p>
        </div>

        {/* New links (shown after successful create) */}
        {newLinks.length > 0 && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-900">{t('witness.setup.linksHeading')}</p>
            <p className="text-xs text-gray-500">{t('witness.setup.shareInstruction')}</p>
            {newLinks.map(link => (
              <div key={link.token} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{link.name}</p>
                  <p className="text-xs text-gray-400 truncate">{link.link}</p>
                </div>
                <CopyButton text={link.link} label={t('witness.setup.copyLink')} />
              </div>
            ))}
          </div>
        )}

        {/* Add witnesses form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{t('witness.setup.addHeading')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {witnesses.map((w, i) => (
              <WitnessRow
                key={i}
                index={i}
                name={w.name}
                email={w.email}
                onChange={handleChange}
                onRemove={handleRemove}
                showRemove={witnesses.length > 1}
              />
            ))}

            {witnesses.length < MAX_WITNESSES && (
              <button
                type="button"
                onClick={handleAdd}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium text-left transition-colors"
              >
                + {t('witness.setup.addRow')}
              </button>
            )}

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !witnesses.some(w => w.name.trim())}
              className="mt-1 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              {submitting ? t('witness.setup.generating') : t('witness.setup.generate')}
            </button>
          </form>
        </div>

        {/* Existing sessions */}
        {sessions.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">
              {t('witness.setup.existingHeading')}
            </h2>
            {sessionsError && (
              <p className="text-sm text-red-600 mb-2">{sessionsError}</p>
            )}
            <div className="flex flex-col gap-2">
              {completedSessions.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.witness_name}</p>
                    {s.witness_email && (
                      <p className="text-xs text-gray-400">{s.witness_email}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {t('witness.setup.statusComplete')}
                  </span>
                </div>
              ))}
              {pendingSessions.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{s.witness_name}</p>
                    {s.witness_email && (
                      <p className="text-xs text-gray-400">{s.witness_email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {t('witness.setup.statusPending')}
                    </span>
                    <CopyButton text={s.link} label={t('witness.setup.copyLink')} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* View report CTA */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/full-moon/report')}
            className="w-full py-3 rounded-xl border border-purple-200 text-purple-700 font-medium hover:bg-purple-50 transition-colors"
          >
            {t('witness.setup.viewReport')}
          </button>
        </div>

      </div>
    </main>
  )
}
