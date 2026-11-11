CREATE TABLE public.automation_bank_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  level text NOT NULL,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  score_percentage integer NOT NULL,
  passed boolean NOT NULL,
  time_spent_seconds integer NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.automation_bank_attempts TO authenticated;
GRANT ALL ON public.automation_bank_attempts TO service_role;
ALTER TABLE public.automation_bank_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bank attempts" ON public.automation_bank_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bank attempts" ON public.automation_bank_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.automation_bank_attempts (user_id, created_at DESC);