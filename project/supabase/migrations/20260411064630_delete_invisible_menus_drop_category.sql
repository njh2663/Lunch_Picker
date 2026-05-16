/*
  # Delete invisible menus and drop category column

  1. Changes
    - Delete all rows where is_visible = false
    - Drop the category column from the menu table
    - Drop the category_sub column as well (no longer needed)

  2. Notes
    - This is a cleanup migration to simplify the menu table
    - All hidden menus are permanently removed
    - Category filtering in the UI will also be removed
*/

DELETE FROM menu WHERE is_visible = false;

ALTER TABLE menu DROP COLUMN IF EXISTS category;
ALTER TABLE menu DROP COLUMN IF EXISTS category_sub;
