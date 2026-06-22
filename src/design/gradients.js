/**
 * Shared gradient constants.
 *
 * mm-design has no token for the dark-blue gradient stop (#00297a), so the
 * brand-blue gradient lives here in ONE place rather than being copy-pasted
 * across pages. The light stop uses the mm-design blue token; only the dark
 * stop is a local literal.
 *
 * If mm-design later adds a matching dark-blue token, replace the literal
 * below and this stays the single source of truth.
 */
export const BRAND_BLUE_GRADIENT =
  'linear-gradient(135deg, var(--mm-color-blue) 0%, #00297a 100%)'
