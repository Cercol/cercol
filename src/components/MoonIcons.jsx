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

/**
 * R01 — Dolphin: full leaping side profile — long rostrum/beak, dorsal fin,
 * pectoral fin, forked tail flukes. Smooth arc from tail (lower-left) to head (upper-right).
 */
export function DolphinIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Main body arc: tail → head */}
      <path strokeWidth="1.8" d="M4 27 C6 20 11 12 17 9 C21.5 7 26 7.5 28.5 12" />
      {/* Long rostrum / beak — the unmistakeable dolphin feature */}
      <path strokeWidth="1.8" d="M28.5 12 C30.5 10 31 8 28.5 7.5" />
      {/* Dorsal fin */}
      <path strokeWidth="1.6" d="M18 9.5 C18.5 6.5 20 5.5 20.5 9" />
      {/* Pectoral fin */}
      <path strokeWidth="1.4" d="M21 13 C23 15 23.5 18.5 21 19" />
      {/* Tail upper fluke */}
      <path strokeWidth="1.6" d="M4 27 C2.5 24.5 2 21.5 3.5 20" />
      {/* Tail lower fluke */}
      <path strokeWidth="1.6" d="M4 27 C3 29.5 2.5 31 5.5 31" />
      {/* Eye */}
      <line strokeWidth="2.8" x1="26" y1="11" x2="26.1" y2="11" />
    </svg>
  )
}

/**
 * R02 — Wolf: front-facing head — two sharply pointed ears, elongated muzzle,
 * nose bridge, eye dots.
 */
export function WolfIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Head/face outline */}
      <path strokeWidth="1.8" d="M10 28 C8.5 23 8.5 16 11 12 C13 9.5 14.5 8.5 16 8.5 C17.5 8.5 19 9.5 21 12 C23.5 16 23.5 23 22 28" />
      {/* Left ear: tall sharp triangle */}
      <path strokeWidth="1.8" d="M11 12 L9 5 L15.5 11" />
      {/* Right ear: tall sharp triangle */}
      <path strokeWidth="1.8" d="M21 12 L23 5 L16.5 11" />
      {/* Lower muzzle / jaw edge */}
      <path strokeWidth="1.5" d="M13 22 C13.5 25.5 15 27.5 16 27.5 C17 27.5 18.5 25.5 19 22" />
      {/* Nose bridge */}
      <path strokeWidth="1.4" d="M14.5 20 C15 18.5 17 18.5 17.5 20" />
      {/* Eyes */}
      <line strokeWidth="2.8" x1="13.5" y1="16.5" x2="13.6" y2="16.5" />
      <line strokeWidth="2.8" x1="18.5" y1="16.5" x2="18.6" y2="16.5" />
    </svg>
  )
}

/**
 * R03 — Elephant: side view — enormous fan ear (left), long curved trunk
 * hanging down, heavy body mass, short tusk, eye.
 */
export function ElephantIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Body: large rounded mass */}
      <path strokeWidth="1.8" d="M10 23 C10 16 13 10 18 9.5 C23 9 27 13 27 18.5 C27 24 24 28 18 28.5 C13.5 29 10 27 10 23 Z" />
      {/* Large fan ear — THE defining elephant feature */}
      <path strokeWidth="1.8" d="M10 21 C6 18 4.5 13 6 8.5 C7.5 5 11 4.5 12.5 7 C14 9.5 12.5 15 11 20" />
      {/* Long trunk curling down from face */}
      <path strokeWidth="1.8" d="M9.5 12 C7 14 5.5 18.5 6 23 C6.5 26 8 28 9 28" />
      {/* Short tusk */}
      <path strokeWidth="1.4" d="M9.5 13.5 C8 15 7 17.5 8 20" />
      {/* Eye */}
      <line strokeWidth="2.8" x1="15" y1="13" x2="15.1" y2="13" />
      {/* Front legs hinted at the base */}
      <path strokeWidth="1.4" d="M13.5 28.5 L13.5 31 M17.5 29 L17.5 31.5" />
    </svg>
  )
}

/**
 * R04 — Owl: front-facing — round face disk, two large circle eyes with pupil dots,
 * downward beak, paired ear tufts pointing upward.
 */
export function OwlIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Round face disk */}
      <path strokeWidth="1.8" d="M16 7 C21.5 7 26 11.5 26 17.5 C26 22.5 21.5 27 16 27 C10.5 27 6 22.5 6 17.5 C6 11.5 10.5 7 16 7 Z" />
      {/* Left eye: large circle */}
      <circle cx="12" cy="17" r="3" strokeWidth="1.5" />
      {/* Right eye: large circle */}
      <circle cx="20" cy="17" r="3" strokeWidth="1.5" />
      {/* Pupil dots */}
      <line strokeWidth="2.5" x1="12" y1="17" x2="12.1" y2="17" />
      <line strokeWidth="2.5" x1="20" y1="17" x2="20.1" y2="17" />
      {/* Small downward beak */}
      <path strokeWidth="1.4" d="M15 20.5 L16 23 L17 20.5" />
      {/* Left ear tuft: two close upward lines */}
      <path strokeWidth="1.5" d="M10 8 L8.5 4.5 M11.5 7.5 L10.5 4" />
      {/* Right ear tuft */}
      <path strokeWidth="1.5" d="M22 8 L23.5 4.5 M20.5 7.5 L21.5 4" />
    </svg>
  )
}

/**
 * R05 — Eagle: PERCHED side view — compact body on a branch, very large hooked beak
 * (the hook is the key distinguisher from falcon), broad folded wing, fan tail, talons.
 */
export function EagleIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Branch / perch */}
      <path strokeWidth="1.5" d="M7 27 C11 26.5 21 26.5 25 27" />
      {/* Back outline: from tail up to nape */}
      <path strokeWidth="1.8" d="M22 27 C22 21 22 14 20 10 C18.5 7.5 17 7 16 7 C15 7 13.5 7.5 12 10" />
      {/* Chest / front curve */}
      <path strokeWidth="1.8" d="M12 10 C9.5 13.5 9.5 21 11 27" />
      {/* Head rounded top */}
      <path strokeWidth="1.8" d="M12 10 C12 7.5 20 7.5 20 10" />
      {/* VERY hooked beak — much larger hook than falcon, key eagle identifier */}
      <path strokeWidth="1.8" d="M12 11 C9.5 11 8 12.5 8.5 14.5 C9 16.5 11.5 17 12.5 15.5" />
      <path strokeWidth="1.5" d="M8.5 14 C8 15.5 9 17 11 17" />
      {/* Folded wing mass on back */}
      <path strokeWidth="1.5" d="M20 14 C23 14.5 26 17 26 21 C26 24 24.5 26.5 22.5 27" />
      {/* Tail feathers: fan at bottom */}
      <path strokeWidth="1.4" d="M11 27 C10 29 10 31 12 31" />
      <path strokeWidth="1.4" d="M16 27 L16.5 31" />
      <path strokeWidth="1.4" d="M22 27 C23 29 22.5 31 20.5 31" />
      {/* Talons */}
      <path strokeWidth="1.3" d="M13 27 L12 30 M15.5 27.5 L14.5 30 M18 27 L18.5 30" />
      {/* Eye */}
      <line strokeWidth="2.8" x1="16.5" y1="10.5" x2="16.6" y2="10.5" />
    </svg>
  )
}

/**
 * R06 — Falcon: DIVING STOOP — slim body angled diagonally, long swept-back
 * pointed wings (not broad like eagle's), FACIAL TEARDROP MALAR STRIPE running
 * from eye downward (the signature falcon marking), pointed (not hooked) beak.
 */
export function FalconIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Slim body: angled from upper-left to lower-right in a dive */}
      <path strokeWidth="1.8" d="M10 5 C13 9 18.5 17 21 23 C22.5 26.5 22.5 29.5 21 30.5" />
      {/* Left wing: long, swept far back, very pointed tip */}
      <path strokeWidth="1.8" d="M12.5 9 C9.5 7.5 5.5 8.5 3.5 12.5 C2.5 15 4 17.5 5.5 16.5" />
      {/* Right wing: swept back, pointed */}
      <path strokeWidth="1.8" d="M15 13.5 C17.5 10.5 22 8 26.5 9 C28.5 9.5 29 11.5 27.5 13" />
      {/* Head: small, compact, rounded */}
      <path strokeWidth="1.6" d="M10 5 C11 3 13.5 2.5 15 4.5 C15.5 5.5 15 7.5 14 8.5" />
      {/* Pointed beak — distinctly less hooked than the eagle */}
      <path strokeWidth="1.5" d="M10 5 C8.5 5 7.5 6.5 8.5 7.5" />
      {/* FACIAL TEARDROP / malar stripe — THE falcon identifier */}
      <path strokeWidth="1.7" d="M12 7 C11.5 9.5 11.5 12.5 13 13" />
      {/* Eye */}
      <line strokeWidth="2.8" x1="13" y1="5.5" x2="13.1" y2="5.5" />
    </svg>
  )
}

/**
 * R07 — Octopus: top view — round mantle, five visible curling tentacles
 * (two outer ones curl back with a characteristic hook), two eye dots.
 */
export function OctopusIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Round mantle / head */}
      <path strokeWidth="1.8" d="M16 4.5 C21 4.5 25.5 8.5 25 13 C24.5 17 21 19.5 16 19.5 C11 19.5 7.5 17 7 13 C6.5 8.5 11 4.5 16 4.5 Z" />
      {/* Tentacle 1: left outer — curls back */}
      <path strokeWidth="1.5" d="M9.5 17 C8.5 21 7.5 24 8.5 27 C9 29 7 30.5 6 29.5" />
      {/* Tentacle 2 */}
      <path strokeWidth="1.5" d="M13 19 C12.5 22.5 12.5 26 14 29" />
      {/* Tentacle 3: center */}
      <path strokeWidth="1.5" d="M16 19.5 C16 23 17 26.5 17 29" />
      {/* Tentacle 4 */}
      <path strokeWidth="1.5" d="M19 19 C19.5 22.5 20.5 26 19 29" />
      {/* Tentacle 5: right outer — curls back */}
      <path strokeWidth="1.5" d="M22.5 17 C23.5 21 24.5 24 23.5 27 C23 29 25 30.5 26 29.5" />
      {/* Eyes */}
      <line strokeWidth="2.8" x1="13" y1="11.5" x2="13.1" y2="11.5" />
      <line strokeWidth="2.8" x1="19" y1="11.5" x2="19.1" y2="11.5" />
    </svg>
  )
}

/**
 * R08 — Tortoise: side view — very high domed shell with scute grid lines
 * (3 vertical + 1 horizontal ring), small rounded head on neck extending right,
 * four stubby leg stubs at base.
 */
export function TortoiseIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* High dome shell */}
      <path strokeWidth="1.8" d="M8 23 C8 15 11.5 8.5 16 8.5 C20.5 8.5 24 15 24 23 C24 25.5 22 27.5 19 28 C17 28.5 15 28.5 13 28 C10 27.5 8 25.5 8 23 Z" />
      {/* Shell scute vertical lines */}
      <path strokeWidth="1.2" d="M12.5 9.5 L12 28" />
      <path strokeWidth="1.2" d="M16 8.5 L16 28.5" />
      <path strokeWidth="1.2" d="M19.5 9.5 L20 28" />
      {/* Shell scute horizontal ring */}
      <path strokeWidth="1.2" d="M9 19 C12 20 20 20 23 19" />
      {/* Neck + head extending right */}
      <path strokeWidth="1.6" d="M24 21 C26.5 20 29 20 30 22 C30.5 23 29.5 24.5 28 24.5 C26.5 24.5 25.5 23.5 24 23" />
      <line strokeWidth="2.5" x1="28.5" y1="21.5" x2="28.6" y2="21.5" />
      {/* Legs */}
      <path strokeWidth="1.3" d="M11 28 L10 31 M14.5 28.5 L14 31" />
      <path strokeWidth="1.3" d="M21 28 L22 31 M17.5 28.5 L17.5 31" />
    </svg>
  )
}

/**
 * R09 — Bee: side view — oval striped abdomen with three horizontal stripe lines,
 * two wings fanning upward, round head with antennae and dot tips.
 */
export function BeeIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Abdomen: oval body */}
      <path strokeWidth="1.8" d="M16 13 C20.5 13 24 16.5 24 21 C24 25.5 20.5 28.5 16 28.5 C11.5 28.5 8 25.5 8 21 C8 16.5 11.5 13 16 13 Z" />
      {/* Abdomen stripes */}
      <path strokeWidth="1.3" d="M8.5 18.5 C11 18 21 18 23.5 18.5" />
      <path strokeWidth="1.3" d="M8 22 C10.5 21.5 21.5 21.5 24 22" />
      <path strokeWidth="1.3" d="M9.5 25.5 C12 25 20 25 22.5 25.5" />
      {/* Left wing */}
      <path strokeWidth="1.5" d="M13.5 13 C11.5 9.5 7.5 9 8.5 13.5" />
      {/* Right wing */}
      <path strokeWidth="1.5" d="M18.5 13 C20.5 9.5 24.5 9 23.5 13.5" />
      {/* Head: round dome between wings */}
      <path strokeWidth="1.6" d="M13 13 C13 10 19 10 19 13" />
      {/* Antennae */}
      <path strokeWidth="1.3" d="M14.5 10 C13.5 8 12 6.5 10.5 5.5" />
      <path strokeWidth="1.3" d="M17.5 10 C18.5 8 20 6.5 21.5 5.5" />
      <line strokeWidth="2.5" x1="10.5" y1="5.5" x2="10.6" y2="5.5" />
      <line strokeWidth="2.5" x1="21.5" y1="5.5" x2="21.6" y2="5.5" />
    </svg>
  )
}

/**
 * R10 — Bear: front-facing head — large round face filling the canvas,
 * two small round ears, oval muzzle protruding from lower face, nose, eye dots.
 */
export function BearIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Large round head */}
      <path strokeWidth="1.8" d="M6 18 C6 11 10.5 6 16 6 C21.5 6 26 11 26 18 C26 24 21.5 29 16 29 C10.5 29 6 24 6 18 Z" />
      {/* Left ear: small round bump */}
      <path strokeWidth="1.6" d="M8 11 C7 8 11 6.5 12 9.5" />
      {/* Right ear: small round bump */}
      <path strokeWidth="1.6" d="M24 11 C25 8 21 6.5 20 9.5" />
      {/* Muzzle: oval lower-face protrusion */}
      <path strokeWidth="1.5" d="M12 22.5 C12 20 20 20 20 22.5 C20 25 18 27 16 27 C14 27 12 25 12 22.5 Z" />
      {/* Nose */}
      <path strokeWidth="1.4" d="M14.5 22 C15 21 17 21 17.5 22" />
      {/* Eyes */}
      <line strokeWidth="2.8" x1="12.5" y1="16.5" x2="12.6" y2="16.5" />
      <line strokeWidth="2.8" x1="19.5" y1="16.5" x2="19.6" y2="16.5" />
    </svg>
  )
}

/**
 * R11 — Fox: sitting side profile — compact body, one sharp upright ear,
 * pointed muzzle extending forward, and the signature LARGE BUSHY TAIL
 * that sweeps up and around behind the body.
 */
export function FoxIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Body: sitting, compact */}
      <path strokeWidth="1.8" d="M10 27 C9 22.5 9 17 11.5 13 C13 10 14.5 9.5 16 9.5 C17.5 9.5 19 10.5 20 13 C21.5 17 21 22.5 20 27" />
      {/* Sharp upright pointed ear */}
      <path strokeWidth="1.8" d="M11.5 13 L10 7 L15.5 12" />
      {/* Pointed muzzle / snout extending forward */}
      <path strokeWidth="1.5" d="M11.5 15 C9 16 7 18 7.5 20.5 C8 22.5 10 23 11 22" />
      {/* LARGE BUSHY TAIL — sweeping up and around behind the body */}
      <path strokeWidth="1.8" d="M20 27 C24 25 28 22 29.5 17.5 C30.5 14 29.5 10 27.5 9 C25.5 8 23 9.5 21.5 12.5" />
      {/* Outer fluffy tail edge */}
      <path strokeWidth="1.5" d="M20 27 C22.5 29.5 25.5 30.5 28 29.5 C30 28.5 30.5 26 29.5 25" />
      {/* Tail white tip */}
      <path strokeWidth="1.4" d="M28 29.5 C29.5 31 30.5 30.5 31 29" />
      {/* Eye */}
      <line strokeWidth="2.8" x1="13.5" y1="13" x2="13.6" y2="13" />
      {/* Front paws at bottom */}
      <path strokeWidth="1.3" d="M12 27 L12 30 M16 27.5 L16 30" />
    </svg>
  )
}

/**
 * R12 — Badger: front-facing — wide stocky body, small round ears, and the signature
 * facial stripe pattern: two thick dark stripes flanking a central white stripe,
 * running from forehead to snout. Eye dots sit within the dark stripes.
 */
export function BadgerIcon({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} {...ANIMAL_SVG_PROPS} className={className} style={style}>
      {/* Wide stocky body */}
      <path strokeWidth="1.8" d="M5 22 C5 17 9 12.5 16 12.5 C23 12.5 27 17 27 22 C27 26 23.5 29 16 29 C8.5 29 5 26 5 22 Z" />
      {/* Head: raised at top center */}
      <path strokeWidth="1.8" d="M11 12.5 C11 8.5 21 8.5 21 12.5" />
      {/* Ears: small round bumps */}
      <path strokeWidth="1.5" d="M12 8.5 C11 6.5 13.5 5.5 14 7.5" />
      <path strokeWidth="1.5" d="M20 8.5 C21 6.5 18.5 5.5 18 7.5" />
      {/* LEFT dark facial stripe — key badger identifier */}
      <path strokeWidth="2" d="M13 8.5 C12.5 10 12.5 12 13 12.5" />
      {/* RIGHT dark facial stripe */}
      <path strokeWidth="2" d="M19 8.5 C19.5 10 19.5 12 19 12.5" />
      {/* Wide snout at base of face */}
      <path strokeWidth="1.5" d="M14 13 C14.5 12 17.5 12 18 13" />
      {/* Eyes (sit within the dark stripes) */}
      <line strokeWidth="2.8" x1="13" y1="10" x2="13.1" y2="10" />
      <line strokeWidth="2.8" x1="19" y1="10" x2="19.1" y2="10" />
      {/* Claws at bottom */}
      <path strokeWidth="1.3" d="M8 29 L7.5 31 M11 29.5 L11 31.5 M14 29.5 L14 31.5 M18 29.5 L18 31.5 M21 29.5 L21 31.5 M24 29 L24.5 31" />
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
