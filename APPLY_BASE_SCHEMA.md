# 🔧 Применение базовой схемы БД — СРОЧНО

**Проблема**: Таблица `public.users` не существует  
**Причина**: Базовая схема (`schema.sql`) не была применена  
**Решение**: Применить `schema.sql` ПЕРЕД миграциями 006/007/008

---

## ✅ ШАГ 1: Проверь существующие таблицы

Выполни в Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Если в списке НЕТ** таких таблиц:
- `users`
- `channels`
- `campaigns`
- `placements`
- `escrows`
- `analytics_events`
- `cases`

→ **Переходи к Шагу 2**

---

## ✅ ШАГ 2: Применить базовую схему

### Вариант A: Через файл (РЕКОМЕНДУЮ)

1. Открой файл **`supabase/schema.sql`** в проекте
2. Скопируй **ВЕСЬ** текст (203 строки)
3. Вставь в Supabase SQL Editor
4. Нажми **RUN**

---

### Вариант B: Через копипаст (если не видишь файл)

Скопируй этот SQL и вставь в Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.channels (
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_channels_owner ON public.channels(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_channels_platforms ON public.channels USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_channels_topics ON public.channels USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_formats_channel ON public.formats(channel_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser ON public.campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_placements_campaign ON public.placements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_placements_channel ON public.placements(channel_id);
CREATE INDEX IF NOT EXISTS idx_analytics_placement ON public.analytics_events(placement_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ts ON public.analytics_events(ts);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_channels_updated_at ON public.channels;
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_placements_updated_at ON public.placements;
CREATE TRIGGER update_placements_updated_at BEFORE UPDATE ON public.placements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrows_updated_at ON public.escrows;
CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON public.escrows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Channels policies
DROP POLICY IF EXISTS "Anyone can view channels" ON public.channels;
CREATE POLICY "Anyone can view channels" ON public.channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can create channels" ON public.channels;
CREATE POLICY "Creators can create channels" ON public.channels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'creator')
);

DROP POLICY IF EXISTS "Creators can update own channels" ON public.channels;
CREATE POLICY "Creators can update own channels" ON public.channels FOR UPDATE USING (
  owner_user_id = auth.uid()
);

-- Formats policies
DROP POLICY IF EXISTS "Anyone can view formats" ON public.formats;
CREATE POLICY "Anyone can view formats" ON public.formats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Channel owners can manage formats" ON public.formats;
CREATE POLICY "Channel owners can manage formats" ON public.formats FOR ALL USING (
  EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND owner_user_id = auth.uid())
);

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
```

---

## ✅ ШАГ 3: Проверка

После выполнения проверь:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Должно вернуть 8 таблиц:**
- analytics_events
- campaigns
- cases
- channels
- escrows
- formats
- placements
- users

---

## 🚀 ШАГ 4: Теперь применяй миграции

**ТОЛЬКО ПОСЛЕ** применения базовой схемы выполняй:

1. ✅ Migration 006 (Telegram) — уже применена
2. ⏳ Migration 007 (Stripe) — теперь заработает
3. ⏳ Migration 008 (Admin) — теперь заработает

---

## 📋 Правильный порядок действий:

1. ✅ **BASE SCHEMA** (`schema.sql`) — создаёт основные таблицы
2. ✅ **Migration 006** — добавляет Telegram функции
3. ✅ **Migration 007** — добавляет Stripe поля в существующие таблицы
4. ✅ **Migration 008** — добавляет Admin поля и таблицы

---

**Готов?** Скопируй SQL из Варианта B или открой `supabase/schema.sql` → RUN

Дай знать результат! 👇
