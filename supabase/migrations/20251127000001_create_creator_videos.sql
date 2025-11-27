-- Create creator_videos table for storing generated video history
CREATE TABLE IF NOT EXISTS creator_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Video metadata
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL, -- Original prompt used for generation
  style TEXT, -- e.g., 'cinematic', 'dynamic', 'minimal'
  duration INTEGER, -- Duration in seconds (5 or 10)
  
  -- TurboBoost task info
  task_id TEXT, -- TurboBoost task ID for tracking
  turboboost_video_url TEXT, -- URL from TurboBoost API
  
  -- Local storage (optional, if we store videos locally)
  local_video_url TEXT,
  thumbnail_url TEXT,
  
  -- Video stats
  file_size BIGINT, -- Size in bytes
  resolution TEXT, -- e.g., '1080x1920', '720x1280'
  format TEXT DEFAULT 'mp4',
  
  -- Generation status
  status TEXT NOT NULL DEFAULT 'generating',
  -- Status values:
  -- 'generating' - Video is being generated
  -- 'ready' - Video is ready
  -- 'failed' - Generation failed
  -- 'published' - Video has been published to channels
  
  error_message TEXT, -- Error details if status = 'failed'
  
  -- Publishing info
  published_to JSONB DEFAULT '[]'::jsonb, -- Array of {platform: 'tiktok', channel_id: 'xxx', post_url: 'xxx', published_at: 'timestamp'}
  scheduled_publish_at TIMESTAMPTZ, -- For scheduled posts
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_at TIMESTAMPTZ, -- When video generation completed
  
  -- Metadata
  tags TEXT[] DEFAULT '{}', -- Tags for categorization
  is_favorite BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0, -- View count (if tracking)
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_creator_videos_creator_id ON creator_videos(creator_id);
CREATE INDEX idx_creator_videos_status ON creator_videos(status);
CREATE INDEX idx_creator_videos_created_at ON creator_videos(created_at DESC);
CREATE INDEX idx_creator_videos_task_id ON creator_videos(task_id);
CREATE INDEX idx_creator_videos_deleted_at ON creator_videos(deleted_at) WHERE deleted_at IS NULL;

-- RLS (Row Level Security) policies
ALTER TABLE creator_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own videos
CREATE POLICY "Users can view own videos"
  ON creator_videos
  FOR SELECT
  USING (auth.uid() = creator_id);

-- Policy: Users can insert their own videos
CREATE POLICY "Users can insert own videos"
  ON creator_videos
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Policy: Users can update their own videos
CREATE POLICY "Users can update own videos"
  ON creator_videos
  FOR UPDATE
  USING (auth.uid() = creator_id);

-- Policy: Users can delete their own videos (soft delete)
CREATE POLICY "Users can delete own videos"
  ON creator_videos
  FOR DELETE
  USING (auth.uid() = creator_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_creator_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER trigger_creator_videos_updated_at
  BEFORE UPDATE ON creator_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_videos_updated_at();

-- Comment on table
COMMENT ON TABLE creator_videos IS 'Stores history of AI-generated videos for creators';
COMMENT ON COLUMN creator_videos.prompt IS 'Original user prompt/brief used for video generation';
COMMENT ON COLUMN creator_videos.published_to IS 'JSON array of platforms where video was published';
COMMENT ON COLUMN creator_videos.status IS 'Video generation/publishing status: generating, ready, failed, published';
