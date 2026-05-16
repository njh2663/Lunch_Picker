/*
  # Update menu INSERT RLS policy to require is_proposed = true for suggestions

  1. Changes
    - Drop existing "Public can suggest menus" policy
    - Re-create policy requiring both is_visible = false AND is_proposed = true
      so that only proper proposals can be inserted by anonymous users
*/

DROP POLICY IF EXISTS "Public can suggest menus" ON menu;

CREATE POLICY "Public can suggest menus"
  ON menu
  FOR INSERT
  TO anon
  WITH CHECK (is_visible = false AND is_proposed = true);
