ALTER TABLE public.automation_progress
  ADD COLUMN IF NOT EXISTS video_watched_at timestamptz,
  ADD COLUMN IF NOT EXISTS video_position_seconds integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pdf_opened_at timestamptz;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_track text;

CREATE TABLE public.lesson_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('video', 'pdf')),
  script jsonb NOT NULL DEFAULT '{}'::jsonb,
  storage_path text,
  status text NOT NULL DEFAULT 'pending',
  generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, kind)
);

GRANT SELECT ON public.lesson_media TO authenticated;
GRANT ALL ON public.lesson_media TO service_role;

ALTER TABLE public.lesson_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read lesson media"
  ON public.lesson_media FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_lesson_media_updated_at
  BEFORE UPDATE ON public.lesson_media
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();