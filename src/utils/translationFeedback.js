import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function sendTranslationFeedback({
  language,
  instrument,
  context,
  suggestion,
  itemId,
  itemText,
}) {
  try {
    await supabase.from('translation_feedback').insert({
      language,
      instrument,
      context,
      suggestion,
      item_id:   itemId  ?? '',
      item_text: itemText ?? '',
    })
  } catch (_) {
    // Silently ignore
  }
}