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
