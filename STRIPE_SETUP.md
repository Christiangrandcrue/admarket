# Stripe Connect Setup Guide

## Обзор

AdMarket использует **Stripe Connect** для безопасных платежей с эскроу-механизмом:
- **Advertisers** → оплата кампаний (средства удерживаются до публикации)
- **Creators** → автоматические выплаты при одобрении контента
- **Platform** → 10% комиссия с каждой сделки

## Архитектура

```
Advertiser (Stripe Customer)
    ↓
Payment Intent (manual capture) → Escrow
    ↓
Content Approval
    ↓
Transfer → Creator (Connected Account)
    ↓
Platform Fee (10%) → Platform Account
```

## Настройка Stripe Dashboard

### 1. Создать Stripe аккаунт

1. Зарегистрируйтесь на [stripe.com](https://stripe.com)
2. Активируйте аккаунт (заполните бизнес-информацию)
3. Переключитесь на **Test Mode** для разработки

### 2. Получить API ключи

**Developers → API keys**

Скопируйте:
- `Publishable key` (pk_test_...) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `Secret key` (sk_test_...) → `STRIPE_SECRET_KEY`

⚠️ **ВАЖНО**: Никогда не коммитьте `STRIPE_SECRET_KEY` в git!

### 3. Включить Stripe Connect

**Connect → Settings → Get started**

1. Выберите тип платформы: **Marketplace**
2. Business model: **Two-sided marketplace**
3. Onboarding type: **Express** (быстрая верификация для блогеров)

### 4. Настроить Webhook

**Developers → Webhooks → Add endpoint**

**Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`  
(для локальной разработки используйте Stripe CLI или ngrok)

**События для подписки**:
- `payment_intent.succeeded` — оплата успешна
- `payment_intent.payment_failed` — ошибка оплаты
- `transfer.created` — начало выплаты
- `transfer.updated` — выплата завершена
- `account.updated` — обновление Connected Account

После создания скопируйте **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 5. Настроить параметры платформы

**Connect → Settings → Platform settings**

- **Branding**: Загрузите логотип AdMarket
- **Support email**: support@yourdomain.com
- **Business name**: AdMarket

## Переменные окружения

Создайте `.env.local`:

```bash
# Stripe Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL (для редиректов после onboarding)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Применить миграцию БД

```bash
# В Supabase Dashboard → SQL Editor
# Выполните файл: supabase/migrations/007_add_stripe_fields.sql
```

Миграция добавит:
- Stripe поля в таблицы `users`, `campaigns`, `placements`
- Новую таблицу `transactions` для истории платежей
- Индексы для быстрого поиска по Stripe ID

## Локальное тестирование Webhooks

### Вариант 1: Stripe CLI (рекомендуется)

```bash
# Установить Stripe CLI
brew install stripe/stripe-cli/stripe

# Войти в аккаунт
stripe login

# Переадресовать webhooks на localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Скопировать webhook secret из вывода:
# whsec_... → STRIPE_WEBHOOK_SECRET
```

### Вариант 2: ngrok

```bash
# Установить ngrok
brew install ngrok

# Запустить туннель
ngrok http 3000

# Использовать HTTPS URL в Stripe Dashboard
# https://xxxxx.ngrok.io/api/stripe/webhook
```

## Тестовые платёжные карты

Stripe предоставляет тестовые карты:

| Карта | Результат |
|-------|-----------|
| `4242 4242 4242 4242` | Успешная оплата |
| `4000 0000 0000 9995` | Недостаточно средств |
| `4000 0000 0000 0002` | Отклонена |

**Любые**:
- Expiry: любая будущая дата (12/25)
- CVC: любые 3 цифры (123)
- ZIP: любой (12345)

## Flow тестирования

### 1. Creator Onboarding

```bash
1. Зайти как Creator
2. /dashboard/creator/earnings
3. Нажать "Подключить Stripe"
4. Заполнить тестовые данные в Stripe Express
5. Вернуться на сайт → статус "Подключен"
```

**Тестовые данные для Express Onboarding**:
- Business name: Test Creator
- Phone: +7 999 123 4567
- DOB: 01/01/1990
- Address: Moscow, Russia

### 2. Campaign Payment

```bash
1. Зайти как Advertiser
2. Создать кампанию с бюджетом 10,000 RUB
3. На странице кампании → "Оплатить"
4. Ввести тестовую карту 4242 4242 4242 4242
5. Payment Intent создан → статус "processing"
6. Webhook получен → статус "succeeded"
```

### 3. Content Approval → Payout

```bash
1. Creator загружает контент
2. Advertiser одобряет контент
3. Автоматически:
   - releaseFundsForPlacement() вызывается
   - Transfer создаётся в Stripe
   - Средства переводятся на Connected Account
   - Placement.payout_status = "processing"
4. Webhook transfer.updated получен:
   - Placement.payout_status = "paid"
   - Transaction запись создана
```

## Проверка статусов

### В Stripe Dashboard

**Payments → All payments**
- Ищите Payment Intents по campaign ID (metadata)

**Connect → Transfers**
- Ищите Transfers по placement ID (metadata)

**Connect → Accounts**
- Список всех Connected Accounts (creators)

### В Supabase

```sql
-- Проверить статусы платежей
SELECT id, title, payment_status, stripe_payment_intent_id 
FROM campaigns 
WHERE advertiser_id = 'user_id';

-- Проверить выплаты
SELECT id, budget, payout_status, stripe_transfer_id 
FROM placements 
WHERE payout_status != 'pending';

-- История транзакций
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

## Troubleshooting

### ❌ "No such payment_intent"

**Причина**: Payment Intent не найден в Stripe  
**Решение**: Проверьте что используете правильный API key (test vs live)

### ❌ "Account not found"

**Причина**: Creator не завершил onboarding  
**Решение**: Creator должен пройти полную верификацию в Stripe Express

### ❌ "Insufficient funds"

**Причина**: Тестовая карта заблокирована  
**Решение**: Используйте `4242 4242 4242 4242`

### ❌ "Webhook signature verification failed"

**Причина**: Неверный `STRIPE_WEBHOOK_SECRET`  
**Решение**: Скопируйте актуальный signing secret из Dashboard

### ❌ "Transfer failed"

**Причина**: Connected Account не активен  
**Решение**: Проверьте `charges_enabled` и `payouts_enabled` в статусе аккаунта

## Production Checklist

- [ ] Переключить Stripe на Live Mode
- [ ] Обновить API keys (pk_live_..., sk_live_...)
- [ ] Настроить Production webhook endpoint
- [ ] Обновить `NEXT_PUBLIC_APP_URL` на production domain
- [ ] Применить миграцию 007 в production Supabase
- [ ] Настроить bank account для Platform payouts
- [ ] Включить 3D Secure для карт (Settings → Payment methods)
- [ ] Настроить email уведомления в Stripe Dashboard
- [ ] Протестировать полный flow на staging

## Стоимость Stripe

**Connect (Express)**:
- 2.9% + ₽30 за успешную транзакцию (Россия)
- Нет ежемесячной платы
- Нет платы за onboarding

**Важно**: Эти комиссии **Stripe** берёт сверху. Наша комиссия платформы (10%) — отдельно.

Пример:
- Бюджет размещения: 10,000 RUB
- Advertiser платит: 10,000 RUB
- Stripe комиссия: ~320 RUB (3.2%)
- Платформа получает: 1,000 RUB (10%)
- Creator получает: 9,000 RUB

## Полезные ссылки

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Express Accounts](https://stripe.com/docs/connect/express-accounts)
- [Testing](https://stripe.com/docs/testing)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

**Дата создания**: 2025-11-23  
**Версия Stripe API**: 2024-11-20.acacia
