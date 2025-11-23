-- ============================================
-- MIGRATION 006: TELEGRAM INTEGRATION
-- ============================================
-- Скопируй ВЕСЬ этот файл и вставь в Supabase SQL Editor

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
