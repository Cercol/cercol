import { supabase } from '../lib/supabase'

export async function logResult(domainScores, language, instrument) {
  try {
    await supabase.from('results').insert({
      language,
      instrument,
      presence:   domainScores.presence,
      bond:       domainScores.bond,
      discipline: domainScores.discipline,
      depth:      domainScores.depth,
      vision:     domainScores.vision,
    })
  } catch (_) {
    // Silently ignore
  }
}