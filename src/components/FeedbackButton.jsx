/**
 * FeedbackButton — floating bottom-right cluster:
 *   1. "Report issue"       — always visible, opens GitHub issue
 *   2. "Suggest translation" — visible when language !== 'en',
 *      opens an inline panel for submitting translation suggestions
 */
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'
import { sendTranslationFeedback } from '../utils/translationFeedback'

const ISSUE_URL =
  'https://github.com/miquelmatoses/cercol/issues/new?title=Bug+report&labels=bug'

/** Derive instrument from current route pathname */
function getInstrument(pathname) {
  if (pathname.includes('/new-moon')) return 'newMoon'
  if (pathname.includes('/first-quarter')) return 'firstQuarter'
  return 'none'
}

/**
 * Props:
 *   itemId   {number|null} — id of item currently shown (test pages only)
 *   itemText {string|null} — English text of that item
 */
export default function FeedbackButton({ itemId = null, itemText = null }) {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const [panelOpen, setPanelOpen] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success'
  const panelRef = useRef(null)

  const isNonEnglish = i18n.language !== 'en'

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        closePanel()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [panelOpen])

  function openPanel() {
    setSuggestion('')
    setStatus('idle')
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setStatus('idle')
    setSuggestion('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!suggestion.trim()) return
    setStatus('submitting')
    await sendTranslationFeedback({
      language: i18n.language,
      instrument: getInstrument(pathname),
      context: window.location.pathname,
      suggestion: suggestion.trim(),
      itemId,
      itemText,
    })
    setStatus('success')
    setTimeout(closePanel, 2000)
  }

  return (
    <div ref={panelRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">

      {/* ── Translation feedback panel ── */}
      {panelOpen && (
        <div
          style={{ borderColor: colors.border }}
          className="w-72 bg-white rounded-2xl border shadow-lg p-4 flex flex-col gap-3"
        >
          <p className="text-sm font-semibold text-gray-800">{t('feedback.panel.title')}</p>

          {/* Context (read-only) */}
          <div>
            <p className="text-xs text-gray-400 mb-1">{t('feedback.panel.context')}</p>
            <p
              style={{ color: colors.textMuted, borderColor: colors.border }}
              className="text-xs border rounded-lg px-3 py-2 bg-gray-50 font-mono truncate"
            >
              [{i18n.language}] {pathname}
            </p>
          </div>

          {/* Item context — shown only when inside a test */}
          {itemId != null && itemText && (
            <p
              style={{ color: colors.textMuted, borderColor: colors.border }}
              className="text-xs border rounded-lg px-3 py-2 bg-gray-50 leading-snug"
            >
              #{itemId}: <span className="italic">"{itemText}"</span>
            </p>
          )}

          {/* Suggestion textarea */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              maxLength={300}
              required
              rows={3}
              placeholder={t('feedback.panel.placeholder')}
              style={{ borderColor: colors.border }}
              className="w-full text-sm border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800 placeholder-gray-300"
            />

            {status === 'success' ? (
              <p className="text-xs text-emerald-600 text-center font-medium py-1">
                {t('feedback.panel.success')}
              </p>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closePanel}
                  style={{ borderColor: colors.border, color: colors.textMuted }}
                  className="flex-1 py-2 rounded-xl border text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('feedback.panel.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={status === 'submitting' || !suggestion.trim()}
                  style={{ backgroundColor: colors.primary }}
                  className="flex-1 py-2 rounded-xl text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {t('feedback.panel.submit')}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── Button cluster ── */}
      <div className="flex flex-col items-end gap-1.5">
        {/* Suggest translation — only when not English */}
        {isNonEnglish && (
          <button
            onClick={openPanel}
            style={{ color: colors.textMuted, borderColor: colors.border }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-white text-xs font-medium shadow-sm hover:shadow-md hover:text-gray-700 transition-all"
          >
            {/* Translate icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 8 6 6" />
              <path d="m4 14 6-6 2-3" />
              <path d="M2 5h12" />
              <path d="M7 2h1" />
              <path d="m22 22-5-10-5 10" />
              <path d="M14 18h6" />
            </svg>
            {t('feedback.suggestTranslation')}
          </button>
        )}

        {/* Report issue — always visible */}
        <a
          href={ISSUE_URL}
          target="_blank"
          rel="noreferrer"
          style={{ color: colors.textMuted, borderColor: colors.border }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-white text-xs font-medium shadow-sm hover:shadow-md hover:text-gray-700 transition-all"
        >
          {/* Bug icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 2l1.88 1.88" />
            <path d="M14.12 3.88 16 2" />
            <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
            <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
            <path d="M12 20v-9" />
            <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
            <path d="M6 13H2" />
            <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
            <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
            <path d="M22 13h-4" />
            <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
          </svg>
          {t('feedback.reportIssue')}
        </a>
      </div>
    </div>
  )
}
