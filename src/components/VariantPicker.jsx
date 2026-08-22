/**
 * VariantPicker — which variety of the language the instrument is answered in.
 *
 * Only shown when a language actually has more than one, which today is French
 * alone. It sits on the intro screen beside the scale summary, before the
 * reader starts, because the choice changes every item they are about to read
 * and cannot be made halfway through.
 *
 * Each option says where its text comes from. That is the point of offering
 * the choice rather than picking one: Gravel's Canadian is a published
 * translation used as published, and the European one is Cèrcol's adaptation
 * of it. A reader who cares which they are answering can tell.
 */
import { useTranslation } from 'react-i18next'
import { SectionLabel } from './ui'
import { variantsFor, activeVariant } from '../data/instrument-variants'
import { colors } from '../design/tokens'

export default function VariantPicker({ value, onChange }) {
  const { t, i18n } = useTranslation()
  const options = variantsFor(i18n.language)
  if (!options.length) return null
  const current = activeVariant(i18n.language, value)

  return (
    <div>
      <SectionLabel color="gray" className="mb-1">{t('common.variantLabel')}</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((v) => {
          const selected = v.code === current
          return (
            <button
              key={v.code}
              type="button"
              onClick={() => onChange(v.code)}
              aria-pressed={selected}
              title={v.source}
              className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                selected
                  ? 'border-[var(--mm-color-blue)] text-[var(--mm-color-blue)] font-semibold'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {v.label}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: colors.textMuted }}>
        {t(`common.variantNote.${options.find((v) => v.code === current)?.provenance ?? 'published'}`)}
      </p>
    </div>
  )
}
