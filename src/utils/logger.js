import { supabase } from '../lib/supabase'

export async function logResult(domainScores, language, instrument, userId = null) {
  try {
    const payload = {
      language,
      instrument,
      presence:   domainScores.presence,
      bond:       domainScores.bond,
      discipline: domainScores.discipline,
      depth:      domainScores.depth,
      vision:     domainScores.vision,
    }
    if (userId) payload.user_id = userId
    await supabase.from('results').insert(payload)
  } catch (_) {
    // Silently ignore
  }
}
