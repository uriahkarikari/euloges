-- Lifebree billing foundation.
-- Prices retain the agreed USD reference values and the approved fixed GHS monthly prices.
-- amount_minor is stored in pesewas. Paystack plan codes remain NULL until configured.
-- This migration creates billing records only; it does not enable checkout.

CREATE TABLE IF NOT EXISTS public.billing_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  billing_interval text NOT NULL DEFAULT 'monthly'
    CHECK (billing_interval IN ('monthly', 'yearly')),
  price_usd numeric(10,2) NOT NULL CHECK (price_usd >= 0),
  currency text NOT NULL DEFAULT 'GHS' CHECK (currency = 'GHS'),
  amount_minor bigint,
  storage_gb integer NOT NULL CHECK (storage_gb > 0),
  storage_scope text NOT NULL CHECK (storage_scope IN ('personal', 'family_shared')),
  paystack_plan_code text UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (amount_minor IS NULL OR amount_minor > 0)
);

COMMENT ON TABLE public.billing_plans IS
  'Configurable Lifebree subscription catalogue. amount_minor is GHS pesewas and remains unset until launch pricing is configured.';

INSERT INTO public.billing_plans
  (id, name, price_usd, amount_minor, storage_gb, storage_scope)
VALUES
  ('personal', 'Personal', 3.99, 4999, 10, 'personal'),
  ('personal-plus', 'Personal Plus', 7.99, 9999, 50, 'personal'),
  ('family', 'Family', 9.99, 12499, 100, 'family_shared'),
  ('family-legacy', 'Family Legacy', 19.99, 24999, 250, 'family_shared')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_usd = EXCLUDED.price_usd,
  amount_minor = EXCLUDED.amount_minor,
  storage_gb = EXCLUDED.storage_gb,
  storage_scope = EXCLUDED.storage_scope,
  updated_at = now();

ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY billing_plans_active_read
ON public.billing_plans
FOR SELECT
TO anon, authenticated
USING (active = true);

-- Subscription rows belong to the account that pays for the plan.
-- Family archive membership and content permissions remain separate concerns.
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_id text NOT NULL REFERENCES public.billing_plans(id) ON DELETE RESTRICT,
  billing_scope text NOT NULL CHECK (billing_scope IN ('personal', 'family')),
  provider text NOT NULL DEFAULT 'paystack' CHECK (provider = 'paystack'),
  payment_method text NOT NULL CHECK (payment_method IN ('card', 'mobile_money')),
  provider_customer_code text,
  provider_subscription_code text,
  status text NOT NULL DEFAULT 'incomplete'
    CHECK (status IN ('incomplete', 'active', 'past_due', 'cancelled', 'expired')),
  currency text NOT NULL DEFAULT 'GHS' CHECK (currency = 'GHS'),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (billing_scope = 'personal' AND plan_id IN ('personal', 'personal-plus'))
    OR
    (billing_scope = 'family' AND plan_id IN ('family', 'family-legacy'))
  ),
  CHECK (
    current_period_end IS NULL
    OR current_period_start IS NULL
    OR current_period_end > current_period_start
  )
);

CREATE INDEX IF NOT EXISTS billing_subscriptions_owner_status_idx
  ON public.billing_subscriptions (owner_id, status);

CREATE INDEX IF NOT EXISTS billing_subscriptions_provider_code_idx
  ON public.billing_subscriptions (provider_subscription_code)
  WHERE provider_subscription_code IS NOT NULL;

ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY billing_subscriptions_owner_read
ON public.billing_subscriptions
FOR SELECT
TO authenticated
USING (owner_id = (SELECT auth.uid()));

-- Payment attempts are created and updated only by trusted server code.
CREATE TABLE IF NOT EXISTS public.billing_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.billing_subscriptions(id) ON DELETE RESTRICT,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_id text NOT NULL REFERENCES public.billing_plans(id) ON DELETE RESTRICT,
  provider text NOT NULL DEFAULT 'paystack' CHECK (provider = 'paystack'),
  reference text NOT NULL UNIQUE,
  provider_transaction_id numeric(20,0) UNIQUE,
  payment_method text NOT NULL CHECK (payment_method IN ('card', 'mobile_money')),
  status text NOT NULL DEFAULT 'initialized'
    CHECK (status IN ('initialized', 'pending', 'success', 'failed', 'reversed')),
  currency text NOT NULL DEFAULT 'GHS' CHECK (currency = 'GHS'),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  paid_at timestamptz,
  provider_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS billing_payments_owner_created_idx
  ON public.billing_payments (owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS billing_payments_subscription_idx
  ON public.billing_payments (subscription_id, created_at DESC);

ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY billing_payments_owner_read
ON public.billing_payments
FOR SELECT
TO authenticated
USING (owner_id = (SELECT auth.uid()));

-- Webhook inbox: service-role/server access only. Keep payloads for audit and
-- deduplication; do not expose provider event data to ordinary client queries.
CREATE TABLE IF NOT EXISTS public.billing_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'paystack' CHECK (provider = 'paystack'),
  event_type text NOT NULL,
  payload_hash text NOT NULL UNIQUE,
  reference text,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  processing_error text,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.billing_webhook_events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.billing_plans FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.billing_subscriptions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.billing_payments FROM anon, authenticated;
