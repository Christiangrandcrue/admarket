-- ============================================
-- ADD TELEGRAM INTEGRATION TO USERS
-- ============================================
-- Add telegram_chat_id and telegram_username to auth.users metadata
-- Since public.users may not exist, we'll store in auth.users raw_user_meta_data

-- Note: Telegram data will be stored in auth.users.raw_user_meta_data JSONB field
-- Format: { "telegram_chat_id": "123456", "telegram_username": "username", "telegram_connected_at": "2025-01-01T00:00:00Z" }

-- Create a helper function to update telegram data
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
  -- Update raw_user_meta_data with telegram info
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

-- Create a helper function to get telegram chat id
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

-- Create a helper function to disconnect telegram
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
