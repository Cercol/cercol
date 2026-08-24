import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '../lib/api'

// The bare language code ('es', not 'es-ES'): events.lang feeds the admin
// progress funnel, which filters on the six site languages.
const bareLang = (i18n) => (i18n.language || 'en').slice(0, 2)

/**
 * useTrackTestStart — fire one first-party `test_start` funnel event when an
 * instrument page mounts.
 *
 * Shared across the result-producing instruments (New Moon, First Quarter,
 * Full Moon) so they all emit identically and cannot drift. trackEvent is
 * prerender-guarded and fire-and-forget, so the build pass is excluded and the
 * call never throws.
 *
 * Intentionally NOT used by the Last Quarter team report (/groups/:id, an
 * aggregate view) or the Witness peer assessment: neither produces a `results`
 * row, so a `test_start` there would have no matching `test_complete` and would
 * distort the start-to-completion conversion in the weekly digest funnel.
 *
 * @param {'newMoon'|'firstQuarter'|'fullMoon'} instrument
 */
export function useTrackTestStart(instrument) {
  const { i18n } = useTranslation()
  useEffect(() => {
    trackEvent('test_start', { instrument, lang: bareLang(i18n) })
    // Fire once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/**
 * useTrackTestProgress — fire one `test_progress` event each time the taker
 * crosses a new whole percent of the instrument.
 *
 * The funnel could say how many people started and how many finished, but
 * never where the ones in between gave up, which is the only part of it a
 * person can act on. Until 2026-08-24 this fired per decile to cap the row
 * count; the admin Progress curve needs the exact stop point (question 18 of
 * 120 is 15%, not "the 10% bucket"), so it now fires per whole percent
 * crossed: at most 99 rows per sitting, and for instruments shorter than 100
 * items, one per answered item. At this scale that is far inside every D1
 * and Worker free-plan cap.
 *
 * The milestone travels in the event's `slug` column as a bare percentage
 * ('1' .. '99'). It is the only free text column on `events` and adding one
 * for a number this small is not worth a D1 migration; readers take it back
 * with CAST(slug AS INTEGER), which also still fits the decile-coded rows
 * logged before the change.
 *
 * @param {'newMoon'|'firstQuarter'|'fullMoon'} instrument
 * @param {number} current 1-based index of the item on screen
 * @param {number} total   items in the whole instrument, block layout aside
 */
export function useTrackTestProgress(instrument, current, total) {
  const { i18n } = useTranslation()
  const reached = useRef(0)
  useEffect(() => {
    const pct = pctReached(current, total)
    if (pct == null || pct <= reached.current) return
    reached.current = pct
    trackEvent('test_progress', { instrument, slug: String(pct), lang: bareLang(i18n) })
  }, [instrument, current, total, i18n])
}

/**
 * The whole percent an item index has completed, or null when there is
 * nothing to report: before 1%, and at the last item, where the `results`
 * row is the better record of a finish than a 100% milestone.
 */
export function pctReached(current, total) {
  if (!current || !total) return null
  const pct = Math.floor((current / total) * 100)
  return pct > 0 && current < total ? pct : null
}
