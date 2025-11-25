-- Add blogger-related fields to channels table
ALTER TABLE public.channels
ADD COLUMN IF NOT EXISTS blogger_name TEXT,
ADD COLUMN IF NOT EXISTS blogger_avatar TEXT,
ADD COLUMN IF NOT EXISTS blogger_bio TEXT,
ADD COLUMN IF NOT EXISTS case_studies JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));

-- Create index for moderation_status for faster queries
CREATE INDEX IF NOT EXISTS idx_channels_moderation_status ON public.channels(moderation_status);

-- Comment columns for documentation
COMMENT ON COLUMN public.channels.blogger_name IS 'Full name of the blogger/influencer';
COMMENT ON COLUMN public.channels.blogger_avatar IS 'URL to blogger profile photo';
COMMENT ON COLUMN public.channels.blogger_bio IS 'Short bio/description of the blogger';
COMMENT ON COLUMN public.channels.case_studies IS 'Array of case study objects with client, results, etc.';
COMMENT ON COLUMN public.channels.moderation_status IS 'Moderation status: pending, approved, or rejected';
