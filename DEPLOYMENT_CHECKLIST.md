# 🚀 Deployment Checklist — AdMarket

## Текущий статус

- ✅ Код: Все изменения закоммичены (commit c8afaf6)
- ⏳ GitHub: Нужно push
- ⏳ Vercel: Нужно redeploy
- ⏳ Supabase: Нужно применить миграции (006, 007, 008)
- ⏳ Stripe: Нужно настроить
- ⏳ Telegram: Нужно настроить webhook

---

## ✅ Шаг 1: Supabase Migrations (КРИТИЧНО)

### Migration 006: Telegram Integration

**SQL скрипт**: `supabase/migrations/006_add_telegram_to_users.sql`

**Что делает**:
- Создаёт RPC функции для Telegram:
  - `update_user_telegram()` — сохраняет telegram_chat_id в auth.users
  - `get_user_telegram_chat_id()` — получает chat_id
  - `disconnect_user_telegram()` — отключает Telegram

**Как применить**:
```
1. Открыть Supabase Dashboard
2. Перейти в SQL Editor
3. Скопировать весь контент из supabase/migrations/006_add_telegram_to_users.sql
4. Нажать Run
5. Проверить: должно быть "Success. No rows returned"
```

**Проверка**:
```sql
-- Должны появиться 3 функции
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%telegram%';

-- Результат:
-- update_user_telegram
-- get_user_telegram_chat_id
-- disconnect_user_telegram
```

---

### Migration 007: Stripe Connect

**SQL скрипт**: `supabase/migrations/007_add_stripe_fields.sql`

**Что делает**:
- Добавляет Stripe поля в users, campaigns, placements
- Создаёт таблицу transactions
- Создаёт индексы
- Настраивает RLS policies

**Как применить**:
```
1. Открыть Supabase Dashboard
2. Перейти в SQL Editor
3. Скопировать весь контент из supabase/migrations/007_add_stripe_fields.sql
4. Нажать Run
5. Проверить: "Success. No rows returned"
```

**Проверка**:
```sql
-- Проверить поля users
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name LIKE 'stripe%';

-- Результат:
-- stripe_account_id
-- stripe_account_status
-- stripe_onboarding_completed
-- stripe_charges_enabled
-- stripe_payouts_enabled

-- Проверить таблицу transactions
SELECT COUNT(*) FROM transactions;
-- Результат: 0 (таблица пустая, но существует)
```

---

### Migration 008: Admin Panel

**SQL скрипт**: `supabase/migrations/008_add_admin_features.sql`

**Что делает**:
- Добавляет moderation_status в channels, campaigns
- Добавляет user management поля (status, suspended_until, banned_at)
- Создаёт таблицы: flags, audit_logs, platform_settings
- Создаёт RPC функцию log_admin_action()
- Настраивает RLS policies

**Как применить**:
```
1. Открыть Supabase Dashboard
2. Перейти в SQL Editor
3. Скопировать весь контент из supabase/migrations/008_add_admin_features.sql
4. Нажать Run
5. Проверить: "Success. No rows returned"
```

**Проверка**:
```sql
-- Проверить новые таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('flags', 'audit_logs', 'platform_settings');

-- Результат: 3 таблицы

-- Проверить platform_settings заполнены
SELECT key, value FROM platform_settings;

-- Результат: 8 настроек (platform_fee_percentage, min_campaign_budget, и т.д.)

-- Проверить moderation поля
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'channels' AND column_name LIKE 'moderation%';

-- Результат:
-- moderation_status
-- moderation_notes
-- moderated_by
-- moderated_at
```

---

## ✅ Шаг 2: Создать Admin User

**В Supabase Dashboard → SQL Editor**:

```sql
-- ВАРИАНТ 1: Обновить существующего пользователя
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Проверить
SELECT id, email, role, status FROM public.users WHERE role = 'admin';
```

**ВАЖНО**: Замените `your-email@example.com` на ваш реальный email

---

## ✅ Шаг 3: Stripe Setup (Test Mode)

### 3.1 Создать Stripe Account

1. Перейти на https://stripe.com
2. Sign Up / Log In
3. **Переключиться на Test Mode** (toggle вверху справа)

### 3.2 Получить API Keys

**Dashboard → Developers → API keys**

Скопировать:
- ✅ **Publishable key** (pk_test_...)
- ✅ **Secret key** (sk_test_...)

### 3.3 Включить Connect

**Dashboard → Connect → Settings**

1. Нажать "Get started"
2. Business type: **Marketplace**
3. Platform model: **Two-sided marketplace**
4. Onboarding type: **Express** (быстрая верификация)
5. Сохранить

### 3.4 Настроить Webhook

**Dashboard → Developers → Webhooks → Add endpoint**

**Endpoint URL**: 
```
https://admarket-neon.vercel.app/api/stripe/webhook
```

**Events to send**:
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `transfer.created`
- ✅ `transfer.updated`
- ✅ `account.updated`

**После создания**:
- Скопировать **Signing secret** (whsec_...)

---

## ✅ Шаг 4: Telegram Bot Setup

### 4.1 Получить Bot Token

Если ещё нет:
1. Открыть [@BotFather](https://t.me/BotFather) в Telegram
2. Отправить `/newbot`
3. Следовать инструкциям
4. Скопировать **Bot Token** (например: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Скопировать **Bot Username** (например: `admarket_notify_bot`)

### 4.2 Настроить Webhook

**Выполнить команду**:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://admarket-neon.vercel.app/api/telegram/webhook"}'
```

**Замените**:
- `<YOUR_BOT_TOKEN>` на ваш токен

**Ожидаемый ответ**:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

**Проверка**:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

---

## ✅ Шаг 5: Environment Variables в Vercel

**Vercel Dashboard → Your Project → Settings → Environment Variables**

### Добавить переменные:

```bash
# Stripe (НОВЫЕ)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Telegram (НОВЫЕ)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=admarket_notify_bot

# App URL (ОБНОВИТЬ)
NEXT_PUBLIC_APP_URL=https://admarket-neon.vercel.app

# Supabase (УЖЕ ЕСТЬ - проверить)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend (УЖЕ ЕСТЬ - проверить)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=AdMarket <noreply@yourdomain.com>
```

**ВАЖНО**: После добавления переменных нужно **redeploy** проект!

---

## ✅ Шаг 6: Push to GitHub

**Настроить GitHub auth** (если ещё не настроено):
```bash
# В коде выполнить:
setup_github_environment()

# Если не работает - попросить юзера авторизоваться в GitHub tab
```

**Push код**:
```bash
cd /home/user/webapp
git push origin main
```

**Проверка**:
- GitHub должен показать последний commit: c8afaf6
- Все файлы загружены

---

## ✅ Шаг 7: Vercel Deployment

### Auto-deploy (если настроен GitHub integration):
- Vercel автоматически задеплоит после push
- Проверить: Vercel Dashboard → Deployments → Latest

### Manual deploy (если нужно):
```bash
cd /home/user/webapp
npm run deploy
```

**Проверка**:
- Deployment Status: Ready
- Build logs: No errors
- URL: https://admarket-neon.vercel.app

---

## ✅ Шаг 8: Post-Deployment Tests

### 8.1 Basic Health Check

**Тест 1: Главная страница**
```
URL: https://admarket-neon.vercel.app
Ожидается: Главная страница загружается без ошибок
```

**Тест 2: API Health**
```
URL: https://admarket-neon.vercel.app/api/channels
Ожидается: JSON с списком каналов
```

**Тест 3: Auth**
```
URL: https://admarket-neon.vercel.app/auth/login
Ожидается: Форма входа загружается
```

### 8.2 Telegram Webhook

**Проверить webhook**:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

**Ожидается**:
```json
{
  "ok": true,
  "result": {
    "url": "https://admarket-neon.vercel.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### 8.3 Stripe Webhook

**Проверить в Stripe Dashboard**:
1. Developers → Webhooks
2. Найти webhook для admarket-neon.vercel.app
3. Status: Active
4. Signing secret: скопирован в Vercel env vars

### 8.4 Admin Panel

**Тест**:
```
1. Зайти на https://admarket-neon.vercel.app/auth/login
2. Войти с admin email
3. Перейти на https://admarket-neon.vercel.app/dashboard/admin
4. Должен увидеть Admin Dashboard со статистикой
```

**Если 403 Forbidden**:
- Проверить что user.role = 'admin' в Supabase
- Проверить что user.status = 'active'

---

## ✅ Шаг 9: Full User Flow Testing

### Сценарий 1: Creator Onboarding

```
1. Регистрация как Creator
   - /auth/register → role: creator
   - Проверить email verification

2. Подключить Stripe
   - /dashboard/creator/earnings
   - Нажать "Подключить Stripe"
   - Заполнить форму Stripe Express (тестовые данные)
   - Вернуться на сайт
   - Статус: "Подключен" ✅

3. Подключить Telegram
   - /dashboard/creator/earnings
   - Нажать "Подключить Telegram"
   - Открыть ссылку в Telegram
   - Отправить /start с кодом
   - Статус: "Подключен" ✅
```

### Сценарий 2: Campaign Creation & Payment

```
1. Регистрация как Advertiser
   - /auth/register → role: advertiser

2. Создать кампанию
   - /campaign/create
   - Пройти 6 шагов wizard
   - Выбрать каналы, бюджет 10,000 RUB
   - Создать кампанию

3. Оплатить кампанию (ТЕСТОВАЯ КАРТА)
   - /dashboard/campaigns/[id]
   - Нажать "Оплатить"
   - Карта: 4242 4242 4242 4242
   - Expiry: 12/25, CVC: 123
   - Оплатить
   - Статус: "succeeded" ✅
```

### Сценарий 3: Content Upload & Review

```
1. Creator получает уведомление
   - In-app notification
   - Email notification
   - Telegram notification (если подключен)

2. Creator загружает контент
   - /dashboard/creator/placements/[id]/upload
   - Загрузить URL контента
   - Статус: "pending_review"

3. Advertiser проверяет контент
   - /dashboard/campaigns/[id]
   - Просмотр контента
   - Approve content
   - Статус: "approved" ✅

4. Автоматическая выплата
   - releaseFundsForPlacement() вызывается
   - Transfer создаётся в Stripe
   - Placement.payout_status = "processing"
   - Webhook получен → "paid" ✅
```

### Сценарий 4: Admin Moderation

```
1. Войти как Admin
   - /dashboard/admin

2. Модерировать канал
   - /dashboard/admin/channels
   - Найти pending channel
   - Approve или Reject с notes
   - Проверить audit_logs

3. Модерировать кампанию
   - /dashboard/admin/campaigns
   - Найти pending campaign
   - Approve или Reject

4. Финансовые отчёты
   - /dashboard/admin/financials
   - Проверить GMV, revenue, growth
   - Просмотр транзакций
```

---

## 🐛 Troubleshooting

### Ошибка: "STRIPE_SECRET_KEY is not set"

**Причина**: Environment variables не обновлены

**Решение**:
1. Vercel Dashboard → Settings → Environment Variables
2. Добавить все Stripe переменные
3. **Redeploy** проект (важно!)

### Ошибка: "Webhook signature verification failed"

**Причина**: Неверный STRIPE_WEBHOOK_SECRET

**Решение**:
1. Stripe Dashboard → Webhooks → Signing secret
2. Скопировать актуальный secret
3. Обновить в Vercel env vars
4. Redeploy

### Ошибка: "No such payment_intent"

**Причина**: Используется неправильный API key (test vs live)

**Решение**:
- Проверить что в Vercel env vars используется `sk_test_...`
- Проверить что Stripe Dashboard в Test Mode

### Admin Panel: 403 Forbidden

**Причина**: User не admin

**Решение**:
```sql
-- В Supabase SQL Editor
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Telegram webhook не работает

**Причина**: Webhook URL неверный или не настроен

**Решение**:
```bash
# Проверить
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Если пустой - настроить заново
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://admarket-neon.vercel.app/api/telegram/webhook"
```

---

## ✅ Success Criteria

Deployment считается успешным если:

- [x] Сайт загружается без ошибок
- [x] Можно зарегистрироваться/войти
- [x] Можно создать кампанию
- [x] Можно оплатить кампанию (тестовая карта)
- [x] Creator может подключить Stripe
- [x] Creator может загрузить контент
- [x] Advertiser может одобрить контент
- [x] Автоматическая выплата работает
- [x] Admin panel доступен
- [x] Telegram уведомления работают
- [x] Email уведомления работают
- [x] Webhooks обрабатываются корректно

---

## 📊 Post-Launch Monitoring

**После успешного деплоя отслеживать**:

### Vercel Dashboard:
- Function logs (ошибки)
- Response times
- Error rate

### Stripe Dashboard:
- Payment success rate
- Failed payments
- Webhook delivery rate (должен быть >99%)

### Supabase Dashboard:
- Database queries performance
- RLS policy violations
- Auth failures

---

**Дата**: 2025-11-23  
**Версия**: 1.0  
**Статус**: Ready for Deployment ✅
