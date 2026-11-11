-- 1) Catálogo de planos
CREATE TABLE public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'brl',
  recurring_interval text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.plans TO anon;
GRANT SELECT ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (active);

CREATE POLICY "Master admin manages plans"
  ON public.plans FOR ALL
  TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.plans (id, name, description, amount_cents, currency, recurring_interval, sort_order)
VALUES
  ('acesso_fundador_onetime', 'Acesso Completo — pagamento único', 'Preparatório CTFL 4.0 + Curso de Automação de Testes, acesso por 12 meses.', 9700, 'brl', NULL, 1),
  ('acesso_fundador_mensal', 'Acesso Completo — mensal', 'Preparatório CTFL 4.0 + Curso de Automação de Testes, cobrança mensal no cartão.', 2990, 'brl', 'month', 2);

-- 2) Pagamentos: identificadores do Mercado Pago
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS mp_payment_id text,
  ADD COLUMN IF NOT EXISTS mp_preapproval_id text,
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'mercadopago',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

UPDATE public.payments SET provider = 'stripe' WHERE stripe_session_id IS NOT NULL;

ALTER TABLE public.payments ALTER COLUMN stripe_session_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_mp_payment_id_key
  ON public.payments (mp_payment_id) WHERE mp_payment_id IS NOT NULL;

-- 3) Assinaturas: identificador do Mercado Pago
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS mp_preapproval_id text,
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'mercadopago';

UPDATE public.subscriptions SET provider = 'stripe';

ALTER TABLE public.subscriptions ALTER COLUMN stripe_subscription_id DROP NOT NULL;
ALTER TABLE public.subscriptions ALTER COLUMN stripe_customer_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_mp_preapproval_id_key
  ON public.subscriptions (mp_preapproval_id) WHERE mp_preapproval_id IS NOT NULL;