/**
 * useInstrumentKeyboard — keyboard handler for all instrument pages.
 *
 * Shared by NewMoonPage, FirstQuarterPage, FullMoonPage to eliminate the
 * ~30-line duplicated useEffect in each.
 *
 * @param {object} opts
 * @param {string|number}   opts.itemId            — current item id (effect dep)
 * @param {number}          opts.scalePoints        — max scale value (1–N)
 * @param {React.RefObject} opts.showIntroRef       — ref for intro screen flag
 * @param {React.RefObject} [opts.showTransitionRef]— ref for block transition flag (FQ/FM only)
 * @param {function}        opts.onNumber           — called with (n) when digit key pressed
 * @param {React.RefObject} opts.onNextRef          — ref to next handler
 * @param {React.RefObject} opts.onBackRef          — ref to back handler
 * @param {function}        opts.onDismissIntro     — called when Enter/Space dismisses intro
 * @param {React.RefObject} [opts.onContinueBlockRef] — ref to continue-block handler (FQ/FM only)
 * @param {boolean}         [opts.enabled]            — when false, keyboard is disabled (default true)
 */
import { useEffect } from 'react'

export function useInstrumentKeyboard({
  itemId,
  scalePoints,
  showIntroRef,
  showTransitionRef = null,
  onNumber,
  onNextRef,
  onBackRef,
  onDismissIntro,
  onContinueBlockRef = null,
  enabled = true,
}) {
  useEffect(() => {
    function onKeyDown(e) {
      if (!enabled) return
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return

      if (showIntroRef.current) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onDismissIntro()
        }
        return
      }

      if (showTransitionRef?.current) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onContinueBlockRef?.current()
        }
        return
      }

      const n = parseInt(e.key, 10)
      if (n >= 1 && n <= scalePoints) {
        onNumber(n)
        return
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onNextRef.current()
        return
      }
      if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
        onBackRef.current()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, showTransitionRef?.current, enabled])
}
