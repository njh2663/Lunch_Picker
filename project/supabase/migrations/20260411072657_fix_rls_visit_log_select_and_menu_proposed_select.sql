/*
  # Fix RLS SELECT policies

  1. Problems
    - visit_log table has no SELECT policy → VisitChart cannot read data with anon key → graph shows empty
    - menu table SELECT policy only allows is_visible = true → admin cannot read proposed menus (is_visible = false)

  2. Changes
    - Add SELECT policy on visit_log for authenticated users (admin)
    - Add SELECT policy on menu for authenticated users to read proposed (is_visible = false) menus
*/

-- Allow authenticated users (admin) to read visit_log for the chart
CREATE POLICY "Authenticated users can read visit log"
  ON visit_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admin) to read all menus including proposed ones
CREATE POLICY "Authenticated users can view all menus"
  ON menu
  FOR SELECT
  TO authenticated
  USING (true);
