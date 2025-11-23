-- ============================================
-- ADD TELEGRAM INTEGRATION TO USERS
-- ============================================
-- Add telegram_chat_id and telegram_username to users table

-- Add telegram fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
ADD COLUMN IF NOT EXISTS telegram_username TEXT,
ADD COLUMN IF NOT EXISTS telegram_connected_at TIMESTAMP WITH TIME ZONE;

-- Create index for fast lookup by telegram_chat_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON public.users(telegram_chat_id);

-- Add comment
COMMENT ON COLUMN public.users.telegram_chat_id IS 'Telegram chat ID for notifications';
COMMENT ON COLUMN public.users.telegram_username IS 'Telegram username (without @)';
COMMENT ON COLUMN public.users.telegram_connected_at IS 'When Telegram was connected';
