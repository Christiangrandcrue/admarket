-- ============================================
-- MIGRATION 007: STRIPE CONNECT FIELDS
-- ============================================
-- Скопируй ВЕСЬ этот файл и вставь в Supabase SQL Editor

-- Add Stripe fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE;

-- Add Stripe fields to campaigns table
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_paid',
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add Stripe fields to placements table
ALTER TABLE public.placements
ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT,
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payout_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS paid_out_at TIMESTAMPTZ;

-- Update escrows table with Stripe data
ALTER TABLE public.escrows
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_transfer_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS release_trigger TEXT,
ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- Create index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_account ON public.users(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_stripe_payment_intent ON public.campaigns(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_placements_stripe_transfer ON public.placements(stripe_transfer_id) WHERE stripe_transfer_id IS NOT NULL;

-- Create transactions table for payment history
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  placement_id UUID REFERENCES public.placements(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('charge', 'transfer', 'refund', 'payout')),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RUB',
  stripe_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_campaign ON public.transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_transactions_placement ON public.transactions(placement_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_id ON public.transactions(stripe_id) WHERE stripe_id IS NOT NULL;

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Add comments
COMMENT ON TABLE public.transactions IS 'Payment history for all financial operations';
COMMENT ON COLUMN public.users.stripe_account_id IS 'Stripe Connected Account ID for creators';
COMMENT ON COLUMN public.campaigns.stripe_payment_intent_id IS 'Stripe Payment Intent ID for campaign payment';
COMMENT ON COLUMN public.placements.stripe_transfer_id IS 'Stripe Transfer ID for creator payout';
