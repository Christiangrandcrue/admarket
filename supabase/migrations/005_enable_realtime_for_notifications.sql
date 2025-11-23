-- ============================================
-- ENABLE REALTIME FOR NOTIFICATIONS
-- ============================================
-- Enable Supabase Realtime subscriptions for notifications table

-- Enable realtime publication for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Grant SELECT permission on notifications table for authenticated users
-- This is required for Realtime subscriptions to work
GRANT SELECT ON public.notifications TO authenticated;

-- Comment
COMMENT ON TABLE public.notifications IS 'In-app notifications with Realtime subscriptions enabled';
