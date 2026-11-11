ALTER TABLE public.automation_progress
  ADD COLUMN IF NOT EXISTS code_draft text,
  ADD COLUMN IF NOT EXISTS code_draft_updated_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS quiz_draft jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE TABLE IF NOT EXISTS public.practice_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users,
  title text NOT NULL DEFAULT 'Rascunho',
  language text NOT NULL DEFAULT 'javascript',
  code text NOT NULL DEFAULT '',
  lesson_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_drafts TO authenticated;
GRANT ALL ON public.practice_drafts TO service_role;

ALTER TABLE public.practice_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own practice drafts" ON public.practice_drafts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_practice_drafts_updated_at
  BEFORE UPDATE ON public.practice_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS practice_drafts_user_updated_idx ON public.practice_drafts (user_id, updated_at DESC);