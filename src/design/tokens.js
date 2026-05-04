/**
 * Cèrcol Design Tokens — re-exported from mm-design.
 *
 * mm-design is the single source of truth for all design tokens.
 * This file is a shim that re-exports everything so existing imports
 * (`import { colors } from '../design/tokens'`) continue to work unchanged.
 *
 * NEVER add local token values here. If a new token is needed,
 * add it to mm-design first, then it will be available here automatically.
 */
export {
  colors,
  fonts,
  spacing,
  DOMAIN_COLORS,
  DOMAIN_ICON_CLASSES,
  DOMAIN_BG_CLASSES,
  BALANCE_COLORS,
  ROLE_COLORS,
  INTERACTIVE_COLORS,
  GRAY,
  BRAND_TINTS,
  BRAND_COLOR_DATA,
} from 'mm-design/tokens/index.js'
