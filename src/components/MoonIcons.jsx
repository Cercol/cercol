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

// ── Animal role icons (32×32 viewBox) ─────────────────────────────────────────
// One icon per role in the 12-animal system.
// Designed to capture the most recognisable silhouette feature of each animal.
// All use currentColor, stroke-only, slightly organic bezier paths.

const ANIMAL_SVG_PROPS = {
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

/** R01 — Dolphin: arcing body, dorsal fin, forked tail */
export function DolphinIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M4.5 22 C7 13 13 8 19.5 9 C23.5 9.5 27 13 27.5 17.5" />
      <path strokeWidth="1.6" d="M14.5 9.5 C14 7 14.5 5 16 7.5" />
      <path strokeWidth="1.6" d="M27.5 17.5 C29 14.5 30 12.5 28 11.5" />
      <path strokeWidth="1.6" d="M27.5 17.5 C29 20.5 30 22.5 28 23" />
      <line strokeWidth="2.5" x1="7" y1="20" x2="7.1" y2="20" />
    </svg>
  )
}

/** R02 — Wolf: front-facing head, two sharp pointed ears */
export function WolfIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M10 27 C8 23 8 17 10 13 C12 10 14 8.5 16 8.5 C18 8.5 20 10 22 13 C24 17 24 23 22 27" />
      <path strokeWidth="1.8" d="M11 13 L9.5 7 L15 11" />
      <path strokeWidth="1.8" d="M21 13 L22.5 7 L17 11" />
      <path strokeWidth="1.5" d="M12.5 21 C13.5 23 15 24 16 24 C17 24 18.5 23 19.5 21" />
      <path strokeWidth="1.3" d="M14.5 19 C15 18 17 18 17.5 19" />
      <line strokeWidth="2.5" x1="13" y1="16" x2="13.1" y2="16" />
      <line strokeWidth="2.5" x1="19" y1="16" x2="19.1" y2="16" />
    </svg>
  )
}

/** R03 — Elephant: large fan ear, trunk curving down, tusk */
export function ElephantIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M12 27 C8 25 7 21 7.5 17 C8 12 11 9 16 9 C21 9 24 12 24 17 C24 21 22 25 18 27" />
      <path strokeWidth="1.8" d="M7.5 17 C4.5 14 2.5 18 3.5 22 C4.5 25 7.5 25 9.5 22.5" />
      <path strokeWidth="1.8" d="M7.5 15 C5.5 16.5 4.5 20 5.5 24 C6.5 26.5 8.5 26 9.5 24.5" />
      <path strokeWidth="1.3" d="M7.5 22 C7 24 6.5 25.5 5.5 26.5" />
      <line strokeWidth="2.5" x1="15" y1="13" x2="15.1" y2="13" />
    </svg>
  )
}

/** R04 — Owl: round face, two large circular eyes, ear tufts, small beak */
export function OwlIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M16 7 C21 7 25 11 25 16 C25 21 21 25 16 25 C11 25 7 21 7 16 C7 11 11 7 16 7 Z" />
      <path strokeWidth="1.5" d="M11 15 C11 13 13.5 13 13.5 15 C13.5 17 11 17 11 15 Z" />
      <path strokeWidth="1.5" d="M18.5 15 C18.5 13 21 13 21 15 C21 17 18.5 17 18.5 15 Z" />
      <path strokeWidth="1.4" d="M14.5 18.5 L16 21 L17.5 18.5" />
      <path strokeWidth="1.4" d="M10.5 8.5 L9.5 5.5 M11.5 8 L10.5 5" />
      <path strokeWidth="1.4" d="M21.5 8.5 L22.5 5.5 M20.5 8 L21.5 5" />
      <line strokeWidth="2" x1="12.2" y1="15" x2="12.3" y2="15" />
      <line strokeWidth="2" x1="19.7" y1="15" x2="19.8" y2="15" />
    </svg>
  )
}

/** R05 — Eagle: wide spread wings, compact body, tail feathers */
export function EagleIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M16 14 C13 12 9 10.5 4.5 13.5" />
      <path strokeWidth="1.3" d="M4.5 13.5 C7 11 11 11 14 13" />
      <path strokeWidth="1.8" d="M16 14 C19 12 23 10.5 27.5 13.5" />
      <path strokeWidth="1.3" d="M27.5 13.5 C25 11 21 11 18 13" />
      <path strokeWidth="1.8" d="M14 13 C14 10.5 15 8.5 16 8.5 C17 8.5 18 10.5 18 13 C18 17 17 21.5 16 23 C15 21.5 14 17 14 13" />
      <path strokeWidth="1.3" d="M14 23 L13 27 M16 23 L16 27.5 M18 23 L19 27" />
      <path strokeWidth="1.4" d="M14.5 9 C14.5 7.5 17.5 7.5 17.5 9" />
    </svg>
  )
}

/** R06 — Falcon: streamlined dive, swept-back pointed wings */
export function FalconIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M16 5.5 C17 9 17.5 16 16.5 23 C16 25.5 15.5 27.5 16 28" />
      <path strokeWidth="1.8" d="M16 12 C13 13 9 15.5 6 19.5" />
      <path strokeWidth="1.3" d="M6 19.5 C8.5 16 11.5 13.5 14.5 13" />
      <path strokeWidth="1.8" d="M16 12 C19 13 23 15.5 26 19.5" />
      <path strokeWidth="1.3" d="M26 19.5 C23.5 16 20.5 13.5 17.5 13" />
      <path strokeWidth="1.5" d="M14 5.5 C14 3.5 18 3.5 18 5.5" />
      <path strokeWidth="1.3" d="M16 7 C15.5 8 15.5 9 17 8.5 L18 7.5" />
      <line strokeWidth="2.5" x1="15.5" y1="5.5" x2="15.6" y2="5.5" />
    </svg>
  )
}

/** R07 — Octopus: round mantle, five curling tentacles */
export function OctopusIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M16 5 C20.5 5 24.5 8.5 24 13.5 C23.5 17 20 18.5 16 18.5 C12 18.5 8.5 17 8 13.5 C7.5 8.5 11.5 5 16 5 Z" />
      <path strokeWidth="1.5" d="M9 16.5 C8 20 7.5 23 9 26 C9.5 27.5 7.5 29 6.5 28" />
      <path strokeWidth="1.5" d="M12.5 18 C12 21 12 24.5 13.5 27.5" />
      <path strokeWidth="1.5" d="M16 18.5 C16 22 16.5 25.5 17 28" />
      <path strokeWidth="1.5" d="M19.5 18 C20 21 20.5 24.5 19 27.5" />
      <path strokeWidth="1.5" d="M23 16.5 C24 20 24.5 23 23 26 C22.5 27.5 24.5 29 25.5 28" />
      <line strokeWidth="2.5" x1="13.5" y1="11" x2="13.6" y2="11" />
      <line strokeWidth="2.5" x1="18.5" y1="11" x2="18.6" y2="11" />
    </svg>
  )
}

/** R08 — Tortoise: high-domed shell with pattern lines, small head */
export function TortoiseIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M8.5 22 C8.5 14 11.5 8.5 16 8.5 C20.5 8.5 23.5 14 23.5 22 C23.5 24 21.5 26 18.5 26.5 C17 27 15 27 13.5 26.5 C10.5 26 8.5 24 8.5 22 Z" />
      <path strokeWidth="1.2" d="M13 9.5 L12.5 26" />
      <path strokeWidth="1.2" d="M16 8.5 L16 27" />
      <path strokeWidth="1.2" d="M19 9.5 L19.5 26" />
      <path strokeWidth="1.2" d="M9.5 18 C12 19 20 19 22.5 18" />
      <path strokeWidth="1.5" d="M23.5 20.5 C25.5 19.5 27.5 19.5 28 21.5 C28.5 23.5 26.5 25 24 24" />
      <line strokeWidth="2.5" x1="26.5" y1="20.5" x2="26.6" y2="20.5" />
      <path strokeWidth="1.3" d="M10.5 26.5 L10 29 M22 26.5 L22.5 29" />
    </svg>
  )
}

/** R09 — Bee: oval striped body, two wings above, antennae */
export function BeeIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M16 14 C20 14 23 17 23 21 C23 25 20 27 16 27 C12 27 9 25 9 21 C9 17 12 14 16 14 Z" />
      <path strokeWidth="1.3" d="M9.5 18.5 C12 18 20 18 22.5 18.5" />
      <path strokeWidth="1.3" d="M9 21.5 C11.5 21 20.5 21 23 21.5" />
      <path strokeWidth="1.3" d="M9.5 24.5 C12 24 20 24 22.5 24.5" />
      <path strokeWidth="1.5" d="M13.5 14 C11.5 10 8.5 9 9.5 13.5" />
      <path strokeWidth="1.5" d="M18.5 14 C20.5 10 23.5 9 22.5 13.5" />
      <path strokeWidth="1.3" d="M14.5 14 C13 11 11.5 8.5 10.5 7" />
      <path strokeWidth="1.3" d="M17.5 14 C19 11 20.5 8.5 21.5 7" />
      <line strokeWidth="2.5" x1="10.5" y1="7" x2="10.6" y2="7" />
      <line strokeWidth="2.5" x1="21.5" y1="7" x2="21.6" y2="7" />
    </svg>
  )
}

/** R10 — Bear: large round body, round ears, oval muzzle */
export function BearIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M16 12 C21 12 26 15.5 26 20.5 C26 25.5 21.5 28 16 28 C10.5 28 6 25.5 6 20.5 C6 15.5 11 12 16 12 Z" />
      <path strokeWidth="1.6" d="M10.5 13 C9.5 10 11.5 7.5 13.5 8.5 C15 9.5 14.5 12.5" />
      <path strokeWidth="1.6" d="M21.5 13 C22.5 10 20.5 7.5 18.5 8.5 C17 9.5 17.5 12.5" />
      <path strokeWidth="1.5" d="M12.5 21 C12.5 19 20 19 20 21 C20 23 18 24.5 16 24.5 C14 24.5 12.5 23 12.5 21 Z" />
      <path strokeWidth="1.3" d="M14.5 20.5 C14.5 20 17.5 20 17.5 20.5" />
      <line strokeWidth="2.5" x1="13" y1="17.5" x2="13.1" y2="17.5" />
      <line strokeWidth="2.5" x1="19" y1="17.5" x2="19.1" y2="17.5" />
    </svg>
  )
}

/** R11 — Fox: side profile, two sharp ears, distinctive bushy tail */
export function FoxIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M10 22 C8 20 8 16 9.5 13 C11 10 13.5 9.5 15.5 10.5 C17 9 19.5 9 20.5 10.5 C21.5 12 20.5 15 18 16 C20.5 17 22 20 21 23" />
      <path strokeWidth="1.8" d="M10 22 C11 24.5 15 26.5 18 25 C21 23.5 21.5 20 21 18" />
      <path strokeWidth="1.3" d="M13 25.5 C14 27.5 17 28 18.5 26.5" />
      <path strokeWidth="1.8" d="M12.5 10.5 L11.5 6 L16 9.5" />
      <path strokeWidth="1.5" d="M18 10 L19.5 6 L22.5 9" />
      <path strokeWidth="1.5" d="M9.5 13 C7.5 14.5 6 17 6.5 19.5 C7 21.5 8.5 22.5 10 22" />
      <line strokeWidth="2.5" x1="12" y1="13" x2="12.1" y2="13" />
      <line strokeWidth="2.5" x1="6.5" y1="19.5" x2="6.6" y2="19.5" />
    </svg>
  )
}

/** R12 — Badger: wide low body, face with two distinctive parallel stripes */
export function BadgerIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      <path strokeWidth="1.8" d="M5 20 C5 16 9 12 16 12 C23 12 27 16 27 20 C27 24 23 27 16 27 C9 27 5 24 5 20 Z" />
      <path strokeWidth="1.7" d="M12 12 C11 9.5 12 7 14 6.5 C15 6 17 6 18 6.5 C20 7 21 9.5 20 12" />
      <path strokeWidth="1.5" d="M14.5 6.5 L14 12" />
      <path strokeWidth="1.5" d="M17.5 6.5 L18 12" />
      <line strokeWidth="2.5" x1="13" y1="9" x2="13.1" y2="9" />
      <line strokeWidth="2.5" x1="19" y1="9" x2="19.1" y2="9" />
      <path strokeWidth="1.3" d="M14.5 11 C14.5 12 17.5 12 17.5 11" />
      <path strokeWidth="1.2" d="M8.5 27 L8 29.5 M12 27.5 L12 29.5 M20 27.5 L20 29.5 M23.5 27 L24 29.5" />
    </svg>
  )
}

// ── Convenience wrapper: RoleIcon ──────────────────────────────────────────────
// Maps a role key (R01–R12) to the corresponding animal icon component.

const ROLE_ICON_MAP = {
  R01: DolphinIcon,
  R02: WolfIcon,
  R03: ElephantIcon,
  R04: OwlIcon,
  R05: EagleIcon,
  R06: FalconIcon,
  R07: OctopusIcon,
  R08: TortoiseIcon,
  R09: BeeIcon,
  R10: BearIcon,
  R11: FoxIcon,
  R12: BadgerIcon,
}

/**
 * RoleIcon — renders the animal icon for a given role key.
 * Usage: <RoleIcon role="R01" size={28} />
 */
export function RoleIcon({ role, size = 32, className = '', style }) {
  const Icon = ROLE_ICON_MAP[role]
  return Icon ? <Icon size={size} className={className} style={style} /> : null
}

// ── Dimension icons (24×24 viewBox) ───────────────────────────────────────────
// Symbolic icons for the five OCEAN dimensions.

/** PresenceIcon (Extraversion) — radiating lines from a centre point */
export function PresenceIcon({ size = 24, className = '', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <circle cx="12" cy="12" r="2.2" strokeWidth="1.6" />
      <line strokeWidth="1.6" x1="12" y1="4" x2="12" y2="7.5" />
      <line strokeWidth="1.6" x1="17" y1="5.5" x2="15" y2="8" />
      <line strokeWidth="1.6" x1="20" y1="12" x2="16.5" y2="12" />
      <line strokeWidth="1.6" x1="17" y1="18.5" x2="15" y2="16" />
      <line strokeWidth="1.6" x1="12" y1="20" x2="12" y2="16.5" />
      <line strokeWidth="1.6" x1="7" y1="18.5" x2="9" y2="16" />
      <line strokeWidth="1.6" x1="4" y1="12" x2="7.5" y2="12" />
      <line strokeWidth="1.6" x1="7" y1="5.5" x2="9" y2="8" />
    </svg>
  )
}

/** BondIcon (Agreeableness) — two interlocking circles (chain link / bond) */
export function BondIcon({ size = 24, className = '', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <circle cx="9" cy="12" r="4.5" strokeWidth="1.6" />
      <circle cx="15" cy="12" r="4.5" strokeWidth="1.6" />
    </svg>
  )
}

/** VisionIcon (Openness) — eye outline with iris and pupil */
export function VisionIcon({ size = 24, className = '', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path strokeWidth="1.6" d="M2 12 C5 6.5 9 4.5 12 4.5 C15 4.5 19 6.5 22 12 C19 17.5 15 19.5 12 19.5 C9 19.5 5 17.5 2 12 Z" />
      <circle cx="12" cy="12" r="4" strokeWidth="1.4" />
      <line strokeWidth="2.5" x1="12" y1="12" x2="12.1" y2="12" />
    </svg>
  )
}

/** DepthIcon (Neuroticism / emotional depth) — three descending wave arcs */
export function DepthIcon({ size = 24, className = '', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path strokeWidth="1.6" d="M2.5 7.5 C6.5 10 17.5 10 21.5 7.5" />
      <path strokeWidth="1.6" d="M2.5 12.5 C6.5 15 17.5 15 21.5 12.5" />
      <path strokeWidth="1.6" d="M2.5 17.5 C6.5 20 17.5 20 21.5 17.5" />
      <path strokeWidth="1.4" d="M12 3.5 L12 6 M10 5 L12 3.5 L14 5" />
    </svg>
  )
}

/** DisciplineIcon (Conscientiousness) — three concentric circles (target) */
export function DisciplineIcon({ size = 24, className = '', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="5.5" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2" strokeWidth="1.4" />
    </svg>
  )
}

// ── Convenience wrapper: DimensionIcon ────────────────────────────────────────
// Maps a domain key to the corresponding dimension icon component.

const DIMENSION_ICON_MAP = {
  presence:   PresenceIcon,
  bond:       BondIcon,
  vision:     VisionIcon,
  depth:      DepthIcon,
  discipline: DisciplineIcon,
}

/**
 * DimensionIcon — renders the dimension icon for a given domain key.
 * Usage: <DimensionIcon domain="presence" size={16} className="text-amber-400" />
 */
export function DimensionIcon({ domain, size = 24, className = '', style }) {
  const Icon = DIMENSION_ICON_MAP[domain]
  return Icon ? <Icon size={size} className={className} style={style} /> : null
}
