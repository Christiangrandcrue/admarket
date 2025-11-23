-- ============================================
-- CREATE ALL MISSING BASE TABLES
-- ============================================
-- Скопируй и выполни этот SQL в Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  geo TEXT[] NOT NULL,
  audience JSONB NOT NULL,
  budget JSONB NOT NULL,
  model TEXT NOT NULL,
  utm JSONB NOT NULL,
  promo_codes TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'disputed')),
  integrations JSONB NOT NULL DEFAULT '{"ga4": false, "appsflyer": false, "shopify": false}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Formats table
CREATE TABLE IF NOT EXISTS public.formats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_sec INTEGER,
  rights TEXT NOT NULL DEFAULT 'standard',
  price JSONB NOT NULL,
  sla_days INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Placements table
CREATE TABLE IF NOT EXISTS public.placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  format_id UUID NOT NULL REFERENCES public.formats(id) ON DELETE CASCADE,
  unit_price JSONB NOT NULL,
  deadline_at TIMESTAMPTZ NOT NULL,
  post_link TEXT,
  assets JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'proposal' CHECK (status IN ('proposal', 'booked', 'in_progress', 'posted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Escrows table
CREATE TABLE IF NOT EXISTS public.escrows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL UNIQUE,
  amount JSONB NOT NULL,
  commission_pct NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  status TEXT NOT NULL DEFAULT 'funded' CHECK (status IN ('funded', 'released', 'refunded')),
  docs JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placement_id UUID NOT NULL REFERENCES public.placements(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('impression', 'click', 'view', 'sale')),
  value NUMERIC NOT NULL DEFAULT 1,
  attributes JSONB DEFAULT '{}'
);

-- Cases table
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client TEXT NOT NULL,
  objective TEXT NOT NULL,
  placements UUID[] NOT NULL,
  results JSONB NOT NULL,
  assets JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_channels_owner ON public.channels(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_formats_channel ON public.formats(channel_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser ON public.campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_placements_campaign ON public.placements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_placements_channel ON public.placements(channel_id);
CREATE INDEX IF NOT EXISTS idx_analytics_placement ON public.analytics_events(placement_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ts ON public.analytics_events(ts);

-- Enable RLS on all tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
CREATE POLICY "Users can view own campaigns" ON public.campaigns FOR SELECT USING (
  advertiser_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Advertisers can create campaigns" ON public.campaigns;
CREATE POLICY "Advertisers can create campaigns" ON public.campaigns FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'advertiser')
);

DROP POLICY IF EXISTS "Advertisers can update own campaigns" ON public.campaigns;
CREATE POLICY "Advertisers can update own campaigns" ON public.campaigns FOR UPDATE USING (
  advertiser_id = auth.uid()
);

-- Formats policies
DROP POLICY IF EXISTS "Anyone can view formats" ON public.formats;
CREATE POLICY "Anyone can view formats" ON public.formats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Channel owners can manage formats" ON public.formats;
CREATE POLICY "Channel owners can manage formats" ON public.formats FOR ALL USING (
  EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND owner_user_id = auth.uid())
);

-- Placements policies
DROP POLICY IF EXISTS "Campaign owners and channel owners can view placements" ON public.placements;
CREATE POLICY "Campaign owners and channel owners can view placements" ON public.placements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND advertiser_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND owner_user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Analytics policies
DROP POLICY IF EXISTS "Campaign owners can view analytics" ON public.analytics_events;
CREATE POLICY "Campaign owners can view analytics" ON public.analytics_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.placements p
    JOIN public.campaigns c ON p.campaign_id = c.id
    WHERE p.id = placement_id AND c.advertiser_id = auth.uid()
  )
);

-- Cases policies
DROP POLICY IF EXISTS "Anyone can view cases" ON public.cases;
CREATE POLICY "Anyone can view cases" ON public.cases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage cases" ON public.cases;
CREATE POLICY "Admins can manage cases" ON public.cases FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_placements_updated_at ON public.placements;
CREATE TRIGGER update_placements_updated_at BEFORE UPDATE ON public.placements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrows_updated_at ON public.escrows;
CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON public.escrows 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification query
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
