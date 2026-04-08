// Cèrcol Design Tokens
// Phase 1: neutral placeholder palette
// To update branding: change values here only, never elsewhere

export const colors = {
  // Primary
  primary:     '#2563EB',  // placeholder — will become Cèrcol brand color
  primaryDark: '#1E40AF',

  // Neutrals
  background:  '#FAFAFA',
  surface:     '#FFFFFF',
  border:      '#E5E7EB',
  textPrimary: '#111827',
  textMuted:   '#6B7280',

  // Semantic
  success:     '#10B981',
  warning:     '#F59E0B',
  error:       '#EF4444',

  // Role probability bars
  arcBar:      '#93c5fd',  // blue-300 — arc role bar fill
  arcLabel:    '#1d4ed8',  // blue-700 — arc role label text

  // Big Five dimension colors (radar chart)
  openness:          '#8B5CF6',
  conscientiousness: '#2563EB',
  extraversion:      '#F59E0B',
  agreeableness:     '#10B981',
  neuroticism:       '#EF4444',
}

export const fonts = {
  sans: '"Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
}

export const spacing = {
  pageMax: '720px',   // max content width
}
