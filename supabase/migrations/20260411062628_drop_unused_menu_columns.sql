/*
  # Drop unused columns from menu table

  ## Summary
  menu 테이블에서 사용하지 않는 컬럼들을 제거합니다.

  ## Removed Columns
  - `category_main`: 대분류 카테고리 (category 컬럼으로 통합)
  - `heavy_level`: 든든함 정도
  - `meal_type`: 식사 유형
  - `is_soup`: 국물 여부
  - `is_hot`: 온도 여부

  ## Notes
  - `category_sub`는 유지합니다
  - 기존 데이터는 이미 category 컬럼에 동일한 값이 있습니다
*/

ALTER TABLE menu
  DROP COLUMN IF EXISTS category_main,
  DROP COLUMN IF EXISTS heavy_level,
  DROP COLUMN IF EXISTS meal_type,
  DROP COLUMN IF EXISTS is_soup,
  DROP COLUMN IF EXISTS is_hot;
