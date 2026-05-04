-- Phase 13.13 migration: add facets column to results table.
-- Run once in the Supabase SQL editor. Safe to re-run (IF NOT EXISTS).
ALTER TABLE results ADD COLUMN IF NOT EXISTS facets JSONB;
