-- Reviews & Ratings Schema for AdMarket

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
-- Хранит отзывы о сотрудничестве (рекламодатель → блогер или блогер → рекламодатель)

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Связь с размещением
  placement_id UUID NOT NULL,
  
  -- Кто оставил отзыв
  reviewer_id UUID NOT NULL,           -- ID пользователя, оставившего отзыв
  reviewer_type TEXT NOT NULL CHECK (reviewer_type IN ('advertiser', 'creator')),
  
  -- Кто получил отзыв
  reviewee_id UUID NOT NULL,           -- ID пользователя, получившего отзыв
  reviewee_type TEXT NOT NULL CHECK (reviewee_type IN ('advertiser', 'creator')),
  
  -- Рейтинги (1-5 звёзд)
  overall_rating INT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5),
  professionalism_rating INT CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  timeliness_rating INT CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  
  -- Текст отзыва
  comment TEXT,
  
  -- Рекомендация
  would_work_again BOOLEAN DEFAULT true,
  
  -- Модерация
  is_approved BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  moderation_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign keys
  FOREIGN KEY (placement_id) REFERENCES placements(id) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT unique_review_per_placement UNIQUE (placement_id, reviewer_id),
  CONSTRAINT reviewer_not_reviewee CHECK (reviewer_id != reviewee_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_placement ON reviews(placement_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- ============================================================================
-- AGGREGATED RATINGS TABLE
-- ============================================================================
-- Агрегированные рейтинги пользователей (для быстрого доступа)

CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Пользователь
  user_id UUID NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('advertiser', 'creator')),
  
  -- Агрегированные рейтинги
  overall_rating DECIMAL(3, 2) DEFAULT 0.00,
  communication_rating DECIMAL(3, 2) DEFAULT 0.00,
  quality_rating DECIMAL(3, 2) DEFAULT 0.00,
  professionalism_rating DECIMAL(3, 2) DEFAULT 0.00,
  timeliness_rating DECIMAL(3, 2) DEFAULT 0.00,
  
  -- Статистика
  total_reviews INT DEFAULT 0,
  positive_reviews INT DEFAULT 0,      -- Рейтинг >= 4
  neutral_reviews INT DEFAULT 0,       -- Рейтинг = 3
  negative_reviews INT DEFAULT 0,      -- Рейтинг <= 2
  
  -- Рекомендации
  would_work_again_count INT DEFAULT 0,
  would_work_again_percentage DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Последний отзыв
  last_review_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_overall ON user_ratings(overall_rating DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update user_ratings when new review is approved
CREATE OR REPLACE FUNCTION update_user_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if review is approved
  IF NEW.is_approved = true THEN
    -- Insert or update user_ratings
    INSERT INTO user_ratings (
      user_id,
      user_type,
      overall_rating,
      communication_rating,
      quality_rating,
      professionalism_rating,
      timeliness_rating,
      total_reviews,
      positive_reviews,
      neutral_reviews,
      negative_reviews,
      would_work_again_count,
      would_work_again_percentage,
      last_review_at,
      updated_at
    )
    SELECT
      NEW.reviewee_id,
      NEW.reviewee_type,
      ROUND(AVG(overall_rating)::numeric, 2),
      ROUND(AVG(communication_rating)::numeric, 2),
      ROUND(AVG(quality_rating)::numeric, 2),
      ROUND(AVG(professionalism_rating)::numeric, 2),
      ROUND(AVG(timeliness_rating)::numeric, 2),
      COUNT(*),
      COUNT(*) FILTER (WHERE overall_rating >= 4),
      COUNT(*) FILTER (WHERE overall_rating = 3),
      COUNT(*) FILTER (WHERE overall_rating <= 2),
      COUNT(*) FILTER (WHERE would_work_again = true),
      ROUND((COUNT(*) FILTER (WHERE would_work_again = true)::decimal / COUNT(*)) * 100, 2),
      MAX(created_at),
      NOW()
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id
      AND is_approved = true
    ON CONFLICT (user_id)
    DO UPDATE SET
      overall_rating = EXCLUDED.overall_rating,
      communication_rating = EXCLUDED.communication_rating,
      quality_rating = EXCLUDED.quality_rating,
      professionalism_rating = EXCLUDED.professionalism_rating,
      timeliness_rating = EXCLUDED.timeliness_rating,
      total_reviews = EXCLUDED.total_reviews,
      positive_reviews = EXCLUDED.positive_reviews,
      neutral_reviews = EXCLUDED.neutral_reviews,
      negative_reviews = EXCLUDED.negative_reviews,
      would_work_again_count = EXCLUDED.would_work_again_count,
      would_work_again_percentage = EXCLUDED.would_work_again_percentage,
      last_review_at = EXCLUDED.last_review_at,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_ratings
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  WHEN (NEW.is_approved = true)
  EXECUTE FUNCTION update_user_ratings();

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Reviews: Users can view approved reviews
CREATE POLICY reviews_select_approved_policy ON reviews
  FOR SELECT
  USING (is_approved = true);

-- Reviews: Users can view their own reviews (approved or not)
CREATE POLICY reviews_select_own_policy ON reviews
  FOR SELECT
  USING (
    auth.uid() = reviewer_id OR 
    auth.uid() = reviewee_id
  );

-- Reviews: Users can create reviews for completed placements
CREATE POLICY reviews_insert_policy ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM placements
      WHERE placements.id = placement_id
      AND placements.status = 'approved'
      AND (
        (placements.advertiser_id = auth.uid() AND reviewer_type = 'advertiser') OR
        (EXISTS (
          SELECT 1 FROM channels
          WHERE channels.id = placements.channel_id
          AND channels.owner_user_id = auth.uid()
          AND reviewer_type = 'creator'
        ))
      )
    )
  );

-- Reviews: Users can update their own reviews (before approval)
CREATE POLICY reviews_update_policy ON reviews
  FOR UPDATE
  USING (
    auth.uid() = reviewer_id AND
    is_approved = false
  );

-- User ratings: Everyone can view
CREATE POLICY user_ratings_select_policy ON user_ratings
  FOR SELECT
  USING (true);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Note: Reviews can only be created for approved placements
-- Example review:
-- INSERT INTO reviews (
--   placement_id,
--   reviewer_id,
--   reviewer_type,
--   reviewee_id,
--   reviewee_type,
--   overall_rating,
--   communication_rating,
--   quality_rating,
--   professionalism_rating,
--   timeliness_rating,
--   comment,
--   would_work_again,
--   is_approved
-- ) VALUES (
--   'placement-id',
--   'advertiser-user-id',
--   'advertiser',
--   'creator-user-id',
--   'creator',
--   5,
--   5,
--   5,
--   5,
--   4,
--   'Отличный блогер! Контент создан качественно и вовремя.',
--   true,
--   true
-- );

-- ============================================================================
-- USEFUL QUERIES
-- ============================================================================

-- Get reviews for a user with placement details:
-- SELECT 
--   r.*,
--   p.campaign_id,
--   c.name as campaign_name,
--   ch.blogger_name,
--   ch.platform
-- FROM reviews r
-- JOIN placements p ON p.id = r.placement_id
-- JOIN campaigns c ON c.id = p.campaign_id
-- JOIN channels ch ON ch.id = p.channel_id
-- WHERE r.reviewee_id = 'user-id'
-- AND r.is_approved = true
-- ORDER BY r.created_at DESC;

-- Get user rating summary:
-- SELECT * FROM user_ratings WHERE user_id = 'user-id';

-- Get distribution of ratings:
-- SELECT 
--   overall_rating,
--   COUNT(*) as count,
--   ROUND(COUNT(*)::decimal / (SELECT COUNT(*) FROM reviews WHERE reviewee_id = 'user-id' AND is_approved = true) * 100, 2) as percentage
-- FROM reviews
-- WHERE reviewee_id = 'user-id'
-- AND is_approved = true
-- GROUP BY overall_rating
-- ORDER BY overall_rating DESC;
