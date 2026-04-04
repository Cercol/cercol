/**
 * Translation feedback utility.
 * Sends user-submitted translation suggestions to a Google Apps Script endpoint.
 * Fire-and-forget — never blocks the UI.
 */

const TRANSLATION_FEEDBACK_URL = 'https://script.google.com/macros/s/AKfycbzNx8RizQywuQFBEyMsWwnWynOwCpEp1l0moa4PhFRHhkzS9vSp9Q000EZAypTAyXr0/exec'

/**
 * @param {{ language: string, instrument: string, context: string, suggestion: string, itemId?: number|null, itemText?: string|null }} params
 */
export async function sendTranslationFeedback({ language, instrument, context, suggestion, itemId, itemText }) {
  try {
    const params = new URLSearchParams({
      timestamp: new Date().toISOString(),
      language,
      instrument,
      context,
      suggestion,
      itemId:   String(itemId ?? ''),
      itemText: itemText ?? '',
    })
    await fetch(`${TRANSLATION_FEEDBACK_URL}?${params.toString()}`, {
      method: 'GET',
      mode: 'no-cors',
    })
  } catch (_) {
    // Silently ignore all errors
  }
}
