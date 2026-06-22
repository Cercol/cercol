/**
 * roles.js — canonical role id list (R01..R12) and order.
 *
 * Single source of truth for which roles exist and in what order. Both the
 * /roles documentation page and the share-url helpers consume this, so the
 * role set can never drift between the two.
 *
 * Per-role colors live in mm-design (ROLE_COLORS in design/tokens); this file
 * only owns the ids and their canonical order.
 */

/** Valid role ids R01..R12, in canonical order. */
export const ROLE_IDS = Array.from({ length: 12 }, (_, i) => `R${String(i + 1).padStart(2, '0')}`)
