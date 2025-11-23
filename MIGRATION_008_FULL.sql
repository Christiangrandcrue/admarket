-- ============================================
-- MIGRATION 008: ADMIN PANEL FEATURES
-- ============================================
-- Скопируй ВЕСЬ этот файл и вставь в Supabase SQL Editor

-- Add moderation fields to channels
ALTER TABLE public.channels
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ;

-- Add moderation fields to campaigns
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Add user management fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create flags/reports table
CREATE TABLE IF NOT EXISTS public.flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
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
CREATE TABLE IF NOT EXISTS public.platform_settings (
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
  ('payout_delay_days', '3', 'Days to wait before processing payout')
ON CONFLICT (key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_channels_moderation_status ON public.channels(moderation_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_moderation_status ON public.campaigns(moderation_status);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_flags_entity ON public.flags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_flags_status ON public.flags(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flags
DROP POLICY IF EXISTS "Users can create flags" ON public.flags;
CREATE POLICY "Users can create flags" ON public.flags FOR INSERT WITH CHECK (
  auth.uid() = reporter_id
);

DROP POLICY IF EXISTS "Users can view own flags" ON public.flags;
CREATE POLICY "Users can view own flags" ON public.flags FOR SELECT USING (
  reporter_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update flags" ON public.flags;
CREATE POLICY "Admins can update flags" ON public.flags FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for audit logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for platform settings
DROP POLICY IF EXISTS "Anyone can view settings" ON public.platform_settings;
CREATE POLICY "Anyone can view settings" ON public.platform_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can update settings" ON public.platform_settings;
CREATE POLICY "Only admins can update settings" ON public.platform_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Updated_at trigger function (если ещё не существует)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_flags_updated_at ON public.flags;
CREATE TRIGGER update_flags_updated_at BEFORE UPDATE ON public.flags 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON public.platform_settings;
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
