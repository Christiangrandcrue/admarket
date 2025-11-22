-- Insert test channels
INSERT INTO public.channels (handle, title, description, platforms, topics, metrics, audience, brand_safety, rating) VALUES
(
  '@techreview_pro',
  'TechReview Pro',
  'Обзоры гаджетов и технологий. Аудитория 18-35 лет, высокий ER.',
  ARRAY['youtube', 'instagram'],
  ARRAY['tech'],
  '{"followers": 450000, "avg_views": 125000, "er": 8.5}'::jsonb,
  '{"gender": {"male": 72, "female": 28}, "age": {"13-17": 5, "18-24": 35, "25-34": 45, "35-44": 12, "45+": 3}, "geo": [{"country": "RU", "share": 65}, {"country": "UA", "share": 15}, {"country": "KZ", "share": 10}, {"country": "BY", "share": 10}]}'::jsonb,
  '{"verified": true, "last_check_at": "2025-01-15T00:00:00Z"}'::jsonb,
  '{"score": 4.9, "reviews_count": 24}'::jsonb
),
(
  '@fitlife_coach',
  'FitLife Coach',
  'Фитнес, питание, здоровый образ жизни. Женская аудитория 20-40 лет.',
  ARRAY['tiktok', 'instagram'],
  ARRAY['fitness'],
  '{"followers": 280000, "avg_views": 85000, "er": 12.3}'::jsonb,
  '{"gender": {"male": 15, "female": 85}, "age": {"13-17": 8, "18-24": 42, "25-34": 35, "35-44": 12, "45+": 3}, "geo": [{"country": "RU", "share": 70}, {"country": "UA", "share": 20}, {"country": "KZ", "share": 10}]}'::jsonb,
  '{"verified": true, "last_check_at": "2025-01-10T00:00:00Z"}'::jsonb,
  '{"score": 4.7, "reviews_count": 18}'::jsonb
),
(
  '@crypto_insider',
  'Crypto Insider',
  'Новости криптовалют, инвестиции, трейдинг. Платежеспособная аудитория.',
  ARRAY['telegram', 'vk'],
  ARRAY['business', 'tech'],
  '{"followers": 120000, "avg_views": 45000, "er": 6.8}'::jsonb,
  '{"gender": {"male": 80, "female": 20}, "age": {"13-17": 2, "18-24": 25, "25-34": 48, "35-44": 20, "45+": 5}, "geo": [{"country": "RU", "share": 60}, {"country": "UA", "share": 15}, {"country": "KZ", "share": 15}, {"country": "BY", "share": 10}]}'::jsonb,
  '{"verified": true, "last_check_at": "2025-01-12T00:00:00Z"}'::jsonb,
  '{"score": 4.8, "reviews_count": 15}'::jsonb
);
