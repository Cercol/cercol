/**
 * sendTranslationFeedback — submits a translation suggestion to the backend.
 *
 * Returns true on success, false if the endpoint is unavailable.
 * The backend endpoint (POST /translation-feedback) is not yet implemented —
 * it requires migration 013_translation_feedback.sql + a route in main.py.
 *
 * TODO (Phase X): create the table and endpoint, then remove the early return.
 */
export async function sendTranslationFeedback(_payload) {
  // Backend endpoint not yet implemented — do not show fake success to users.
  return false
}
