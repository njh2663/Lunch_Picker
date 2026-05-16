/*
  # Create visit_log table

  1. New Tables
    - `visit_log`
      - `id` (bigint, primary key, auto-increment)
      - `visited_at` (timestamptz, default now in KST)
      - `session_id` (text, to deduplicate same session)

  2. Security
    - Enable RLS on `visit_log` table
    - Allow anonymous insert (for recording visits)
    - No select policy for public (admin reads via service role)
*/

CREATE TABLE IF NOT EXISTS visit_log (
  id bigserial PRIMARY KEY,
  session_id text NOT NULL,
  visited_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Seoul')
);

ALTER TABLE visit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visit log"
  ON visit_log
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
