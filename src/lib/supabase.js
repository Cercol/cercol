/**
 * Shared Supabase client — import this everywhere instead of calling createClient directly.
 * Uses the anon key: safe for browser use, restricted by RLS on all tables.
 */
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
