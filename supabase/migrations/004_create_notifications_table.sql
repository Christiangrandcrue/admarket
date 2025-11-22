-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
-- In-app notifications for user actions and updates

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User who receives the notification
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Notification type and content
  type TEXT NOT NULL CHECK (type IN (
    'placement_accepted',      -- Блогер принял заявку
    'placement_rejected',      -- Блогер отклонил заявку
    'new_placement_request',   -- Новая заявка на размещение
    'content_uploaded',        -- Блогер загрузил контент
    'content_approved',        -- Контент одобрен
    'content_revision_requested', -- Запрошены изменения контента
    'campaign_completed',      -- Кампания завершена
    'payment_received',        -- Получен платёж
    'payment_sent'             -- Отправлен платёж
  )),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities (optional, depending on notification type)
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  placement_id UUID REFERENCES public.placements(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  
  -- Action URL (where to navigate on click)
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Index for fetching user's notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON public.notifications(user_id, created_at DESC);

-- Index for unread notifications count
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications(user_id, is_read) 
WHERE is_read = false;

-- Index for notification type filtering
CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON public.notifications(type);

-- Composite index for user + type queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_type 
ON public.notifications(user_id, type, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only backend can create notifications (service role)
-- Users cannot directly create notifications
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- ============================================
-- HELPER FUNCTION: Create notification
-- ============================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_campaign_id UUID DEFAULT NULL,
  p_placement_id UUID DEFAULT NULL,
  p_channel_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    campaign_id,
    placement_id,
    channel_id,
    action_url
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_campaign_id,
    p_placement_id,
    p_channel_id,
    p_action_url
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.notifications IS 'In-app notifications for user actions and updates';
COMMENT ON COLUMN public.notifications.type IS 'Notification type determining icon and behavior';
COMMENT ON COLUMN public.notifications.action_url IS 'URL to navigate when notification is clicked';
COMMENT ON COLUMN public.notifications.is_read IS 'Whether user has read this notification';
COMMENT ON FUNCTION create_notification IS 'Helper function to create notifications from backend';
