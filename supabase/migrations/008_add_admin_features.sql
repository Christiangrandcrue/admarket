-- Migration 008: Admin Panel Features
-- Created: 2025-11-23
-- Description: Add admin moderation, flags, audit logs

-- Add moderation fields to channels
ALTER TABLE public.channels
ADD COLUMN moderation_status TEXT DEFAULT 'pending' CHECK (
  moderation_status IN ('pending', 'approved', 'rejected', 'flagged')
),
ADD COLUMN moderation_notes TEXT,
ADD COLUMN moderated_by UUID REFERENCES public.users(id),
ADD COLUMN moderated_at TIMESTAMPTZ,
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN featured_at TIMESTAMPTZ;

-- Add moderation fields to campaigns
ALTER TABLE public.campaigns
ADD COLUMN moderation_status TEXT DEFAULT 'pending' CHECK (
  moderation_status IN ('pending', 'approved', 'rejected', 'flagged')
),
ADD COLUMN moderation_notes TEXT,
ADD COLUMN moderated_by UUID REFERENCES public.users(id),
ADD COLUMN moderated_at TIMESTAMPTZ,
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;

-- Add user management fields
ALTER TABLE public.users
ADD COLUMN status TEXT DEFAULT 'active' CHECK (
  status IN ('active', 'suspended', 'banned', 'deleted')
),
ADD COLUMN suspended_until TIMESTAMPTZ,
ADD COLUMN suspension_reason TEXT,
ADD COLUMN banned_at TIMESTAMPTZ,
ADD COLUMN ban_reason TEXT,
ADD COLUMN banned_by UUID REFERENCES public.users(id),
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN last_login_at TIMESTAMPTZ;

-- Create flags/reports table
CREATE TABLE public.flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('channel', 'campaign', 'placement', 'user', 'content')),
  entity_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN (
    'inappropriate_content',
    'spam',
    'fraud',
    'copyright',
    'harassment',
    'misinformation',
    'other'
  )),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create audit log table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create platform settings table
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('platform_fee_percentage', '10', 'Platform commission percentage'),
  ('min_campaign_budget', '5000', 'Minimum campaign budget in RUB'),
  ('max_campaign_budget', '10000000', 'Maximum campaign budget in RUB'),
  ('auto_approve_channels', 'false', 'Auto-approve new channels'),
  ('auto_approve_campaigns', 'false', 'Auto-approve new campaigns'),
  ('require_email_verification', 'true', 'Require email verification for new users'),
  ('min_payout_amount', '1000', 'Minimum payout amount for creators'),
  ('payout_delay_days', '3', 'Days to wait before processing payout');

-- Create indexes
CREATE INDEX idx_channels_moderation_status ON public.channels(moderation_status);
CREATE INDEX idx_campaigns_moderation_status ON public.campaigns(moderation_status);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_flags_entity ON public.flags(entity_type, entity_id);
CREATE INDEX idx_flags_status ON public.flags(status);
CREATE INDEX idx_audit_logs_admin ON public.audit_logs(admin_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flags
CREATE POLICY "Users can create flags" ON public.flags FOR INSERT WITH CHECK (
  auth.uid() = reporter_id
);

CREATE POLICY "Users can view own flags" ON public.flags FOR SELECT USING (
  reporter_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update flags" ON public.flags FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for audit logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for platform settings
CREATE POLICY "Anyone can view settings" ON public.platform_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can update settings" ON public.platform_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Updated_at triggers
CREATE TRIGGER update_flags_updated_at BEFORE UPDATE ON public.flags 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON public.platform_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    notes
  ) VALUES (
    p_admin_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_notes
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Comments
COMMENT ON TABLE public.flags IS 'User reports and flags for content moderation';
COMMENT ON TABLE public.audit_logs IS 'Audit trail of all admin actions';
COMMENT ON TABLE public.platform_settings IS 'Platform configuration settings';
COMMENT ON COLUMN public.channels.moderation_status IS 'Admin moderation status for channel verification';
COMMENT ON COLUMN public.campaigns.moderation_status IS 'Admin moderation status for campaign approval';
COMMENT ON COLUMN public.users.status IS 'User account status (active/suspended/banned)';
