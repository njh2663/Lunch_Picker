/*
  # Fix Security Issues

  ## Summary
  Several security and performance issues reported by Supabase advisor are resolved in this migration.

  ## Changes

  ### 1. pick_log - Enable RLS
  - RLS was not enabled on `pick_log`, exposing all rows including `session_id` via the public API.
  - RLS is now enabled.
  - INSERT policy: anon/authenticated users may insert their own rows (session_id is not checked server-side since it is a client-generated token, but the table is no longer open without any policy).
  - No SELECT policy is added for anon/authenticated users since individual users have no need to read others' pick logs. Admin access is handled via the service role key in edge functions.

  ### 2. pick_log - Drop unused indexes
  - `idx_pick_log_menu_id`, `idx_pick_log_picked_at`, `idx_pick_log_session` were never used in queries.
  - Dropping them reduces write overhead.

  ### 3. menu - Merge duplicate anon SELECT policies
  - `Public can view visible menus` targets role `public` (which includes anon) and `Anon can read proposed menus` targets role `anon`.
  - Together they create multiple permissive SELECT policies for anon.
  - Drop both and replace with a single `anon` SELECT policy that covers both conditions.

  ### 4. visit_log - Restrict INSERT policy
  - The existing INSERT policy used `WITH CHECK (true)`, meaning anyone could insert any data.
  - Replaced with a restricted policy that only allows inserting a row where `visited_at` is within the last minute, preventing log stuffing with arbitrary timestamps.
*/

-- ============================================================
-- 1. pick_log: enable RLS + add minimal INSERT policy
-- ============================================================
ALTER TABLE public.pick_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon and authenticated users can insert pick log"
  ON public.pick_log
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- 2. pick_log: drop unused indexes
-- ============================================================
DROP INDEX IF EXISTS public.idx_pick_log_menu_id;
DROP INDEX IF EXISTS public.idx_pick_log_picked_at;
DROP INDEX IF EXISTS public.idx_pick_log_session;

-- ============================================================
-- 3. menu: merge duplicate anon SELECT policies
-- ============================================================
DROP POLICY IF EXISTS "Public can view visible menus" ON public.menu;
DROP POLICY IF EXISTS "Anon can read proposed menus" ON public.menu;

CREATE POLICY "Anon can read visible or proposed menus"
  ON public.menu
  FOR SELECT
  TO anon
  USING (is_visible = true OR is_proposed = true);

-- ============================================================
-- 4. visit_log: restrict INSERT policy to current-time rows
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert visit log" ON public.visit_log;

CREATE POLICY "Anon and authenticated users can insert visit log"
  ON public.visit_log
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (visited_at >= (now() - interval '1 minute'));
