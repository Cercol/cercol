import { supabase } from '../lib/supabase'

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
