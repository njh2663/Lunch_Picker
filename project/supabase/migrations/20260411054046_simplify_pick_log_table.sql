/*
  # Simplify pick_log table

  ## Changes
  - Remove `menu_name` column (derivable from menu table via menu_id)
  - Remove `category` column (derivable from menu table via menu_id)
  - Remove `dow` column (unused)

  ## Result
  pick_log will only store: pick_id, menu_id, session_id, picked_at
  Menu metadata is joined from the menu table using menu_id.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pick_log' AND column_name = 'menu_name'
  ) THEN
    ALTER TABLE pick_log DROP COLUMN menu_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pick_log' AND column_name = 'category'
  ) THEN
    ALTER TABLE pick_log DROP COLUMN category;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pick_log' AND column_name = 'dow'
  ) THEN
    ALTER TABLE pick_log DROP COLUMN dow;
  END IF;
END $$;
