import { logResult as apiLogResult } from '../lib/api'

/**
 * logResult — log an instrument result to the backend.
 * Attaches auth token automatically if the user is signed in.
 * The userId parameter is accepted for backward compatibility but is no longer
 * needed — the backend reads the user ID from the JWT.
 */
export async function logResult(domainScores, language, instrument, userId = null, facetScores = null) {
  try {
    await apiLogResult({
      instrument,
      language,
      ...domainScores,
      facets: facetScores ?? undefined,
    })
  } catch (_) {
    // Silently ignore — result logging must never block the user
  }
}
