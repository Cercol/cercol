/**
 * QuestionCard — displays a single CBF item with its LikertScale.
 * Props:
 *   item        {object}      — item from cercol-big-five.js
 *   index       {number}      — 1-based question number
 *   value       {number|null}
 *   onChange    {(value: number) => void}
 *   scalePoints {number}      — passed through to LikertScale
 */
import { useTranslation } from 'react-i18next'
import LikertScale from './LikertScale'

export default function QuestionCard({ item, index, value, onChange, scalePoints = 5 }) {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
        {t('test.itemPrefix')} {index}
      </p>
      <p className="text-lg sm:text-xl font-medium text-gray-900 mb-6 leading-snug italic">
        "{item.text}"
      </p>
      <LikertScale value={value} onChange={onChange} scalePoints={scalePoints} />
    </div>
  )
}
