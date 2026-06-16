import { useEffect } from 'react'
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
