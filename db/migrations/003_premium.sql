-- Migration 003: add premium flag to profiles
--
-- premium = true after a successful Stripe Checkout payment.
-- Updated by the backend webhook using the service_role key (bypasses RLS).
-- Run in Supabase SQL editor after migration 001.

alter table public.profiles
  add column if not exists premium boolean not null default false;
