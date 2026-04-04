/**
 * QuestionCard — displays a single TIPI item with its LikertScale.
 * Props:
 *   item      {object}  — TIPI item from tipi.js
 *   index     {number}  — 1-based question number
 *   value     {number|null}
 *   onChange  {(value: number) => void}
 */
import LikertScale from './LikertScale'

export default function QuestionCard({ item, index, value, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
        Item {index}
      </p>
      <p className="text-lg sm:text-xl font-medium text-gray-900 mb-6 leading-snug">
        I see myself as someone who is <span className="text-gray-700 italic">{item.text}</span>
      </p>
      <LikertScale value={value} onChange={onChange} />
    </div>
  )
}
