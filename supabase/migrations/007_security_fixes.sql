-- Migration 007: security hardening
--
-- Fix 1 — Prevent premium self-escalation (profiles table)
--
--   The existing UPDATE policy "Users can update own profile" allows any
--   authenticated user to SET premium = true on their own row without going
--   through Stripe (e.g. supabase.from('profiles').update({ premium: true })).
--
--   Supabase RLS does not support column-level restrictions natively, so we
--   use a BEFORE UPDATE trigger. auth.role() returns 'authenticated' or 'anon'
--   for JWT-based callers and NULL for service_role (which bypasses RLS and is
--   used exclusively by the backend Stripe webhook). When auth.role() is NOT
--   NULL, we silently reset premium to its existing value — the update proceeds
--   but premium cannot change. Service_role calls are unaffected.
--
-- Fix 2 — Remove open INSERT policy on witness_responses
--
--   "public inserts responses" used WITH CHECK (true), allowing any anon key
--   holder to write arbitrary rows directly, bypassing the API's token validation.
--   All legitimate inserts come from the backend via service_role (which bypasses
--   RLS entirely and is unaffected by dropping this policy).

-- ── Fix 1: protect premium column ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.prevent_premium_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- auth.role() is non-NULL for all JWT-based requests (anon + authenticated).
  -- It is NULL for service_role, which is the only legitimate writer of premium.
  IF auth.role() IS NOT NULL THEN
    NEW.premium := OLD.premium;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lock_premium_column ON public.profiles;

CREATE TRIGGER lock_premium_column
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_premium_self_update();

-- ── Fix 2: close the open witness_responses insert path ───────────────────────

DROP POLICY IF EXISTS "public inserts responses" ON witness_responses;
