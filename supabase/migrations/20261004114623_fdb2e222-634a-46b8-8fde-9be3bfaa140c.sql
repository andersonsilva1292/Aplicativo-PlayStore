CREATE TABLE public.java_lab_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_id text NOT NULL,
  code text NOT NULL,
  logs text NOT NULL DEFAULT '',
  passed boolean NOT NULL DEFAULT false,
  passed_count integer NOT NULL DEFAULT 0,
  total_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.java_lab_submissions TO authenticated;
GRANT ALL ON public.java_lab_submissions TO service_role;
ALTER TABLE public.java_lab_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own lab submissions" ON public.java_lab_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own lab submissions" ON public.java_lab_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX java_lab_submissions_user_ex ON public.java_lab_submissions(user_id, exercise_id, created_at DESC);