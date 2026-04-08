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
