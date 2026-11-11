DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all automation progress" ON public.automation_progress;
DROP POLICY IF EXISTS "Admins can view all automation activity" ON public.automation_activity;
DROP POLICY IF EXISTS "Admins can view all practice drafts" ON public.practice_drafts;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP TABLE IF EXISTS public.user_roles;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP TYPE IF EXISTS public.app_role;