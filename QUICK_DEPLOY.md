# ⚡ QUICK DEPLOY — Быстрая инструкция

**Stripe ключи получены** ✅  
**Осталось**: Настроить webhook + добавить env vars в Vercel + применить миграции

---

## 🔥 ШАГ 1: Stripe Webhook (СРОЧНО)

### Настрой Stripe Webhook в Dashboard:

1. Открой [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Нажми **"Add endpoint"**
3. Заполни:
   - **Endpoint URL**: `https://admarket-neon.vercel.app/api/stripe/webhook`
   - **Description**: AdMarket Production Webhook
   - **Events to send** (выбери эти 5):
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
     - ✅ `transfer.created`
     - ✅ `transfer.updated`
     - ✅ `account.updated`
4. Нажми **"Add endpoint"**
5. **СКОПИРУЙ** `Signing secret` (начинается с `whsec_...`)

---

## 🔥 ШАГ 2: Vercel Environment Variables

Открой [Vercel Dashboard](https://vercel.com) → **твой проект** (admarket-neon) → **Settings** → **Environment Variables**

### Добавь эти переменные (для ВСЕХ окружений: Production, Preview, Development):

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_51SR61NFqMRSVCimKWWWAk29OoWAtZQ2zEyKv1bK4h8l6mLm8duB55NmEvPDLI3ak5olTieVJoct0pBGJDqzsWTwW00gnuSgPDk

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SR61NFqMRSVCimKtWAl97mbT6T1qIwuRC3XNZ3rP8waRil66aHOG3MN0ELHBnIp2GRV2wg8VRG0kXacupeNJtKV00tfHlskSK

STRIPE_WEBHOOK_SECRET=whsec_ВОТ_СЮДА_ВСТАВЬ_SIGNING_SECRET_ИЗ_STRIPE

# Telegram (если есть)
TELEGRAM_BOT_TOKEN=ТУТ_ТВОЙ_ТОКЕН_ОТ_BOTFATHER
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=ИМЯ_БОТА_БЕЗ_@

# App URL
NEXT_PUBLIC_APP_URL=https://admarket-neon.vercel.app
```

### Как добавить:
1. Нажми **"Add New"**
2. Вставь **Key** (например: `STRIPE_SECRET_KEY`)
3. Вставь **Value** (например: `sk_test_...`)
4. Выбери **все окружения** (Production + Preview + Development)
5. Нажми **"Save"**
6. Повтори для всех переменных

**После добавления** → Vercel автоматически начнёт редеплой.

---

## 🔥 ШАГ 3: Supabase Migrations (КРИТИЧНО)

Открой [Supabase Dashboard](https://supabase.com/dashboard/project/visoxfhymssvunyazgsl/sql/new)

### Migration 006: Telegram Integration

Скопируй ВЕСЬ текст ниже → вставь в SQL Editor → **Run**:

```sql
-- ============================================
-- ADD TELEGRAM INTEGRATION TO USERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_user_telegram(
  p_user_id UUID,
  p_telegram_chat_id TEXT,
  p_telegram_username TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'telegram_chat_id', p_telegram_chat_id,
      'telegram_username', p_telegram_username,
      'telegram_connected_at', NOW()
    )
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_telegram_chat_id(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chat_id TEXT;
BEGIN
  SELECT raw_user_meta_data->>'telegram_chat_id'
  INTO v_chat_id
  FROM auth.users
  WHERE id = p_user_id;
  
  RETURN v_chat_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.disconnect_user_telegram(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data - 'telegram_chat_id' - 'telegram_username' - 'telegram_connected_at'
  WHERE id = p_user_id;
END;
$$;

COMMENT ON FUNCTION public.update_user_telegram IS 'Update telegram connection data for user';
COMMENT ON FUNCTION public.get_user_telegram_chat_id IS 'Get telegram chat ID for user';
COMMENT ON FUNCTION public.disconnect_user_telegram IS 'Disconnect telegram from user account';
```

**Проверка**:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%telegram%';
```
Должно вернуть 3 функции.

---

### Migration 007: Stripe Fields

**ВАЖНО**: Открой файл `supabase/migrations/007_add_stripe_fields.sql` в проекте, скопируй **ВЕСЬ** текст → вставь в SQL Editor → **Run**

Или используй этот короткий SQL (основные поля):

```sql
-- Add Stripe fields to users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE;

-- Add Stripe fields to campaigns
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_paid',
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add Stripe fields to placements
ALTER TABLE public.placements
ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT,
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payout_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS paid_out_at TIMESTAMPTZ;

-- Create transactions table
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

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_stripe_account ON public.users(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_stripe_payment_intent ON public.campaigns(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_placements_stripe_transfer ON public.placements(stripe_transfer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_id ON public.transactions(stripe_id);
```

**Проверка**:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name LIKE 'stripe%';
```

---

### Migration 008: Admin Features

**ВАЖНО**: Открой файл `supabase/migrations/008_add_admin_features.sql`, скопируй **ВЕСЬ** текст → Run

Или используй короткую версию:

```sql
-- Add moderation fields to channels
ALTER TABLE public.channels
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add moderation fields to campaigns
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- Add user management fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Create flags table
CREATE TABLE IF NOT EXISTS public.flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES public.users(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('platform_fee_percentage', '10', 'Platform commission percentage'),
  ('min_campaign_budget', '5000', 'Minimum campaign budget in RUB')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own flags" ON public.flags FOR SELECT USING (
  reporter_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view settings" ON public.platform_settings FOR SELECT USING (true);

-- Create log_admin_action function
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
    admin_id, action, entity_type, entity_id, old_values, new_values, notes
  ) VALUES (
    p_admin_id, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values, p_notes
  ) RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$;
```

**Проверка**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('flags', 'audit_logs', 'platform_settings');
```

---

### Создать Admin User

```sql
-- Найди свой user_id (скопируй из результата)
SELECT id, email FROM auth.users;

-- Назначь себе admin роль (ЗАМЕНИ на свой UUID)
UPDATE public.users 
SET role = 'admin' 
WHERE id = 'ТВОЙ_USER_ID_ТУТ';

-- Проверка
SELECT id, email, role FROM public.users WHERE role = 'admin';
```

---

## 🔥 ШАГ 4: Telegram Webhook (если есть бот)

Если у тебя есть Telegram Bot Token, выполни:

```bash
curl -X POST "https://api.telegram.org/bot<ТВОЙ_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://admarket-neon.vercel.app/api/telegram/webhook"}'
```

**Проверка**:
```bash
curl "https://api.telegram.org/bot<ТВОЙ_TOKEN>/getWebhookInfo"
```

---

## ✅ Проверка после деплоя

### 1. Дождись окончания Vercel deployment
Vercel Dashboard → Deployments → дождись зелёной галочки

### 2. Тестовый API запрос
```bash
curl https://admarket-neon.vercel.app/api/health
```

### 3. Проверь Admin Panel
Зайди на: `https://admarket-neon.vercel.app/dashboard/admin`

Если видишь 403 Forbidden → проверь, что выполнил `UPDATE users SET role = 'admin'`

### 4. Протестируй Creator Flow
1. Создай Channel
2. Нажми "Connect Stripe Account" → пройди Express onboarding
3. Проверь, что статус изменился на "Connected"

### 5. Тестовый платёж
Создай Campaign → оплати тестовой картой:
- Card: `4242 4242 4242 4242`
- Expiry: `12/34`
- CVC: `123`

Проверь в Stripe Dashboard → Payments, что платёж прошёл.

---

## 🐛 Если что-то сломалось

### "STRIPE_SECRET_KEY is not set"
→ Vercel → Settings → Environment Variables → проверь, что добавил **ВСЕ** переменные

### Admin Panel 403
→ Supabase → SQL Editor → выполни `UPDATE users SET role = 'admin'`

### Stripe Webhook не работает
→ Stripe Dashboard → Webhooks → проверь URL и Events

### Vercel не редеплоится
→ Vercel → Deployments → три точки → **Redeploy**

---

## 🎯 Следующие шаги

1. ✅ Применить миграции в Supabase
2. ✅ Настроить Stripe Webhook
3. ✅ Добавить env vars в Vercel
4. ✅ Создать admin пользователя
5. ✅ Протестировать full user flow

**Готово!** После этого у тебя работающая платформа с Stripe, Telegram и Admin Panel.

---

**Вопросы?** Начинай с миграций — это самое важное! 🚀
