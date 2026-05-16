/*
  # Allow public menu suggestion inserts

  ## Summary
  누구나 메뉴 제안을 할 수 있도록 menu 테이블에 INSERT 정책을 추가합니다.

  ## Changes
  - `menu` 테이블에 public INSERT 정책 추가
    - is_visible = false 인 경우에만 삽입 허용 (제안된 메뉴는 숨김 처리)
    - id는 uuid로 자동 생성되므로 별도 생성 없이 허용

  ## Security Notes
  - SELECT 정책은 is_visible = true인 메뉴만 조회 가능 (기존 유지)
  - INSERT 정책은 is_visible = false인 경우에만 허용하여 제안 메뉴가 바로 노출되지 않도록 보장
*/

CREATE POLICY "Public can suggest menus"
  ON menu
  FOR INSERT
  TO anon
  WITH CHECK (is_visible = false);
