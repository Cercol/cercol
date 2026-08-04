/**
 * sendTranslationFeedback — submit a suggested correction to a translation.
 *
 * Anonymous: the endpoint takes no auth. Requiring an account to report a
 * typo is how you get no reports.
 *
 * Returns true when the suggestion was stored, false otherwise. The caller
 * shows success only on true, so a failure never claims something was saved
 * that was not.
 *
 * @param {{language: string, suggestion: string, instrument?: string,
 *          context?: string, itemId?: number|null, itemText?: string|null}} payload
 * @returns {Promise<boolean>}
 */
import { sendTranslationSuggestion } from '../lib/api'

export async function sendTranslationFeedback(payload) {
  try {
    await sendTranslationSuggestion(payload)
    return true
  } catch {
    return false
  }
}
