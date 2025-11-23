# 🗄️ Применение миграций в Supabase — Пошаговая инструкция

**Исправлена ошибка с `...` — теперь полные SQL-скрипты готовы к копипасте**

---

## ⚡ Быстрый старт

Открой [Supabase SQL Editor](https://supabase.com/dashboard/project/visoxfhymssvunyazgsl/sql/new)

Выполни **3 миграции по очереди**:

---

## 📝 MIGRATION 006: Telegram Integration

### Шаг 1: Открой файл `MIGRATION_006_FULL.sql` в проекте

### Шаг 2: Скопируй ВЕСЬ текст из файла

### Шаг 3: Вставь в Supabase SQL Editor → RUN

### Проверка:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%telegram%';
```

**Должно вернуть:**
- `update_user_telegram`
- `get_user_telegram_chat_id`
- `disconnect_user_telegram`

---

## 💳 MIGRATION 007: Stripe Connect Fields

### Шаг 1: Открой файл `MIGRATION_007_FULL.sql`

### Шаг 2: Скопируй ВЕСЬ текст → вставь в SQL Editor → RUN

### Проверка:
```sql
-- Проверь новые колонки в users
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name LIKE 'stripe%';

-- Проверь таблицу transactions
SELECT * FROM information_schema.tables 
WHERE table_name = 'transactions';
```

**Должно вернуть:**
- `stripe_account_id`, `stripe_account_status`, `stripe_charges_enabled`, `stripe_payouts_enabled`
- Таблица `transactions` существует

---

## 👨‍💼 MIGRATION 008: Admin Panel Features

### Шаг 1: Открой файл `MIGRATION_008_FULL.sql`

### Шаг 2: Скопируй ВЕСЬ текст → вставь в SQL Editor → RUN

### Проверка:
```sql
-- Проверь новые таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('flags', 'audit_logs', 'platform_settings');

-- Проверь platform_settings заполнены
SELECT key, value FROM platform_settings;
```

**Должно вернуть:**
- 3 таблицы: `flags`, `audit_logs`, `platform_settings`
- 8 дефолтных настроек (platform_fee_percentage, min_campaign_budget, etc.)

---

## 👑 Создать Admin-пользователя

После применения всех 3 миграций:

```sql
-- 1. Найди свой user_id
SELECT id, email FROM auth.users;

-- 2. Скопируй свой UUID из результата

-- 3. Назначь себе роль admin (ЗАМЕНИ на свой UUID)
UPDATE public.users 
SET role = 'admin' 
WHERE id = 'ТВОЙ_UUID_СЮДА';

-- 4. Проверка
SELECT id, email, role FROM public.users WHERE role = 'admin';
```

**После этого ты сможешь зайти в:**
```
https://admarket-neon.vercel.app/dashboard/admin
```

---

## ✅ Финальная проверка

После применения ВСЕХ миграций выполни:

```sql
-- Проверь Telegram функции (должно быть 3)
SELECT count(*) FROM information_schema.routines 
WHERE routine_name LIKE '%telegram%';

-- Проверь Stripe поля (должно быть 5)
SELECT count(*) FROM information_schema.columns 
WHERE table_name = 'users' AND column_name LIKE 'stripe%';

-- Проверь Admin таблицы (должно быть 3)
SELECT count(*) FROM information_schema.tables 
WHERE table_name IN ('flags', 'audit_logs', 'platform_settings');

-- Проверь Admin пользователя (должен быть 1)
SELECT count(*) FROM public.users WHERE role = 'admin';
```

**Ожидаемые результаты:**
- Telegram функций: **3**
- Stripe полей: **5**
- Admin таблиц: **3**
- Admin пользователей: **1** (ты)

---

## 🐛 Если возникла ошибка

### "syntax error at or near ..."
**Причина**: Скопирован не полный SQL или с ошибками

**Решение**:
1. Открой файл `MIGRATION_00X_FULL.sql` в проекте
2. Скопируй **ВЕСЬ** текст (Ctrl+A → Ctrl+C)
3. Вставь в SQL Editor
4. Нажми RUN

---

### "relation already exists"
**Причина**: Таблица/колонка уже существует (миграция запущена повторно)

**Решение**: Это нормально, миграции используют `IF NOT EXISTS` и `ADD COLUMN IF NOT EXISTS`. Можно игнорировать или удалить дубликаты.

---

### "function already exists with same argument types"
**Причина**: Функция уже создана

**Решение**: Это нормально, используется `CREATE OR REPLACE FUNCTION`. Старая версия будет заменена.

---

### "permission denied"
**Причина**: Недостаточно прав для создания функций

**Решение**: Убедись, что используешь **Supabase Dashboard SQL Editor**, а не прямое подключение к БД.

---

## 🎯 Следующие шаги после миграций

1. ✅ Миграции применены
2. ✅ Admin-пользователь создан
3. ⏳ Добавить env vars в Vercel (STRIPE, TELEGRAM)
4. ⏳ Настроить Stripe Webhook
5. ⏳ Дождаться Vercel redeploy
6. ⏳ Протестировать full user flow

---

**Вопросы?** Пиши мне, помогу разобраться!

**Статус**: 🟢 Миграции готовы к применению
