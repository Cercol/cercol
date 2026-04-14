// Cèrcol Design Tokens — Phase 10.1
// Brand identity applied. Update only here, never in component files.

export const colors = {
  // Brand palette
  red:         '#cf3339',
  blue:        '#0047ba',
  yellow:      '#f1c22f',
  green:       '#427c42',
  white:       '#ffffff',
  black:       '#111111',

  // Semantic aliases
  primary:     '#cf3339',   // red — primary CTA
  primaryDark: '#a8262b',   // darker red

  // Surface / text
  background:  '#ffffff',
  surface:     '#ffffff',
  border:      '#d4d4d4',
  textPrimary: '#111111',
  textMuted:   '#666666',

  // Semantic status
  success:     '#427c42',   // green
  warning:     '#f1c22f',   // yellow
  error:       '#cf3339',   // red

  // Role probability bars
  arcBar:      '#0047ba',   // brand blue — arc role bar fill
  arcLabel:    '#0047ba',   // brand blue — arc role label text

  // Big Five dimension colors (radar chart)
  openness:          '#0047ba',   // Vision    → blue
  conscientiousness: '#f1c22f',   // Discipline → yellow
  extraversion:      '#cf3339',   // Presence  → red
  agreeableness:     '#427c42',   // Bond      → green
  neuroticism:       '#111111',   // Depth     → black
}

export const fonts = {
  display: '"Playfair Display", Georgia, serif',
  sans:    '"Roboto", system-ui, sans-serif',
  mono:    '"JetBrains Mono", monospace',
}

export const spacing = {
  pageMax: '720px',   // max content width for doc pages
}

/**
 * ROLE_COLORS — one distinct color per role (R01–R12).
 * Hues are evenly distributed across the full color wheel (30° apart),
 * all at similar saturation/darkness so each is legible on white.
 * Brand anchors: R01 uses brand red, R05 uses brand green.
 */
/**
 * DOMAIN_COLORS — hex bar fill for each Big Five domain.
 * Used in DimensionRow, FacetAccordion, MyResultsPage, SciencePage, etc.
 * All files must import from here — never hardcode these values locally.
 */
export const DOMAIN_COLORS = {
  presence:   '#fbbf24',   // amber-400
  bond:       '#10b981',   // emerald-500
  vision:     '#427c42',   // brand green
  discipline: '#2563eb',   // blue-600
  depth:      '#ef4444',   // red-500
}

/**
 * DOMAIN_ICON_CLASSES — Tailwind text-color class per domain.
 * Used wherever DimensionIcon or a domain label needs the matching color.
 */
export const DOMAIN_ICON_CLASSES = {
  presence:   'text-amber-400',
  bond:       'text-emerald-500',
  vision:     'text-[#427c42]',
  discipline: 'text-blue-600',
  depth:      'text-red-500',
}

/**
 * DOMAIN_BG_CLASSES — Tailwind bg-color class per domain.
 * Used where a filled background (e.g. progress bar via Tailwind class) is needed.
 */
export const DOMAIN_BG_CLASSES = {
  presence:   'bg-amber-400',
  bond:       'bg-emerald-500',
  vision:     'bg-[#427c42]',
  discipline: 'bg-blue-600',
  depth:      'bg-red-500',
}

/**
 * BALANCE_COLORS — semantic status colors for BalancePill in LastQuarterPage.
 * Three states: good (green), caution (yellow), warning (red).
 */
export const BALANCE_COLORS = {
  balanced:     { bg: '#f0fdf4', text: '#166534' },
  tiltedHigh:   { bg: '#fef9c3', text: '#854d0e' },
  tiltedLow:    { bg: '#fef9c3', text: '#854d0e' },
  stronglyHigh: { bg: '#fee2e2', text: '#991b1b' },
  stronglyLow:  { bg: '#fee2e2', text: '#991b1b' },
  highGood:     { bg: '#f0fdf4', text: '#166534' },
  lowGood:      { bg: '#f0fdf4', text: '#166534' },
  lowCaution:   { bg: '#fee2e2', text: '#991b1b' },
  highCaution:  { bg: '#fee2e2', text: '#991b1b' },
}

/**
 * ROLE_COLORS — one distinct color per role (R01–R12).
 * Hues are evenly distributed across the full color wheel (30° apart),
 * all at similar saturation/darkness so each is legible on white.
 * Brand anchors: R01 uses brand red, R05 uses brand green.
 */
export const ROLE_COLORS = {
  R01: '#cf3339',   // Dolphin  — red       (brand)
  R02: '#d46010',   // Wolf     — orange
  R03: '#c08800',   // Elephant — amber
  R04: '#6a8800',   // Owl      — olive
  R05: '#427c42',   // Eagle    — green     (brand)
  R06: '#1a8c60',   // Falcon   — emerald
  R07: '#0d8888',   // Octopus  — teal
  R08: '#1a68b0',   // Tortoise — cerulean
  R09: '#3355c8',   // Bee      — cobalt
  R10: '#6630a8',   // Bear     — indigo
  R11: '#a030a0',   // Fox      — violet
  R12: '#b03070',   // Badger   — crimson
}
