# 🔐 Vercel Environment Variables — Финальная конфигурация

**Все переменные готовы к добавлению в Vercel Dashboard**

---

## 📋 Environment Variables для Vercel

Открой [Vercel Dashboard](https://vercel.com) → **твой проект** → **Settings** → **Environment Variables**

### Добавь все эти переменные (для Production + Preview + Development):

```bash
# ============================================
# STRIPE (Test Mode) - ЗАМЕНИ НА СВОИ КЛЮЧИ
# ============================================
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE

# ⚠️ ПОЛУЧИ ЭТОТ ИЗ STRIPE DASHBOARD
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_STRIPE

# ============================================
# TELEGRAM BOT - ЗАМЕНИ НА СВОЙ ТОКЕН
# ============================================
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_FROM_BOTFATHER

NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YOUR_BOT_USERNAME

# ============================================
# APPLICATION
# ============================================
NEXT_PUBLIC_APP_URL=https://admarket-neon.vercel.app

# ============================================
# SUPABASE (уже должны быть, но проверь)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://visoxfhymssvunyazgsl.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpc294Zmh5bXNzdnVueWF6Z3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDg5NDIsImV4cCI6MjA3OTMyNDk0Mn0.9fykm5X3fLT7sQz366gQqwO9zu_BuhnKh-_WSeaRpzs
```

---

## ✅ Telegram Webhook Status

**Статус**: ✅ Webhook настроен и работает

```json
{
  "url": "https://admarket-neon.vercel.app/api/telegram/webhook",
  "pending_update_count": 0,
  "bot_username": "Sn_Influencers_bot",
  "allowed_updates": ["message"]
}
```

---

## ⚠️ ВАЖНО: Stripe Webhook Secret

### Как получить STRIPE_WEBHOOK_SECRET:

1. Открой [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Если webhook уже существует:
   - Найди webhook с URL `https://admarket-neon.vercel.app/api/stripe/webhook`
   - Нажми на него → **Reveal** signing secret
   - Скопируй (начинается с `whsec_...`)
3. Если webhook НЕ существует:
   - Нажми **"Add endpoint"**
   - URL: `https://admarket-neon.vercel.app/api/stripe/webhook`
   - Description: `AdMarket Production Webhook`
   - Events to send (выбери все):
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
     - ✅ `transfer.created`
     - ✅ `transfer.updated`
     - ✅ `account.updated`
   - Нажми **"Add endpoint"**
   - Скопируй **Signing secret**

---

## 📝 Пошаговая инструкция для Vercel

### Шаг 1: Открой Environment Variables
```
https://vercel.com/[твой-username]/[твой-project]/settings/environment-variables
```

### Шаг 2: Добавь каждую переменную
1. Нажми **"Add New"**
2. **Key**: `STRIPE_SECRET_KEY`
3. **Value**: `sk_test_51SR61N...` (скопируй из списка выше)
4. **Environments**: Выбери ВСЕ (Production + Preview + Development)
5. Нажми **"Save"**
6. Повтори для всех переменных

### Шаг 3: Проверь список
После добавления у тебя должно быть **9 переменных**:
- ✅ STRIPE_SECRET_KEY
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ TELEGRAM_BOT_TOKEN
- ✅ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
- ✅ NEXT_PUBLIC_APP_URL
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ (любые другие существующие переменные)

### Шаг 4: Дождись автоматического редеплоя
После добавления переменных Vercel автоматически запустит новый deploy.

Или можешь вручную:
1. Перейди в **Deployments**
2. Найди последний deploy → три точки → **Redeploy**

---

## 🧪 Проверка после деплоя

### 1. Проверь API Health
```bash
curl https://admarket-neon.vercel.app/api/health
```

Должен вернуть: `{"status":"ok"}`

### 2. Проверь Telegram Bot
Отправь боту @Sn_Influencers_bot команду:
```
/start
```

Бот должен ответить (если webhook работает)

### 3. Проверь Stripe Integration
1. Залогинься на сайт
2. Создай Channel
3. Нажми "Connect Stripe Account"
4. Должна открыться форма Stripe Express Onboarding

### 4. Проверь Admin Panel
```
https://admarket-neon.vercel.app/dashboard/admin
```

Если видишь 403 → не забудь создать admin-пользователя в Supabase:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'твой@email.com';
```

---

## 🐛 Troubleshooting

### Проблема: "STRIPE_SECRET_KEY is not set"
**Причина**: Переменные не добавлены или не применились

**Решение**:
1. Проверь в Vercel → Settings → Environment Variables
2. Убедись, что выбраны ВСЕ окружения
3. Redeploy проект

---

### Проблема: "Webhook signature verification failed"
**Причина**: Неверный `STRIPE_WEBHOOK_SECRET`

**Решение**:
1. Stripe Dashboard → Webhooks
2. Reveal signing secret
3. Скопируй заново
4. Обнови в Vercel
5. Redeploy

---

### Проблема: Telegram бот не отвечает
**Причина**: Webhook не доходит до сервера

**Решение**:
1. Проверь логи Vercel → Functions → `/api/telegram/webhook`
2. Переустанови webhook:
```bash
curl -X POST "https://api.telegram.org/bot8424433192:AAHm8Oc6Tu-AhhGYDGWQU6j3cej4k4ygxek/deleteWebhook"
curl -X POST "https://api.telegram.org/bot8424433192:AAHm8Oc6Tu-AhhGYDGWQU6j3cej4k4ygxek/setWebhook" \
  -d "url=https://admarket-neon.vercel.app/api/telegram/webhook"
```

---

### Проблема: Admin Panel 403 Forbidden
**Причина**: У пользователя нет роли admin

**Решение**:
```sql
-- Supabase SQL Editor
SELECT id, email FROM auth.users;
UPDATE public.users SET role = 'admin' WHERE id = 'ТВОЙ_UUID';
```

---

## 🎯 Следующие шаги

После добавления env vars:

1. ✅ Применить миграции в Supabase (006, 007, 008)
2. ✅ Создать admin-пользователя
3. ✅ Настроить Stripe Webhook (получить signing secret)
4. ✅ Дождаться Vercel redeploy
5. ✅ Протестировать full user flow

---

**Статус**: 🟢 Готово к деплою после добавления env vars в Vercel

**Последнее обновление**: 2025-11-23
