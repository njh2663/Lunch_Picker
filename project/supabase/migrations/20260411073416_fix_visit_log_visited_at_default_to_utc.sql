/*
  # Fix visit_log.visited_at default value

  ## Problem
  The visited_at column was set to DEFAULT (now() AT TIME ZONE 'Asia/Seoul'),
  which converts now() to a timestamp without timezone (KST local time numbers),
  then stores it as if it were UTC. This causes every log entry to be recorded
  9 hours in the future relative to the actual UTC time.

  ## Fix
  Change the default to plain now(), which correctly stores the current UTC time
  as a timestamptz. Display and filtering code handles KST conversion separately.
*/

ALTER TABLE visit_log
  ALTER COLUMN visited_at SET DEFAULT now();
