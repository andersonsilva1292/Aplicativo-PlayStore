ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_amount_cents integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.has_platform_access(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    public.has_role(_user_id, 'master_admin')
    OR EXISTS (
      SELECT 1 FROM public.course_access
      WHERE user_id = _user_id AND active AND (expires_at IS NULL OR expires_at > now())
    )
    OR EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = _user_id
        AND (
          (status IN ('active', 'trialing', 'past_due')
            AND (current_period_end IS NULL OR current_period_end > now()))
          OR (status = 'canceled' AND current_period_end > now())
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = _user_id AND trial_started_at > now() - interval '24 hours'
    )
$function$;