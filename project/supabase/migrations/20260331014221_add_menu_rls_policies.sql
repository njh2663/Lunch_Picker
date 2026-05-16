/*
  # Add RLS policies for menu table

  1. Security
    - Enable public read access to menu records where is_visible = true
    - This allows anyone to view visible menus
*/

CREATE POLICY "Public can view visible menus"
  ON menu
  FOR SELECT
  TO public
  USING (is_visible = true);
