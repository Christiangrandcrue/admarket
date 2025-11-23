# Next Steps: Stripe Integration Launch

## 🚨 Критичные задачи (перед тестированием)

### 1. Применить Database Migration

```bash
# В Supabase Dashboard → SQL Editor
# Скопировать и выполнить:
# supabase/migrations/007_add_stripe_fields.sql
```

**Проверка**:
```sql
-- Должны появиться новые поля
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name LIKE 'stripe%';

-- Должна появиться таблица transactions
SELECT * FROM transactions LIMIT 1;
```

### 2. Настроить Stripe Dashboard

**A. Создать/активировать Stripe аккаунт**
- Зарегистрироваться на https://stripe.com
- Переключиться на **Test Mode** (toggle в верху справа)

**B. Получить API ключи**
- Dashboard → Developers → API keys
- Скопировать:
  - `Publishable key` (pk_test_...)
  - `Secret key` (sk_test_...)

**C. Включить Connect**
- Dashboard → Connect → Settings → Get started
- Тип: **Marketplace**
- Onboarding: **Express**

**D. Настроить Webhook**
- Dashboard → Developers → Webhooks → Add endpoint
- URL: `https://admarket-neon.vercel.app/api/stripe/webhook`
- Events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `transfer.created`
  - `transfer.updated`
  - `account.updated`
- Скопировать **Signing secret** (whsec_...)

### 3. Добавить Environment Variables

**В Vercel Dashboard** → Settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

**Важно**: После добавления переменных нужно **редеплоить** проект:
```bash
npm run deploy
```

### 4. Обновить NEXT_PUBLIC_APP_URL

В `.env.local` (локально) и Vercel (production):
```
NEXT_PUBLIC_APP_URL=https://admarket-neon.vercel.app
```

Эта переменная используется для:
- Return URL после Stripe onboarding
- Email links
- Webhook redirects

## ✅ Тестирование

### Тест 1: Creator Onboarding

```bash
1. Зайти на https://admarket-neon.vercel.app/auth/login
2. Войти как Creator
3. Перейти на /dashboard/creator/earnings
4. Нажать "Подключить Stripe"
5. Заполнить форму Stripe Express:
   - Business name: Test Creator
   - Phone: +7 999 123 4567
   - DOB: 01/01/1990
   - Country: Russia
6. Вернуться на сайт
7. Проверить статус: "Подключен" ✅
```

### Тест 2: Campaign Payment

```bash
1. Зайти как Advertiser
2. Создать кампанию (бюджет 10,000 RUB)
3. На странице кампании → "Оплатить"
4. Ввести карту: 4242 4242 4242 4242
5. Expiry: 12/25, CVC: 123
6. Нажать "Оплатить"
7. Проверить в Supabase:
   - campaign.payment_status = "succeeded" ✅
   - campaign.paid_at = NOW()
```

### Тест 3: Auto-Release Funds

```bash
1. Creator загружает контент для оплаченной кампании
2. Advertiser одобряет контент
3. Автоматически:
   - Transfer создаётся в Stripe ✅
   - placement.payout_status = "processing"
4. Через несколько секунд (webhook):
   - placement.payout_status = "paid" ✅
   - placement.paid_out_at = NOW()
5. Проверить в transactions таблице:
   - Новая запись с type="payout"
```

## 🐛 Troubleshooting

### Ошибка: "STRIPE_SECRET_KEY is not set"

**Причина**: Environment variables не настроены  
**Решение**: Добавить в Vercel → Settings → Environment Variables → Redeploy

### Ошибка: "No such payment_intent"

**Причина**: Используется неправильный API key (test vs live)  
**Решение**: Проверить что в `.env.local` используется `sk_test_...`

### Ошибка: "Webhook signature verification failed"

**Причина**: Неверный STRIPE_WEBHOOK_SECRET  
**Решение**: Скопировать актуальный signing secret из Stripe Dashboard

### Connected Account не активируется

**Причина**: Не завершён onboarding или не хватает данных  
**Решение**: 
- Зайти в Stripe Dashboard → Connect → Accounts
- Найти аккаунт, посмотреть требования
- Creator должен пройти полную верификацию

### Transfer fails: "Account not found"

**Причина**: Creator не завершил Stripe onboarding  
**Решение**: 
- Проверить users.stripe_account_status = "connected"
- Проверить users.stripe_charges_enabled = true
- Проверить users.stripe_payouts_enabled = true

## 📊 Мониторинг

### В Stripe Dashboard

**Payments → All payments**
- Смотрите статусы Payment Intents
- Фильтр по metadata.campaignId

**Connect → Transfers**
- Список всех выплат блогерам
- Фильтр по metadata.placementId

**Connect → Accounts**
- Все Connected Accounts (creators)
- Статусы верификации

### В Supabase

```sql
-- Проверить платежи
SELECT 
  c.title,
  c.total_budget,
  c.payment_status,
  c.stripe_payment_intent_id,
  c.paid_at
FROM campaigns c
WHERE c.payment_status != 'not_paid'
ORDER BY c.created_at DESC;

-- Проверить выплаты
SELECT 
  p.id,
  p.budget,
  p.payout_status,
  p.payout_amount,
  p.stripe_transfer_id,
  p.paid_out_at
FROM placements p
WHERE p.payout_status IN ('processing', 'paid')
ORDER BY p.updated_at DESC;

-- История транзакций
SELECT 
  t.type,
  t.amount,
  t.status,
  t.stripe_id,
  t.created_at,
  u.name as user_name
FROM transactions t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 20;
```

### Webhooks Logs

**Stripe Dashboard → Developers → Webhooks → Your endpoint**
- Смотрите успешные/неуспешные webhooks
- Проверяйте response codes (200 = OK)
- Retry failed webhooks вручную

## 🚀 Production Checklist

- [ ] Применена Migration 007 в production Supabase
- [ ] Stripe переключён на Live Mode
- [ ] API keys заменены на live (pk_live_..., sk_live_...)
- [ ] Webhook настроен на production URL
- [ ] Environment variables обновлены в Vercel
- [ ] NEXT_PUBLIC_APP_URL указывает на production
- [ ] Протестирован полный flow на production
- [ ] Bank account настроен для platform payouts
- [ ] Email уведомления настроены в Stripe
- [ ] 3D Secure включён (Settings → Payment methods)

## 📈 Метрики для отслеживания

После запуска мониторьте:

**Business Metrics**:
- Total GMV (Gross Merchandise Value)
- Platform revenue (10% fees)
- Average campaign size
- Creator payout success rate
- Payment failure rate

**Technical Metrics**:
- Webhook success rate (должно быть >99%)
- Average payout time (trigger to paid)
- Failed transfers (should be <1%)
- Connected account onboarding completion rate

## 🔗 Полезные ссылки

- [STRIPE_SETUP.md](./STRIPE_SETUP.md) — Детальный setup guide
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Connect Express Docs](https://stripe.com/docs/connect/express-accounts)
- [Webhook Events](https://stripe.com/docs/api/events/types)

---

**Дата**: 2025-11-23  
**Статус**: Ready for testing  
**Следующий milestone**: Real Analytics Events
