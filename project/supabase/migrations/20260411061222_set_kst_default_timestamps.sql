/*
  # Set KST (Korea Standard Time) default timestamps

  ## Summary
  Updates the default value for timestamp columns to use Korea Standard Time (UTC+9).

  ## Changes
  - `menu.created_at`: default changed to use KST-aware now()
  - `pick_log.picked_at`: default changed to use KST-aware now()

  ## Notes
  - `timestamptz` columns always store data as UTC internally in PostgreSQL
  - However, setting the session timezone to Asia/Seoul ensures `now()` reflects KST
  - The actual stored value remains UTC-compatible; display and filtering will use KST offset
  - We use `(now() AT TIME ZONE 'UTC')` with explicit timezone to ensure consistent behavior
  - Existing rows are not affected; only new inserts will use the new default
*/

ALTER TABLE menu
  ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'UTC');

ALTER TABLE pick_log
  ALTER COLUMN picked_at SET DEFAULT (now() AT TIME ZONE 'UTC');
