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
import { BugIcon } from './MoonIcons'
import { ISSUE_URL } from '../lib/navigation'


/** Derive instrument from current route pathname */
function getInstrument(pathname) {
  if (pathname.includes('/new-moon')) return 'newMoon'
  if (pathname.includes('/first-quarter')) return 'firstQuarter'
  if (pathname.includes('/full-moon')) return 'fullMoon'
  return 'none'
}

/**
 * Props:
 *   itemId   {number|null} — id of item currently shown (test pages only)
 *   itemText {string|null} — English text of that item
 */
// The endpoint and table shipped in migration 064. The widget stayed hidden
// for two phases because sending a suggestion nowhere would have discarded
// what people typed, which was the right call while there was nowhere to
// send it. Six languages ship and the corpus turned out to carry real
// translation defects, so a reader needs a way to say so.
const TRANSLATION_FEEDBACK_ENABLED = true

export default function FeedbackButton({ itemId = null, itemText = null }) {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const [panelOpen, setPanelOpen] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success'
  const panelRef = useRef(null)

  const isNonEnglish = i18n.language !== 'en'

  function closePanel() {
    setPanelOpen(false)
    setStatus('idle')
    setSuggestion('')
  }

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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!suggestion.trim()) return
    setStatus('submitting')
    const ok = await sendTranslationFeedback({
      language: i18n.language,
      instrument: getInstrument(pathname),
      context: window.location.pathname,
      suggestion: suggestion.trim(),
      itemId,
      itemText,
    })
    if (ok === false) {
      // Backend endpoint not yet available — close silently rather than showing fake success.
      closePanel()
      return
    }
    setStatus('success')
    setTimeout(closePanel, 2000)
  }

  // Hidden until the translation-feedback backend exists (see flag above).
  if (!TRANSLATION_FEEDBACK_ENABLED) return null

  return (
    <div ref={panelRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">

      {/* ── Translation feedback panel ── */}
      {panelOpen && (
        <div
          style={{ borderColor: colors.border }}
          className="w-72 bg-white rounded border shadow-lg p-4 flex flex-col gap-3"
        >
          <p className="text-sm font-semibold text-gray-800">{t('feedback.panel.title')}</p>

          {/* Context (read-only) */}
          <div>
            <p className="text-xs text-gray-400 mb-1">{t('feedback.panel.context')}</p>
            <p
              style={{ color: colors.textMuted, borderColor: colors.border }}
              className="text-xs border rounded px-3 py-2 bg-gray-50 font-mono truncate"
            >
              [{i18n.language}] {pathname}
            </p>
          </div>

          {/* Item context — shown only when inside a test */}
          {itemId != null && itemText && (
            <p
              style={{ color: colors.textMuted, borderColor: colors.border }}
              className="text-xs border rounded px-3 py-2 bg-gray-50 leading-snug"
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
              className="w-full text-sm border rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 text-gray-800 placeholder-gray-300"
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
                  className="flex-1 py-2 rounded border text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('feedback.panel.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={status === 'submitting' || !suggestion.trim()}
                  style={{ backgroundColor: colors.primary }}
                  className="flex-1 py-2 rounded text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {t('feedback.panel.submit')}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Report a problem with the wording — only when not English.
          Icon only, and a bug rather than a translation glyph: a floating
          control labelled "suggest a translation" reads as a machine
          translation widget, which tells every visitor the copy they are
          reading was produced by one. The panel behind it is unchanged. */}
      {isNonEnglish && (
        <button
          onClick={openPanel}
          aria-label={t('feedback.suggestTranslation')}
          title={t('feedback.suggestTranslation')}
          style={{ color: colors.textMuted, borderColor: colors.border }}
          className="flex items-center justify-center w-9 h-9 rounded-full border bg-white shadow-sm hover:shadow-md transition-all"
        >
          <BugIcon size={16} />
        </button>
      )}
    </div>
  )
}
