/*
  # Delete invisible menus and update 돈까스 (경양식) description

  1. Changes
    - Delete all menus where is_visible = false (리조또, 반미, 스테이크, 테스트)
    - Update 돈까스 (경양식) description with a proper Korean description

  2. Notes
    - pick_log entries referencing deleted menus will need to be handled via cascade or manual delete
    - Deleting from pick_log first to avoid FK constraint errors
*/

DELETE FROM pick_log WHERE menu_id IN (
  SELECT id FROM menu WHERE is_visible = false
);

DELETE FROM menu WHERE is_visible = false;

UPDATE menu
SET description = '두툼한 고기에 빵가루를 입혀 튀긴 경양식 돈까스, 소스와 함께'
WHERE name = '돈까스 (경양식)';
