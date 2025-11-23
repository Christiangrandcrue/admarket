-- Migration 007: Add Stripe Connect fields
-- Created: 2025-11-23
-- Description: Adds Stripe Connect account IDs and payment tracking

-- Add Stripe fields to users table
ALTER TABLE public.users 
ADD COLUMN stripe_account_id TEXT,
ADD COLUMN stripe_account_status TEXT DEFAULT 'not_connected' CHECK (
  stripe_account_status IN ('not_connected', 'pending', 'connected', 'rejected')
),
ADD COLUMN stripe_onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN stripe_payouts_enabled BOOLEAN DEFAULT FALSE;

-- Add Stripe fields to campaigns table
ALTER TABLE public.campaigns
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'not_paid' CHECK (
  payment_status IN ('not_paid', 'processing', 'succeeded', 'failed', 'refunded')
),
ADD COLUMN payment_method TEXT, -- 'card', 'bank_transfer', etc.
ADD COLUMN paid_at TIMESTAMPTZ;

-- Add Stripe fields to placements table
ALTER TABLE public.placements
ADD COLUMN stripe_transfer_id TEXT,
ADD COLUMN payout_status TEXT DEFAULT 'pending' CHECK (
  payout_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')
),
ADD COLUMN payout_amount NUMERIC(10, 2),
ADD COLUMN paid_out_at TIMESTAMPTZ;

-- Update escrows table with Stripe data
ALTER TABLE public.escrows
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN stripe_transfer_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN release_trigger TEXT CHECK (
  release_trigger IN ('manual', 'content_approved', 'deadline_reached')
),
ADD COLUMN released_at TIMESTAMPTZ;

-- Create index for Stripe lookups
CREATE INDEX idx_users_stripe_account ON public.users(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX idx_campaigns_stripe_payment_intent ON public.campaigns(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_placements_stripe_transfer ON public.placements(stripe_transfer_id) WHERE stripe_transfer_id IS NOT NULL;

-- Create transactions table for payment history
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  placement_id UUID REFERENCES public.placements(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('charge', 'transfer', 'refund', 'payout')),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RUB',
  stripe_id TEXT, -- payment_intent_id or transfer_id
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_campaign ON public.transactions(campaign_id);
CREATE INDEX idx_transactions_placement ON public.transactions(placement_id);
CREATE INDEX idx_transactions_stripe_id ON public.transactions(stripe_id) WHERE stripe_id IS NOT NULL;

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Add comment
COMMENT ON TABLE public.transactions IS 'Payment history for all financial operations';
COMMENT ON COLUMN public.users.stripe_account_id IS 'Stripe Connected Account ID for creators';
COMMENT ON COLUMN public.campaigns.stripe_payment_intent_id IS 'Stripe Payment Intent ID for campaign payment';
COMMENT ON COLUMN public.placements.stripe_transfer_id IS 'Stripe Transfer ID for creator payout';
