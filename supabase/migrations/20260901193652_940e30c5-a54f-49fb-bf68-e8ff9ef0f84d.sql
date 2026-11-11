ALTER TABLE public.automation_progress
  ADD COLUMN IF NOT EXISTS exam_passed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exam_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exam_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exam_taken_at timestamptz;