/*
  # Add is_proposed column to menu table

  1. Changes
    - Add `is_proposed` boolean column to `menu` table
      - Default: false (existing menus are not proposals)
      - Used to distinguish user-suggested menus from regular menus

  2. Notes
    - Existing menus keep is_proposed = false
    - When a user submits a suggestion, is_proposed = true AND is_visible = false
    - Admin approves by setting is_visible = true (is_proposed stays true for history)
    - SuggestedMenus admin view will filter by is_proposed = true AND is_visible = false
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu' AND column_name = 'is_proposed'
  ) THEN
    ALTER TABLE menu ADD COLUMN is_proposed boolean NOT NULL DEFAULT false;
  END IF;
END $$;
