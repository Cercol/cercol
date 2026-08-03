import { logResult as apiLogResult } from '../lib/api'

/**
 * logResult — log an instrument result to the backend.
 * Attaches auth token automatically if the user is signed in.
 * The userId parameter is accepted for backward compatibility but is no longer
 * needed — the backend reads the user ID from the JWT.
 *
 * Returns the stored row id, or null when logging failed. The id is what lets
 * the results page offer an accuracy rating; a null just hides that widget.
 */
export async function logResult(domainScores, language, instrument, userId = null, facetScores = null) {
  try {
    const res = await apiLogResult({
      instrument,
      language,
      ...domainScores,
      facets: facetScores ?? undefined,
    })
    return res?.id ?? null
  } catch (_) {
    // Silently ignore — result logging must never block the user
    return null
  }
}
