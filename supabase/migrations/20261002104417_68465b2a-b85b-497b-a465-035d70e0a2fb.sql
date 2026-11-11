DELETE FROM public.automation_progress WHERE user_id IS NOT NULL;
DELETE FROM public.automation_activity WHERE user_id IS NOT NULL;
DELETE FROM public.quiz_results WHERE user_id IS NOT NULL;
DELETE FROM public.automation_bank_attempts WHERE user_id IS NOT NULL;
DELETE FROM public.practice_drafts WHERE user_id IS NOT NULL;