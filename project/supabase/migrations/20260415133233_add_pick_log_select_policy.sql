/*
  # Add SELECT policy for pick_log

  ## Problem
  - pick_log table only has an INSERT policy for anon/authenticated users
  - No SELECT policy exists, so frontend cannot read pick_log data for stats

  ## Changes
  - Add SELECT policy allowing anon and authenticated users to read pick_log
    so the menu stats chart can aggregate pick counts
*/

CREATE POLICY "Anon and authenticated users can select pick log"
  ON pick_log
  FOR SELECT
  TO anon, authenticated
  USING (true);
