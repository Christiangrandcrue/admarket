SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'channels' 
AND table_schema = 'public'
ORDER BY ordinal_position;
