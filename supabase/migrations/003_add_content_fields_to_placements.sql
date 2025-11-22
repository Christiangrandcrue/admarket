-- Add content-related fields to placements table
-- Migration: 003_add_content_fields_to_placements
-- Date: 2025-01-22

-- Add content_url for storing uploaded content link
ALTER TABLE public.placements
ADD COLUMN IF NOT EXISTS content_url TEXT;

-- Add content_description for creator notes about the content
ALTER TABLE public.placements
ADD COLUMN IF NOT EXISTS content_description TEXT;

-- Add content_status for tracking content review state
-- null = no content uploaded yet
-- pending_review = content uploaded, waiting for advertiser review
-- approved = advertiser approved the content
-- revision_requested = advertiser requested changes
ALTER TABLE public.placements
ADD COLUMN IF NOT EXISTS content_status TEXT CHECK (
  content_status IS NULL OR 
  content_status IN ('pending_review', 'approved', 'revision_requested')
);

-- Add content_uploaded_at timestamp
ALTER TABLE public.placements
ADD COLUMN IF NOT EXISTS content_uploaded_at TIMESTAMPTZ;

-- Add content_reviewed_at timestamp
ALTER TABLE public.placements
ADD COLUMN IF NOT EXISTS content_reviewed_at TIMESTAMPTZ;

-- Add content_review_notes for advertiser feedback
ALTER TABLE public.placements
ADD COLUMN IF NOT EXISTS content_review_notes TEXT;

-- Add index for faster queries by content_status
CREATE INDEX IF NOT EXISTS idx_placements_content_status 
ON public.placements(content_status) 
WHERE content_status IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN public.placements.content_url IS 'URL to uploaded content (video, image, or external link)';
COMMENT ON COLUMN public.placements.content_description IS 'Creator description/notes about the uploaded content';
COMMENT ON COLUMN public.placements.content_status IS 'Review status: pending_review, approved, revision_requested';
COMMENT ON COLUMN public.placements.content_uploaded_at IS 'Timestamp when content was uploaded by creator';
COMMENT ON COLUMN public.placements.content_reviewed_at IS 'Timestamp when content was reviewed by advertiser';
COMMENT ON COLUMN public.placements.content_review_notes IS 'Advertiser feedback/notes on the content';
