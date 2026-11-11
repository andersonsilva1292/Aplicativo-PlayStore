ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_email_error text;

CREATE INDEX IF NOT EXISTS idx_payments_confirmation_pending
  ON public.payments (status, confirmation_email_sent_at)
  WHERE status = 'paid' AND confirmation_email_sent_at IS NULL;