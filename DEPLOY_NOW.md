# 🚀 DEPLOY NOW - Пошаговая инструкция

**Статус**: Код готов к production. Все фичи реализованы: Stripe, Telegram, Admin Panel.

**Последний коммит**: `c8afaf6` - docs: Add complete Admin Panel guide

---

## ⚡ Быстрый старт (5 шагов)

### 1️⃣ Применить миграции в Supabase (ОБЯЗАТЕЛЬНО)

Открой [Supabase Dashboard](https://supabase.com/dashboard) → твой проект → SQL Editor

**Выполни 3 миграции по очереди:**

#### Migration 006: Telegram Integration
```sql
-- Скопируй ВЕСЬ код из supabase/migrations/006_add_telegram_to_users.sql
-- Создаёт 3 RPC функции для работы с Telegram через auth.users.raw_user_meta_data

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
Должны быть: `update_user_telegram`, `get_user_telegram_chat_id`, `disconnect_user_telegram`

---

#### Migration 007: Stripe Connect Fields
```sql
-- Скопируй ВЕСЬ код из supabase/migrations/007_add_stripe_fields.sql
-- Добавляет Stripe поля в users, campaigns, placements
-- Создаёт таблицу transactions для истории платежей
```

**Проверка**:
```sql
-- Проверь новые колонки
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE 'stripe%';

-- Проверь таблицу transactions
SELECT * FROM information_schema.tables 
WHERE table_name = 'transactions';
```

---

#### Migration 008: Admin Panel Features
```sql
-- Скопируй ВЕСЬ код из supabase/migrations/008_add_admin_features.sql
-- Добавляет moderation_status в channels/campaigns
-- Создаёт таблицы: flags, audit_logs, platform_settings
-- Создаёт функцию log_admin_action()
```

**Проверка**:
```sql
-- Проверь новые таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('flags', 'audit_logs', 'platform_settings');

-- Проверь platform_settings заполнены дефолтными значениями
SELECT key, value FROM platform_settings;
```

---

### 2️⃣ Создать Admin-пользователя

В Supabase SQL Editor выполни:

```sql
-- Найди свой user_id
SELECT id, email FROM auth.users;

-- Назначь себе роль admin (замени USER_ID на свой)
UPDATE public.users 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID_HERE';

-- Проверка
SELECT id, email, role FROM users WHERE role = 'admin';
```

**После этого ты сможешь зайти в Admin Panel**: `https://admarket-neon.vercel.app/dashboard/admin`

---

### 3️⃣ Настроить Stripe (Test Mode)

#### 3.1 Создать Stripe аккаунт
1. Перейди на [stripe.com](https://stripe.com) → Sign Up
2. **ВАЖНО**: Включи **Test Mode** (переключатель в левом верхнем углу)

#### 3.2 Получить API Keys
1. Dashboard → Developers → API keys
2. Скопируй:
   - **Publishable key** (начинается с `pk_test_...`)
   - **Secret key** (начинается с `sk_test_...`)

#### 3.3 Включить Stripe Connect
1. Dashboard → Connect → Get started
2. Выбери **Platform or marketplace**
3. Выбери **Express** (самый простой для creators)
4. Configure:
   - Brand name: **AdMarket**
   - Brand color: `#3b82f6` (синий)
   - Brand icon: (можешь пропустить)

#### 3.4 Настроить Webhook
1. Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://admarket-neon.vercel.app/api/stripe/webhook`
3. Events to send (выбери все):
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
   - `transfer.updated`
   - `account.updated`
4. Скопируй **Signing secret** (начинается с `whsec_...`)

---

### 4️⃣ Настроить Telegram Bot Webhook

Используй свой `TELEGRAM_BOT_TOKEN` (из @BotFather):

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://admarket-neon.vercel.app/api/telegram/webhook",
    "allowed_updates": ["message"]
  }'
```

**Проверка**:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Должен вернуть: `"url": "https://admarket-neon.vercel.app/api/telegram/webhook"`

---

### 5️⃣ Добавить Environment Variables в Vercel

Перейди в [Vercel Dashboard](https://vercel.com) → твой проект → Settings → Environment Variables

**Добавь эти переменные** (для всех окружений: Production, Preview, Development):

```bash
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Telegram
TELEGRAM_BOT_TOKEN=<твой токен от @BotFather>
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=<имя бота без @>

# App URL (уже есть, но проверь)
NEXT_PUBLIC_APP_URL=https://admarket-neon.vercel.app
```

**После добавления** → Vercel автоматически задеплоит проект заново.

---

## ✅ Проверка деплоя

### Базовая проверка
```bash
# 1. Главная страница
curl https://admarket-neon.vercel.app

# 2. API health check
curl https://admarket-neon.vercel.app/api/health

# 3. Admin dashboard (должен редиректить на /login если не залогинен)
curl https://admarket-neon.vercel.app/dashboard/admin
```

### Проверка интеграций

**Stripe:**
- Зайди в Dashboard → Channels → Create Channel
- После создания проверь, что кнопка "Connect Stripe Account" появилась
- Нажми, пройди Stripe Express onboarding (тестовый режим)

**Telegram:**
- Зайди в Settings → Notifications
- Нажми "Connect Telegram"
- Отправь `/start <verification_code>` боту
- Проверь, что статус изменился на "Connected"

**Admin Panel:**
- Зайди в `/dashboard/admin` (должен быть доступ после UPDATE role = 'admin')
- Проверь, что видишь:
  - Dashboard с overview картами
  - Channels/Campaigns/Users management
  - Financials (GMV, revenue, payouts)
  - Audit Logs

---

## 🧪 Тестовые сценарии

### Сценарий 1: Creator Onboarding
1. Зарегистрируйся как новый пользователь
2. Создай Channel → Connect Stripe → пройди onboarding
3. Connect Telegram → отправь `/start` коду боту
4. Проверь в Settings, что оба интеграции подключены

### Сценарий 2: Campaign Payment (Test Card)
1. Создай Campaign (бюджет 10000 RUB)
2. На странице оплаты используй тестовую карту:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
3. Проверь, что:
   - Campaign.payment_status = 'succeeded'
   - Transaction создана в БД
   - Notification пришла (in-app + Telegram)

### Сценарий 3: Content Approval & Payout
1. Creator загружает Content для Placement
2. Admin заходит в `/dashboard/admin/campaigns`
3. Approve контент → автоматически вызывается `releaseFundsForPlacement()`
4. Проверь, что:
   - Placement.payout_status = 'processing' (затем 'paid')
   - Transaction создана с type = 'transfer'
   - Creator получил notification о выплате

### Сценарий 4: Admin Moderation
1. Зайди в Admin Panel
2. Channels → Reject какой-то канал с причиной
3. Проверь в Audit Logs, что действие записано
4. Users → Suspend пользователя на 30 дней
5. Financials → посмотри GMV и Revenue

---

## 🐛 Troubleshooting

### "STRIPE_SECRET_KEY is not set"
**Причина**: Env vars не добавлены в Vercel

**Решение**:
1. Vercel Dashboard → Settings → Environment Variables
2. Добавь все Stripe переменные
3. Redeploy (Deployments → три точки → Redeploy)

---

### "Webhook signature verification failed"
**Причина**: Неверный `STRIPE_WEBHOOK_SECRET`

**Решение**:
1. Stripe Dashboard → Developers → Webhooks
2. Скопируй Signing Secret заново
3. Обнови в Vercel Environment Variables
4. Redeploy

---

### "Admin Panel: 403 Forbidden"
**Причина**: У пользователя нет роли `admin`

**Решение**:
```sql
-- Supabase SQL Editor
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

---

### Telegram Bot не отвечает
**Причина**: Webhook не настроен или неверный

**Решение**:
```bash
# Удали старый webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"

# Установи заново
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://admarket-neon.vercel.app/api/telegram/webhook"

# Проверь статус
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

---

### Payout не происходит автоматически
**Причина**: Creator не прошёл Stripe onboarding или не enabled для payouts

**Решение**:
1. Проверь в Stripe Dashboard → Connect → Accounts
2. Убедись, что `charges_enabled = true` и `payouts_enabled = true`
3. Если нет, creator должен закончить onboarding

---

## 📊 Мониторинг после деплоя

### Stripe Dashboard
- Payments → смотри Test payments
- Connect → Accounts → проверяй onboarding status
- Webhooks → Events → смотри успешность webhooks

### Supabase Dashboard
- Table Editor → transactions → проверяй записи
- Table Editor → audit_logs → смотри admin actions
- Logs → ищи ошибки в RPC calls

### Vercel Dashboard
- Deployments → Functions → смотри логи API routes
- Analytics → проверяй траффик
- Speed Insights → отслеживай производительность

---

## 🎉 Следующие шаги после деплоя

1. **Протестировать полный user flow** (Creator → Advertiser → Admin)
2. **Проверить все уведомления** (In-app + Telegram)
3. **Убедиться, что Stripe payouts работают** (тестовые транзакции)
4. **Заполнить первые данные** (тестовые каналы, campaigns)
5. **Настроить Production Stripe** (когда будешь готов к реальным деньгам)

---

## 🚦 Статус фич

| Фича | Статус | Комментарий |
|------|--------|------------|
| ✅ Stripe Connect | Ready | Test mode, нужно переключить на Production |
| ✅ Telegram Bot | Ready | Webhook настроен |
| ✅ Admin Panel | Ready | Moderation + Financials + Audit |
| ✅ Real-time Notifications | Ready | Supabase Realtime subscriptions |
| ✅ Escrow Payments | Ready | Payment Intent (manual capture) |
| ✅ Automatic Payouts | Ready | `releaseFundsForPlacement()` |
| ✅ Audit Trail | Ready | `log_admin_action()` |

---

**Последнее обновление**: 2025-11-23

**Вопросы?** Пиши мне, помогу разобраться!
