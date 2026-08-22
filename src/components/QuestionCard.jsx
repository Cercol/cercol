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
 *   variant     {string}                 — chosen language variety, e.g. 'fr-CA'
 */
import { useTranslation } from 'react-i18next'
import { colors } from '../design/tokens'
import LikertScale from './LikertScale'
import { itemText as resolveItemText } from '../data/instrument-variants'
import { KeyboardIcon } from './MoonIcons'

export default function QuestionCard({
  item,
  index,
  value,
  onChange,
  scalePoints = 5,
  scaleLabels = {},
  prefixKey = 'test.itemPrefix',
  variant,
}) {
  const { t, i18n } = useTranslation()

  // Variant first, then the bare language, then English. A language whose
  // published translation exists in more than one variety (French: Gravel's
  // Canadian and the European adaptation of it) keys its items by variant,
  // so the reader's choice decides which text they answer.
  const itemText = resolveItemText(item.text, i18n.language, variant)

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
      <p className="hidden sm:flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-300">
        <KeyboardIcon size={14} />
        {t('keyboard.hint')}
      </p>
    </div>
  )
}
