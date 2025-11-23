-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- User: inbe@ya.ru
-- UUID: bf91c23b-7b52-4870-82f7-ba9ad852b49e

-- Назначить роль admin
UPDATE public.users 
SET role = 'admin' 
WHERE id = 'bf91c23b-7b52-4870-82f7-ba9ad852b49e';

-- Проверка
SELECT id, email, role, created_at 
FROM public.users 
WHERE role = 'admin';

-- Дополнительная информация
SELECT 
  u.id,
  u.email,
  u.role,
  au.email_confirmed_at,
  u.created_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'admin';
