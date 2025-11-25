-- Direct Messages Schema for AdMarket

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================
-- Хранит диалоги между пользователями (рекламодатель ↔ блогер)
-- Связан с campaigns и channels для контекста общения

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  advertiser_id UUID NOT NULL,  -- ID рекламодателя
  creator_id UUID NOT NULL,     -- ID блогера (владельца канала)
  
  -- Context (optional - может быть общий диалог без контекста)
  campaign_id UUID,             -- Ссылка на кампанию (если диалог в контексте кампании)
  channel_id UUID,              -- Ссылка на канал блогера
  
  -- Metadata
  subject TEXT,                 -- Тема диалога (опционально)
  last_message_at TIMESTAMPTZ,  -- Время последнего сообщения (для сортировки)
  
  -- Read status
  unread_count_advertiser INT DEFAULT 0,  -- Количество непрочитанных сообщений для рекламодателя
  unread_count_creator INT DEFAULT 0,     -- Количество непрочитанных сообщений для блогера
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign keys
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT unique_conversation UNIQUE (advertiser_id, creator_id, campaign_id, channel_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_advertiser ON conversations(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_conversations_creator ON conversations(creator_id);
CREATE INDEX IF NOT EXISTS idx_conversations_campaign ON conversations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
-- Хранит все сообщения в диалогах

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conversation
  conversation_id UUID NOT NULL,
  
  -- Sender
  sender_id UUID NOT NULL,      -- ID отправителя
  sender_type TEXT NOT NULL CHECK (sender_type IN ('advertiser', 'creator')),
  
  -- Content
  content TEXT NOT NULL,        -- Текст сообщения
  attachments JSONB DEFAULT '[]'::jsonb,  -- Вложения (ссылки на файлы, изображения)
  
  -- Metadata
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign keys
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read) WHERE is_read = FALSE;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update conversation.last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = NOW(),
    -- Increment unread count for recipient
    unread_count_advertiser = CASE 
      WHEN NEW.sender_type = 'creator' THEN unread_count_advertiser + 1 
      ELSE unread_count_advertiser 
    END,
    unread_count_creator = CASE 
      WHEN NEW.sender_type = 'advertiser' THEN unread_count_creator + 1 
      ELSE unread_count_creator 
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Trigger: Update conversation unread count when message is marked as read
CREATE OR REPLACE FUNCTION update_conversation_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    UPDATE conversations
    SET 
      unread_count_advertiser = CASE 
        WHEN NEW.sender_type = 'creator' AND unread_count_advertiser > 0 
        THEN unread_count_advertiser - 1 
        ELSE unread_count_advertiser 
      END,
      unread_count_creator = CASE 
        WHEN NEW.sender_type = 'advertiser' AND unread_count_creator > 0 
        THEN unread_count_creator - 1 
        ELSE unread_count_creator 
      END,
      updated_at = NOW()
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_unread_count
  AFTER UPDATE ON messages
  FOR EACH ROW
  WHEN (OLD.is_read IS DISTINCT FROM NEW.is_read)
  EXECUTE FUNCTION update_conversation_unread_count();

-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view conversations they're part of
CREATE POLICY conversations_select_policy ON conversations
  FOR SELECT
  USING (
    auth.uid() = advertiser_id OR 
    auth.uid() = creator_id
  );

-- Policy: Users can create conversations
CREATE POLICY conversations_insert_policy ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() = advertiser_id OR 
    auth.uid() = creator_id
  );

-- Policy: Users can update their own conversations
CREATE POLICY conversations_update_policy ON conversations
  FOR UPDATE
  USING (
    auth.uid() = advertiser_id OR 
    auth.uid() = creator_id
  );

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in conversations they're part of
CREATE POLICY messages_select_policy ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.advertiser_id = auth.uid() OR 
        conversations.creator_id = auth.uid()
      )
    )
  );

-- Policy: Users can create messages in conversations they're part of
CREATE POLICY messages_insert_policy ON messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.advertiser_id = auth.uid() OR 
        conversations.creator_id = auth.uid()
      )
    )
  );

-- Policy: Users can update their own messages
CREATE POLICY messages_update_policy ON messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Note: Use actual user IDs from your system
-- Example conversation:
-- INSERT INTO conversations (advertiser_id, creator_id, campaign_id, channel_id, subject)
-- VALUES (
--   'bf91c23b-7b52-4870-82f7-ba9ad852b49e',  -- advertiser_id
--   'creator-user-id',                         -- creator_id
--   'campaign-id',                             -- campaign_id (optional)
--   'channel-id',                              -- channel_id (optional)
--   'Обсуждение сотрудничества'
-- );

-- ============================================================================
-- USEFUL QUERIES
-- ============================================================================

-- Get all conversations for a user with last message preview:
-- SELECT 
--   c.*,
--   m.content as last_message_content,
--   m.created_at as last_message_time
-- FROM conversations c
-- LEFT JOIN LATERAL (
--   SELECT content, created_at
--   FROM messages
--   WHERE conversation_id = c.id
--   ORDER BY created_at DESC
--   LIMIT 1
-- ) m ON true
-- WHERE c.advertiser_id = 'user-id' OR c.creator_id = 'user-id'
-- ORDER BY c.last_message_at DESC NULLS LAST;

-- Get messages for a conversation:
-- SELECT *
-- FROM messages
-- WHERE conversation_id = 'conversation-id'
-- ORDER BY created_at ASC;

-- Mark all messages as read for a user in a conversation:
-- UPDATE messages
-- SET is_read = TRUE, read_at = NOW()
-- WHERE conversation_id = 'conversation-id'
-- AND sender_id != 'current-user-id'
-- AND is_read = FALSE;
