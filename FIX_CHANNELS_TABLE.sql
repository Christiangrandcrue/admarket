-- ============================================
-- FIX CHANNELS TABLE - Add missing constraints
-- ============================================

-- Сначала проверим структуру channels
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'channels' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Если таблица channels существует, но неправильная - удалим и пересоздадим
DROP TABLE IF EXISTS public.channels CASCADE;

-- Создадим channels с правильной структурой
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

-- Создадим индексы
CREATE INDEX idx_channels_owner ON public.channels(owner_user_id);
CREATE INDEX idx_channels_platforms ON public.channels USING GIN(platforms);
CREATE INDEX idx_channels_topics ON public.channels USING GIN(topics);

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Channels policies
CREATE POLICY "Anyone can view channels" ON public.channels FOR SELECT USING (true);

CREATE POLICY "Creators can create channels" ON public.channels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'creator')
);

CREATE POLICY "Creators can update own channels" ON public.channels FOR UPDATE USING (
  owner_user_id = auth.uid()
);

-- Trigger for updated_at
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Проверка
SELECT table_name, constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'channels' AND table_schema = 'public';
