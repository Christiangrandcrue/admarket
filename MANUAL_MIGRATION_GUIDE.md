# 📋 Руководство по ручному применению миграции

## Проблема

У тебя ошибка: **"Invalid API key. Double check your Supabase `anon` or `service_role` API key"**

Это означает, что в **Vercel Environment Variables** не настроены правильные Supabase ключи.

---

## ✅ Решение (3 шага)

### Шаг 1: Найди или создай Supabase Database проект

#### Вариант A: Если проект уже есть

1. Открой https://supabase.com/dashboard
2. Найди проект с базой данных (не Management API проект)
3. Перейди в **Settings** → **API**
4. Скопируй:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbG...` (длинный JWT токен)
   - **service_role key:** `eyJhbG...` (нажми Reveal)

#### Вариант B: Если проекта нет - создай новый

1. На https://supabase.com/dashboard нажми **"New project"**
2. Заполни:
   - **Name:** `webapp-production`
   - **Database Password:** (придумай надёжный пароль)
   - **Region:** `Europe (Frankfurt)` или ближайший
3. Жди 2-3 минуты пока создастся
4. После создания перейди в **Settings** → **API**
5. Скопируй ключи (см. выше)

---

### Шаг 2: Примени SQL миграцию

1. В Supabase Dashboard перейди в **SQL Editor** (иконка `/\` слева)
2. Нажми **"New query"**
3. Скопируй и вставь весь SQL код ниже:

```sql
-- Create creator_videos table for storing generated video history
CREATE TABLE IF NOT EXISTS creator_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Video metadata
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  style TEXT,
  duration INTEGER,
  
  -- TurboBoost task info
  task_id TEXT,
  turboboost_video_url TEXT,
  
  -- Local storage (optional)
  local_video_url TEXT,
  thumbnail_url TEXT,
  
  -- Video stats
  file_size BIGINT,
  resolution TEXT,
  format TEXT DEFAULT 'mp4',
  
  -- Generation status
  status TEXT NOT NULL DEFAULT 'generating',
  error_message TEXT,
  
  -- Publishing info
  published_to JSONB DEFAULT '[]'::jsonb,
  scheduled_publish_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_creator_videos_creator_id ON creator_videos(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_videos_status ON creator_videos(status);
CREATE INDEX IF NOT EXISTS idx_creator_videos_created_at ON creator_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_videos_task_id ON creator_videos(task_id);
CREATE INDEX IF NOT EXISTS idx_creator_videos_deleted_at ON creator_videos(deleted_at) WHERE deleted_at IS NULL;

-- RLS (Row Level Security) policies
ALTER TABLE creator_videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own videos" ON creator_videos;
DROP POLICY IF EXISTS "Users can insert own videos" ON creator_videos;
DROP POLICY IF EXISTS "Users can update own videos" ON creator_videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON creator_videos;

-- Policy: Users can only see their own videos
CREATE POLICY "Users can view own videos"
  ON creator_videos
  FOR SELECT
  USING (auth.uid() = creator_id);

-- Policy: Users can insert their own videos
CREATE POLICY "Users can insert own videos"
  ON creator_videos
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Policy: Users can update their own videos
CREATE POLICY "Users can update own videos"
  ON creator_videos
  FOR UPDATE
  USING (auth.uid() = creator_id);

-- Policy: Users can delete their own videos (soft delete)
CREATE POLICY "Users can delete own videos"
  ON creator_videos
  FOR DELETE
  USING (auth.uid() = creator_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_creator_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_creator_videos_updated_at ON creator_videos;

-- Trigger for updated_at
CREATE TRIGGER trigger_creator_videos_updated_at
  BEFORE UPDATE ON creator_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_videos_updated_at();

-- Comments
COMMENT ON TABLE creator_videos IS 'Stores history of AI-generated videos for creators';
COMMENT ON COLUMN creator_videos.prompt IS 'Original user prompt/brief used for video generation';
COMMENT ON COLUMN creator_videos.published_to IS 'JSON array of platforms where video was published';
COMMENT ON COLUMN creator_videos.status IS 'Video generation/publishing status: generating, ready, failed, published';
```

4. Нажми **"Run"** (или Ctrl+Enter)
5. Должно появиться сообщение: **"Success. No rows returned"**

---

### Шаг 3: Обнови Environment Variables в Vercel

1. Открой https://vercel.com/synth-nova-influencers-projects/webapp/settings/environment-variables

2. Добавь или обнови следующие переменные:

#### NEXT_PUBLIC_SUPABASE_URL
```
https://xxxxx.supabase.co
```
*(замени xxxxx на твой Project URL из Supabase)*

**Environments:** ✅ Production ✅ Preview ✅ Development

---

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
```
*(скопируй весь anon public key из Supabase)*

**Environments:** ✅ Production ✅ Preview ✅ Development

---

#### SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
```
*(скопируй весь service_role key из Supabase, нажми Reveal)*

**Environments:** ✅ Production ✅ Preview ✅ Development

---

3. После добавления всех переменных нажми **"Save"**

4. **Redeploy проект:**
   ```bash
   git commit --allow-empty -m "trigger: Redeploy with Supabase env vars"
   git push origin main
   ```

   Или в Vercel Dashboard:
   - **Deployments** → последний деплой → **⋯** → **Redeploy**

---

## ✅ Проверка

После редеплоя:

1. **Проверь создание кампании:**
   - Открой https://ads.synthnova.me/campaign/create
   - Заполни форму
   - Должно сохраниться без ошибки "Invalid API key"

2. **Проверь генерацию видео:**
   - Открой https://ads.synthnova.me/dashboard/creator
   - Нажми "🎬 AI Генерация видео"
   - Сгенерируй видео
   - После завершения перейди на https://ads.synthnova.me/dashboard/creator/videos
   - Должно появиться сохранённое видео!

---

## 🆘 Если что-то не работает

### Ошибка: "relation creator_videos does not exist"
→ Миграция не применилась. Повтори Шаг 2.

### Ошибка: "Invalid API key" всё ещё есть
→ Environment variables не обновились. Проверь:
1. Правильно ли скопированы ключи (без лишних пробелов)
2. Выбраны ли все 3 окружения (Production, Preview, Development)
3. Сделан ли redeploy после добавления переменных

### Ошибка: "JWT expired" или "JWT malformed"
→ Ключи устарели или неправильные. Скопируй свежие из Supabase Settings → API.

---

## 📞 Нужна помощь?

Если возникнут проблемы:
1. Сделай скриншот ошибки
2. Скриншот Supabase Settings → API (закрой только последние символы ключей)
3. Скриншот Vercel Environment Variables (закрой значения)

Я помогу разобраться!

---

**Дата создания:** 2025-11-27  
**Версия:** 1.0  
**Следующий шаг:** После успешного применения → Автопостинг в TikTok/Instagram
