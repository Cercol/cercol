/**
 * sendTranslationFeedback — stub.
 *
 * Previously wrote to the Supabase `translation_feedback` table.
 * After the Hetzner auth migration (Phase 15) Supabase is no longer used.
 * This function is kept as a no-op until a dedicated backend endpoint or
 * external feedback channel (e.g. a form submission service) is set up.
 */
export async function sendTranslationFeedback(_payload) {
  // no-op for now
}
