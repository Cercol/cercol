/**
 * AccuracyRating — one question on a results page: how well does this
 * describe you, 1 to 5.
 *
 * This is the only signal Cèrcol collects about whether a report lands. It
 * matters more than it looks: 41% of stored results sit close enough to a
 * second centroid that a small shift on one domain would rename the animal,
 * and self-rated accuracy is the cheapest way to find out whether people
 * notice. Write-once server side, so a shared link cannot restack it.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { rateResultAccuracy } from '../lib/api'
import { SectionLabel } from './ui'

const CHOICES = [1, 2, 3, 4, 5]

export default function AccuracyRating({ resultId }) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState(null)

  // No resultId means the page was opened from a shared link rather than a
  // finished test: there is nothing to rate.
  if (!resultId) return null

  function pick(value) {
    if (picked) return
    setPicked(value)
    // Fire and forget. A 409 (already rated) or a network failure must not
    // interrupt someone reading their own report.
    rateResultAccuracy(resultId, value).catch(() => {})
  }

  return (
    <div className="flex flex-col gap-2 items-center py-6">
      <SectionLabel color="gray">{t('accuracy.heading')}</SectionLabel>
      {picked ? (
        <p className="text-sm text-gray-500">{t('accuracy.thanks')}</p>
      ) : (
        <>
          <div className="flex gap-2" role="group" aria-label={t('accuracy.heading')}>
            {CHOICES.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => pick(v)}
                aria-label={t('accuracy.option', { value: v })}
                className="w-10 h-10 rounded border border-gray-200 text-sm text-gray-700 hover:border-[var(--mm-color-blue)] hover:text-[var(--mm-color-blue)] transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex justify-between w-full max-w-xs text-xs text-gray-400">
            <span>{t('accuracy.low')}</span>
            <span>{t('accuracy.high')}</span>
          </div>
        </>
      )}
    </div>
  )
}
