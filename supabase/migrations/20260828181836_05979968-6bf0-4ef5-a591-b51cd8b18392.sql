CREATE TABLE public.automation_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  quiz_passed BOOLEAN NOT NULL DEFAULT false,
  quiz_score INTEGER NOT NULL DEFAULT 0,
  code_submitted TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_progress TO authenticated;
GRANT ALL ON public.automation_progress TO service_role;
ALTER TABLE public.automation_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own automation progress" ON public.automation_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.automation_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  lesson_id TEXT,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.automation_activity TO authenticated;
GRANT ALL ON public.automation_activity TO service_role;
ALTER TABLE public.automation_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own automation activity" ON public.automation_activity FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_automation_progress_updated_at BEFORE UPDATE ON public.automation_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();