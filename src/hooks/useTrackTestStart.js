import { useEffect, useRef } from 'react'
import { trackEvent } from '../lib/api'

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
  useEffect(() => {
    trackEvent('test_start', { instrument })
    // Fire once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/**
 * useTrackTestProgress — fire one `test_progress` event each time the taker
 * crosses a new tenth of the instrument.
 *
 * The funnel could say how many people started and how many finished, but
 * never where the ones in between gave up, which is the only part of it a
 * person can act on. Deciles keep it to at most nine rows per session: one
 * event per answered item would be 120 rows for a Full Moon sitting.
 *
 * The milestone travels in the event's `slug` column as a bare percentage
 * ('10' .. '90'). It is the only free text column on `events` and adding one
 * for a number this small is not worth a D1 migration; the daily brief reads
 * it back with CAST(slug AS INTEGER).
 *
 * @param {'newMoon'|'firstQuarter'|'fullMoon'} instrument
 * @param {number} current 1-based index of the item on screen
 * @param {number} total   items in the whole instrument, block layout aside
 */
export function useTrackTestProgress(instrument, current, total) {
  const reached = useRef(0)
  useEffect(() => {
    const decile = decileReached(current, total)
    if (decile == null || decile <= reached.current) return
    reached.current = decile
    trackEvent('test_progress', { instrument, slug: String(decile * 10) })
  }, [instrument, current, total])
}

/**
 * The completed tenth an item index sits in, or null when there is nothing
 * to report: before the first tenth, and at the last item, where the
 * `results` row is the better record of a finish than a 100% milestone.
 */
export function decileReached(current, total) {
  if (!current || !total) return null
  const decile = Math.floor((current / total) * 10)
  return decile > 0 && decile < 10 ? decile : null
}
