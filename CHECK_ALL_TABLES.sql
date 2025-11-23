-- Проверка всех таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Если таблиц мало, создай остальные из schema.sql
