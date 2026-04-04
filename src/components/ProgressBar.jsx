/**
 * ProgressBar — shows how far through the questionnaire the user is.
 * Props:
 *   current  {number} — number of answered questions
 *   total    {number} — total number of questions
 *   label    {string} — optional override for the left-side text (i18n)
 */
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
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
