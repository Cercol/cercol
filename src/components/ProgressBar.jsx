/**
 * ProgressBar — shows how far through the questionnaire the user is.
 * Props:
 *   current  {number} — number of answered questions
 *   total    {number} — total number of questions
 *   label    {string} — optional override for the left-side text (i18n)
 */
import { colors } from '../design/tokens'

export default function ProgressBar({ current, total, label }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const leftLabel = label ?? `Question ${current} of ${total}`

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>{leftLabel}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: colors.blue }}
        />
      </div>
    </div>
  )
}
