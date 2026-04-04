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
 * @param {string} language   — current i18n language code (e.g. 'en', 'ca')
 * @param {'radar'|'test'} instrument — which instrument was completed
 */
export async function logResult(domainScores, language, instrument) {
  if (APPS_SCRIPT_URL === 'PLACEHOLDER_REPLACE_BEFORE_DEPLOY') return

  try {
    const params = new URLSearchParams({
      timestamp: new Date().toISOString(),
      language,
      instrument,
      extraversion:         String(domainScores.extraversion),
      agreeableness:        String(domainScores.agreeableness),
      conscientiousness:    String(domainScores.conscientiousness),
      negativeEmotionality: String(domainScores.negativeEmotionality),
      openMindedness:       String(domainScores.openMindedness),
    })

    await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
      method: 'GET',
      mode: 'no-cors',
    })
  } catch (_) {
    // Silently ignore all errors
  }
}
