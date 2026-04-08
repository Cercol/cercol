/**
 * MoonIcons — SVG moon phase icons in Cèrcol line style.
 *
 * Monocolor stroke-based, slightly imperfect hand-crafted quality
 * matching the brand's rice-grain illustration system.
 * All icons use currentColor — place color on the parent or via className/style.
 *
 * Moon phase icons (32×32 viewBox): NewMoonIcon, FirstQuarterIcon, FullMoonIcon
 * Functional icons  (24×24 viewBox): CheckIcon, ArrowLeftIcon, ArrowRightIcon,
 *   KeyboardIcon, InfoCircleIcon, XIcon, ChevronRightIcon, ShareIcon, BlindSpotsIcon
 *
 * Usage:
 *   <NewMoonIcon size={40} style={{ color: colors.red }} />
 *   <FullMoonIcon size={13} className="inline-block align-middle" />
 *   <ArrowLeftIcon size={14} />
 */

/**
 * NewMoonIcon — dark circle with diagonal hatching suggesting an unlit face.
 * The hatching lines are pre-clipped to the circle radius so no clipPath ID is needed.
 */
export function NewMoonIcon({ size = 32, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Slightly irregular circle outline */}
      <path
        strokeWidth="1.8"
        d="M16 4.5 C22.5 4 28.5 9.5 28 16 C27.5 22.5 22 28 16 27.5 C9.5 28 3.5 22 4 16 C4.5 9.5 9.5 4 16 4.5 Z"
      />
      {/* Diagonal hatching (upper-left → lower-right, pre-clipped to circle radius 12) */}
      <line strokeWidth="1.3" x1="4.2"  y1="15.8" x2="16.2" y2="3.8"  />
      <line strokeWidth="1.3" x1="5.1"  y1="20.9" x2="20.9" y2="5.1"  />
      <line strokeWidth="1.3" x1="7.5"  y1="24.5" x2="24.5" y2="7.5"  />
      <line strokeWidth="1.3" x1="11.1" y1="26.9" x2="26.9" y2="11.1" />
      <line strokeWidth="1.3" x1="15.8" y1="27.8" x2="27.8" y2="15.8" />
    </svg>
  )
}

/**
 * FirstQuarterIcon — right half illuminated, slight inward terminator curve.
 * Single closed path: outer right arc + terminator curve returning to top.
 */
export function FirstQuarterIcon({ size = 32, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/*
        Right arc (lit half): (16,4.5) → right around → (16,27.5)
        Terminator (shadow boundary): (16,27.5) → slight leftward bow → (16,4.5)
        The terminator bows gently left — physically accurate and visually distinctive.
      */}
      <path
        strokeWidth="1.8"
        d="M16 4.5
           C22.5 4 28.5 9.5 28 16.5
           C27.5 23 21.5 28 16 27.5
           C14.5 21.5 14 10.5 16 4.5 Z"
      />
    </svg>
  )
}

/**
 * FullMoonIcon — nearly-circular disk with three small irregular crater marks.
 */
export function FullMoonIcon({ size = 32, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Slightly irregular circle */}
      <path
        strokeWidth="1.8"
        d="M16 4.5 C22.5 4 28 9.5 27.5 16 C27 22.5 22.5 28 16 27.5 C9.5 28 4 22 4.5 16 C5 9.5 9.5 4 16 4.5 Z"
      />
      {/* Crater 1 — small oval near upper-left of disk */}
      <path
        strokeWidth="1.2"
        d="M10 13.5 C10 12.2 13 12.2 13 13.5 C13 14.8 10 14.8 10 13.5 Z"
      />
      {/* Crater 2 — small oval lower-right */}
      <path
        strokeWidth="1.2"
        d="M19.5 20.5 C19.5 19.5 21.5 19.5 21.5 20.5 C21.5 21.5 19.5 21.5 19.5 20.5 Z"
      />
      {/* Crater 3 — tiny mark upper-right */}
      <path
        strokeWidth="1"
        d="M18.5 9.5 C18.5 8.8 20 8.8 20 9.5 C20 10.2 18.5 10.2 18.5 9.5 Z"
      />
    </svg>
  )
}

/**
 * CheckIcon — a simple hand-drawn checkmark.
 * Used for completion/confirmation states.
 */
export function CheckIcon({ size = 32, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Two bezier segments: down to the valley, then up to upper-right */}
      <path
        strokeWidth="2.5"
        d="M5 16.5 C7.5 19 10.5 23 12.5 25 C17 20 22 13 27.5 6.5"
      />
    </svg>
  )
}

// ── Functional icons (24×24 viewBox) ──────────────────────────────────────────
// These are used inline in UI elements (buttons, legends, labels).
// Stroke-based, no fills, slightly organic curves to match brand style.

/**
 * ArrowLeftIcon — hand-drawn left-pointing arrow. Back navigation.
 */
export function ArrowLeftIcon({ size = 24, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Shaft with slight natural curve */}
      <path strokeWidth="1.9" d="M19 12 C16 11.8 9 12.2 5.5 12" />
      {/* Arrowhead */}
      <path strokeWidth="1.9" d="M5.5 12 L10 7.5 M5.5 12 L10 16.5" />
    </svg>
  )
}

/**
 * ArrowRightIcon — hand-drawn right-pointing arrow. Next / advance navigation.
 */
export function ArrowRightIcon({ size = 24, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Shaft */}
      <path strokeWidth="1.9" d="M5 12 C8 12.2 15 11.8 18.5 12" />
      {/* Arrowhead */}
      <path strokeWidth="1.9" d="M18.5 12 L14 7.5 M18.5 12 L14 16.5" />
    </svg>
  )
}

/**
 * KeyboardIcon — simplified keyboard outline with key rows.
 * Used beside keyboard shortcut hints.
 */
export function KeyboardIcon({ size = 24, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Keyboard body */}
      <rect x="2" y="6" width="20" height="12" rx="1.5" strokeWidth="1.6" />
      {/* Top row — three key caps */}
      <rect x="5"    y="9.5" width="3" height="2" rx="0.5" strokeWidth="1.1" />
      <rect x="10.5" y="9.5" width="3" height="2" rx="0.5" strokeWidth="1.1" />
      <rect x="16"   y="9.5" width="3" height="2" rx="0.5" strokeWidth="1.1" />
      {/* Bottom row — spacebar */}
      <rect x="7" y="13.5" width="10" height="2" rx="0.5" strokeWidth="1.1" />
    </svg>
  )
}

/**
 * InfoCircleIcon — circle with an "i" inside. Replaces the manual (i) tooltip button.
 */
export function InfoCircleIcon({ size = 24, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Outer circle — slightly irregular for brand warmth */}
      <path strokeWidth="1.7" d="M12 3.5 C16.5 3.2 20.8 7.2 20.5 12 C20.2 16.8 16.3 20.8 12 20.5 C7.7 20.8 3.5 16.5 3.5 12 C3.5 7.5 7.5 3.2 12 3.5 Z" />
      {/* i — dot above */}
      <line strokeWidth="2" x1="12" y1="8" x2="12" y2="8.1" />
      {/* i — stem */}
      <line strokeWidth="1.8" x1="12" y1="11" x2="12" y2="16" />
    </svg>
  )
}

/**
 * XIcon — simple × cross. Used for "worst fit" in the adjective legend.
 */
export function XIcon({ size = 24, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path strokeWidth="2" d="M7 7 L17 17 M17 7 L7 17" />
    </svg>
  )
}

/**
 * ChevronRightIcon — simple › chevron. Used as a list-row indicator.
 */
export function ChevronRightIcon({ size = 24, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path strokeWidth="2" d="M9 5.5 C11 7.5 14 10 16 12 C14 14 11 16.5 9 18.5" />
    </svg>
  )
}

/**
 * ShareIcon — upload-style arrow over a tray. Used on share/copy result buttons.
 */
export function ShareIcon({ size = 24, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Upward arrow shaft */}
      <path strokeWidth="1.9" d="M12 15.5 L12 5" />
      {/* Arrowhead */}
      <path strokeWidth="1.9" d="M12 5 L7.5 9.5 M12 5 L16.5 9.5" />
      {/* Tray / base platform */}
      <path strokeWidth="1.9" d="M5 17.5 L5 20 L19 20 L19 17.5" />
    </svg>
  )
}

/**
 * BlindSpotsIcon — two opposing arrows diverging from a central gap.
 * Represents self vs witness divergence (blind spots section).
 */
export function BlindSpotsIcon({ size = 24, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Left arrow — pointing away from center */}
      <path strokeWidth="1.8" d="M10.5 12 L4 12 M4 12 L7.5 8.5 M4 12 L7.5 15.5" />
      {/* Right arrow — pointing away from center */}
      <path strokeWidth="1.8" d="M13.5 12 L20 12 M20 12 L16.5 8.5 M20 12 L16.5 15.5" />
    </svg>
  )
}
