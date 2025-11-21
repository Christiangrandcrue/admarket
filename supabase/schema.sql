-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('advertiser', 'creator', 'admin')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  company TEXT,
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  billing JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Channels table
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platforms TEXT[] NOT NULL,
  handle TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topics TEXT[] NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{"followers": 0, "avg_views": 0, "er": 0}',
  audience JSONB NOT NULL DEFAULT '{}',
  brand_safety JSONB NOT NULL DEFAULT '{"verified": false}',
  rating JSONB NOT NULL DEFAULT '{"score": 0, "reviews_count": 0}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Formats table
CREATE TABLE public.formats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_sec INTEGER,
  rights TEXT NOT NULL DEFAULT 'standard',
  price JSONB NOT NULL,
  sla_days INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE public.campaigns (
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

-- Placements table
CREATE TABLE public.placements (
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
CREATE TABLE public.escrows (
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
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placement_id UUID NOT NULL REFERENCES public.placements(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('impression', 'click', 'view', 'sale')),
  value NUMERIC NOT NULL DEFAULT 1,
  attributes JSONB DEFAULT '{}'
);

-- Cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client TEXT NOT NULL,
  objective TEXT NOT NULL,
  placements UUID[] NOT NULL,
  results JSONB NOT NULL,
  assets JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_channels_owner ON public.channels(owner_user_id);
CREATE INDEX idx_channels_platforms ON public.channels USING GIN(platforms);
CREATE INDEX idx_channels_topics ON public.channels USING GIN(topics);
CREATE INDEX idx_formats_channel ON public.formats(channel_id);
CREATE INDEX idx_campaigns_advertiser ON public.campaigns(advertiser_id);
CREATE INDEX idx_placements_campaign ON public.placements(campaign_id);
CREATE INDEX idx_placements_channel ON public.placements(channel_id);
CREATE INDEX idx_analytics_placement ON public.analytics_events(placement_id);
CREATE INDEX idx_analytics_ts ON public.analytics_events(ts);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_placements_updated_at BEFORE UPDATE ON public.placements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON public.escrows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Channels policies
CREATE POLICY "Anyone can view channels" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Creators can create channels" ON public.channels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'creator')
);
CREATE POLICY "Creators can update own channels" ON public.channels FOR UPDATE USING (
  owner_user_id = auth.uid()
);

-- Formats policies
CREATE POLICY "Anyone can view formats" ON public.formats FOR SELECT USING (true);
CREATE POLICY "Channel owners can manage formats" ON public.formats FOR ALL USING (
  EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND owner_user_id = auth.uid())
);

-- Campaigns policies
CREATE POLICY "Users can view own campaigns" ON public.campaigns FOR SELECT USING (
  advertiser_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Advertisers can create campaigns" ON public.campaigns FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'advertiser')
);
CREATE POLICY "Advertisers can update own campaigns" ON public.campaigns FOR UPDATE USING (
  advertiser_id = auth.uid()
);

-- Placements policies
CREATE POLICY "Campaign owners and channel owners can view placements" ON public.placements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND advertiser_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND owner_user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Analytics policies
CREATE POLICY "Campaign owners can view analytics" ON public.analytics_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.placements p
    JOIN public.campaigns c ON p.campaign_id = c.id
    WHERE p.id = placement_id AND c.advertiser_id = auth.uid()
  )
);

-- Cases policies
CREATE POLICY "Anyone can view cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Admins can manage cases" ON public.cases FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
