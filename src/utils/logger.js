/**
 * Anonymous result logger.
 * Sends only: timestamp, language, 5 domain scores.
 * No PII is collected or transmitted.
 *
 * Replace APPS_SCRIPT_URL with your deployed Google Apps Script web app URL
 * before going live with result logging.
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbypju_p73n_vRVoTroDDaYj2YewAah4RyPocuc2TIxYnFZB7piP1jGttXfeY1b21osq/exec'

/**
 * Fire-and-forget log of domain scores.
 * Silently ignores all network or configuration errors.
 *
 * @param {Record<string, number>} domainScores
 * @param {string} language — current i18n language code (e.g. 'en', 'ca')
 */
export async function logResult(domainScores, language) {
  if (APPS_SCRIPT_URL === 'PLACEHOLDER_REPLACE_BEFORE_DEPLOY') return

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        language,
        scores: domainScores,
      }),
    })
  } catch (_) {
    // Silently ignore all errors
  }
}
