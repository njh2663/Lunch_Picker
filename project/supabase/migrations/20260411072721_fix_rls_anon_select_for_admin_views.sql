/*
  # Fix RLS SELECT policies for admin views (anon key based auth)

  ## Context
  The admin page uses sessionStorage-based authentication (not Supabase Auth),
  so all queries run as anon role. The authenticated policies added previously
  won't work for this setup.

  ## Changes
  1. Drop the authenticated-only policies added previously
  2. Add anon SELECT policy on visit_log so VisitChart can read data
  3. Add anon SELECT policy on menu for is_proposed = true rows so SuggestedMenus can read them
*/

-- Drop the authenticated-only policies (don't help with anon key setup)
DROP POLICY IF EXISTS "Authenticated users can read visit log" ON visit_log;
DROP POLICY IF EXISTS "Authenticated users can view all menus" ON menu;

-- Allow anon to read visit_log (for admin visit chart)
CREATE POLICY "Anon can read visit log"
  ON visit_log
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon to read proposed menus (is_proposed = true) for admin review panel
CREATE POLICY "Anon can read proposed menus"
  ON menu
  FOR SELECT
  TO anon
  USING (is_proposed = true OR is_visible = true);
