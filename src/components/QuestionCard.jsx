/**
 * QuestionCard — displays a single item with its LikertScale + keyboard hint.
 * Props:
 *   item        {object}                 — item from a data file
 *   index       {number}                 — 1-based question number
 *   value       {number|null}
 *   onChange    {(value: number) => void}
 *   scalePoints {number}                 — passed through to LikertScale (default 5)
 *   scaleLabels {Record<number, string>} — passed through to LikertScale
 *   prefixKey   {string}                 — i18n key for the item prefix (default 'test.itemPrefix')
 */
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'
import LikertScale from './LikertScale'

export default function QuestionCard({
  item,
  index,
  value,
  onChange,
  scalePoints = 5,
  scaleLabels = {},
  prefixKey = 'test.itemPrefix',
}) {
  const { t, i18n } = useTranslation()

  // item.text is { en, ca } — fall back to English if translation missing
  const itemText = typeof item.text === 'object'
    ? (item.text[i18n.language] ?? item.text.en)
    : item.text

  return (
    <div className="bg-white rounded border border-gray-200 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: colors.blue }}>
        {t(prefixKey)} {index}
      </p>
      <p className="text-lg sm:text-xl font-medium text-gray-900 mb-6 leading-snug italic">
        "{itemText}"
      </p>
      <LikertScale
        value={value}
        onChange={onChange}
        scalePoints={scalePoints}
        scaleLabels={scaleLabels}
      />
      {/* Keyboard hint — desktop only */}
      <p className="hidden sm:block mt-4 text-center text-xs text-gray-300">
        {t('keyboard.hint')}
      </p>
    </div>
  )
}
