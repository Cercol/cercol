/**
 * FeedbackButton — floating bottom-right button that opens a pre-filled
 * GitHub issue for bug reporting. Subtle styling so it does not compete
 * with main page content.
 */
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'

const ISSUE_URL =
  'https://github.com/miquelmatoses/cercol/issues/new?title=Bug+report&labels=bug'

export default function FeedbackButton() {
  const { t } = useTranslation()

  return (
    <a
      href={ISSUE_URL}
      target="_blank"
      rel="noreferrer"
      style={{ color: colors.textMuted, borderColor: colors.border }}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-white text-xs font-medium shadow-sm hover:shadow-md hover:text-gray-700 transition-all"
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
  )
}
