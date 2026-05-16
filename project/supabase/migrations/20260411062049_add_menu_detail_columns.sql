/*
  # Add detail columns to menu table

  ## Summary
  메뉴 테이블에 상세 속성 컬럼들을 추가합니다.

  ## New Columns
  - `category_main` (text): 대분류 카테고리 (예: 한식, 중식, 일식, 양식, 아시안)
  - `category_sub` (text): 소분류 카테고리 (예: 국물, 밥, 면, 간식)
  - `heavy_level` (integer): 든든함 정도 (0=가벼움, 1=보통, 2=든든함)
  - `meal_type` (text): 식사 유형 (식사, 간식)
  - `is_soup` (boolean): 국물 여부
  - `is_hot` (boolean): 따뜻한 음식 여부

  ## Notes
  - 기존 컬럼(category, emoji, description 등)은 유지합니다
  - 새 컬럼은 NULL 허용으로 추가하여 기존 데이터 안전 보장
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu' AND column_name = 'category_main'
  ) THEN
    ALTER TABLE menu ADD COLUMN category_main text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu' AND column_name = 'category_sub'
  ) THEN
    ALTER TABLE menu ADD COLUMN category_sub text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu' AND column_name = 'heavy_level'
  ) THEN
    ALTER TABLE menu ADD COLUMN heavy_level integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu' AND column_name = 'meal_type'
  ) THEN
    ALTER TABLE menu ADD COLUMN meal_type text DEFAULT '식사';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu' AND column_name = 'is_soup'
  ) THEN
    ALTER TABLE menu ADD COLUMN is_soup boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu' AND column_name = 'is_hot'
  ) THEN
    ALTER TABLE menu ADD COLUMN is_hot boolean DEFAULT true;
  END IF;
END $$;
