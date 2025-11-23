# 🔧 Исправление Email Confirmation URL

## Проблема:
Supabase отправляет email с ссылкой на `localhost` вместо production URL (`https://admarket-neon.vercel.app`)

---

## ✅ Решение 1: Настроить Site URL в Supabase (РЕКОМЕНДУЮ)

1. Открой [Supabase Dashboard](https://supabase.com/dashboard/project/visoxfhymssvunyazgsl/auth/url-configuration)
2. Перейди в **Authentication** → **URL Configuration**
3. Найди **Site URL**
4. Измени на: `https://admarket-neon.vercel.app`
5. Сохрани

**После этого** новые письма будут идти на правильный URL.

---

## ✅ Решение 2: Подтвердить email вручную в Supabase Dashboard

Поскольку письмо уже отправлено с неправильной ссылкой:

1. Открой [Supabase Users](https://supabase.com/dashboard/project/visoxfhymssvunyazgsl/auth/users)
2. Найди своего пользователя (по email)
3. Нажми на него → **три точки** → **Confirm email**
4. Email станет подтверждённым вручную

---

## ✅ Решение 3: Назначить admin роль БЕЗ подтверждения email

Email confirmation не обязателен для назначения admin роли. Просто выполни:

```sql
-- 1. Найди свой UUID
SELECT id, email, email_confirmed_at FROM auth.users;

-- 2. Назначь роль admin (ЗАМЕНИ UUID)
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'твой@email.com';  -- Или WHERE id = 'твой-uuid'

-- 3. Проверка
SELECT u.id, u.email, u.role, au.email_confirmed_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'admin';
```

**Email confirmation не блокирует admin роль!**

---

## 🎯 Рекомендация:

Используй **Решение 2** (подтверди email вручную) + **Решение 3** (назначь admin роль).

Так у тебя будет:
- ✅ Подтверждённый email
- ✅ Admin роль
- ✅ Доступ в Admin Panel

---

## 📋 После исправления:

1. Подтверди email в Supabase Dashboard (Решение 2)
2. Выполни UPDATE role = 'admin' (Решение 3)
3. Зайди на `https://admarket-neon.vercel.app/dashboard/admin`

---

**Что делаешь?** 👇
