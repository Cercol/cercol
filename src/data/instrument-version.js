/**
 * Which version of the instruments produced a stored result.
 *
 * # Spec: docs/policies/dataset-versions.md
 *
 * A score only means something alongside the items that produced it. Change an
 * item, its translation, or the scale it is answered on, and two rows that look
 * identical are answers to different questions. Without a stamp there is no way
 * to tell them apart afterwards, and no way to say "valid up to version N".
 *
 * So every result carries the version of the instruments the respondent
 * actually saw. The client sends it rather than the Worker stamping it,
 * because a visitor on a cached bundle answered the old items: their bundle is
 * the truth about what they were asked, not whatever the Worker was deployed
 * with that morning.
 *
 * This does NOT track norms. Norms are applied when a result is displayed, not
 * when it is stored, and stored scores are raw means on the instrument's own
 * scale (1-5, or 1-7 for New Moon). Renorming changes what a result looks like
 * to its owner; it does not change the data. That is the whole reason to store
 * raw means, and it is why the 2026-08-04 renorming did not bump this number.
 *
 * Bump it, and add an entry to the changelog, when any of these change:
 *   - an item's wording, in any of the six languages
 *   - which items belong to a scale
 *   - the response scale or its labels
 *   - the number or structure of Witness rounds
 */
export const INSTRUMENT_VERSION = 6
