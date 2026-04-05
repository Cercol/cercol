import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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