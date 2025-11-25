-- Создание тестовых каналов для каталога (исправленная версия)
INSERT INTO channels (
  owner_user_id,
  platforms,
  handle,
  title,
  description,
  topics,
  metrics,
  audience,
  brand_safety,
  rating,
  moderation_status,
  is_featured
) VALUES 
(
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  'business_insights',
  'Бизнес Инсайты',
  'Канал о бизнесе, стартапах и инвестициях. Актуальные новости и аналитика для предпринимателей.',
  ARRAY['business', 'finance', 'startups'],
  '{"subscribers": 45000, "engagement_rate": 8.5, "avg_views": 38000, "formats": ["post", "repost", "story"], "pricing": {"post": 25000, "repost": 15000, "story": 10000}}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 30, "45+": 10}, "gender": {"male": 65, "female": 35}, "geo": {"russia": 70, "ukraine": 15, "other": 15}}'::jsonb,
  '{"safety_score": 9, "brand_risk": "low", "verified": true}'::jsonb,
  '{"overall": 4.5, "count": 23}'::jsonb,
  'approved',
  false
),
(
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  'marketing_pro',
  'Маркетинг PRO',
  'Всё о digital-маркетинге, SMM, контент-маркетинге и продвижении. Кейсы, инструменты, лайфхаки.',
  ARRAY['marketing', 'digital', 'smm'],
  '{"subscribers": 67000, "engagement_rate": 7.2, "avg_views": 52000, "formats": ["post", "repost", "native"], "pricing": {"post": 35000, "repost": 20000, "native": 50000}}'::jsonb,
  '{"age": {"18-24": 25, "25-34": 50, "35-44": 20, "45+": 5}, "gender": {"male": 55, "female": 45}, "geo": {"russia": 80, "belarus": 10, "other": 10}}'::jsonb,
  '{"safety_score": 10, "brand_risk": "low", "verified": true}'::jsonb,
  '{"overall": 4.7, "count": 45}'::jsonb,
  'approved',
  true
),
(
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  'it_tech_news',
  'IT и Технологии',
  'Новости IT-индустрии, обзоры гаджетов, программирование, стартапы. Для технически подкованной аудитории.',
  ARRAY['technology', 'it', 'programming'],
  '{"subscribers": 125000, "engagement_rate": 6.8, "avg_views": 95000, "formats": ["post", "repost", "story", "native"], "pricing": {"post": 65000, "repost": 35000, "story": 25000, "native": 100000}}'::jsonb,
  '{"age": {"18-24": 35, "25-34": 45, "35-44": 15, "45+": 5}, "gender": {"male": 75, "female": 25}, "geo": {"russia": 65, "ukraine": 15, "belarus": 10, "other": 10}}'::jsonb,
  '{"safety_score": 9, "brand_risk": "low", "verified": true}'::jsonb,
  '{"overall": 4.8, "count": 89}'::jsonb,
  'approved',
  true
),
(
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  'personal_finance',
  'Личные Финансы',
  'Как управлять деньгами, инвестировать и накапливать капитал. Практические советы по финансовой грамотности.',
  ARRAY['finance', 'investment', 'money'],
  '{"subscribers": 89000, "engagement_rate": 9.1, "avg_views": 78000, "formats": ["post", "repost", "native"], "pricing": {"post": 45000, "repost": 25000, "native": 75000}}'::jsonb,
  '{"age": {"18-24": 20, "25-34": 40, "35-44": 30, "45+": 10}, "gender": {"male": 60, "female": 40}, "geo": {"russia": 75, "ukraine": 12, "kazakhstan": 8, "other": 5}}'::jsonb,
  '{"safety_score": 10, "brand_risk": "low", "verified": true}'::jsonb,
  '{"overall": 4.6, "count": 67}'::jsonb,
  'approved',
  false
),
(
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  'health_fitness',
  'Здоровье и Фитнес',
  'Тренировки, питание, ЗОЖ. Экспертные советы тренеров и нутрициологов.',
  ARRAY['health', 'fitness', 'lifestyle'],
  '{"subscribers": 52000, "engagement_rate": 10.3, "avg_views": 47000, "formats": ["post", "story", "native"], "pricing": {"post": 28000, "story": 18000, "native": 55000}}'::jsonb,
  '{"age": {"18-24": 30, "25-34": 45, "35-44": 20, "45+": 5}, "gender": {"male": 40, "female": 60}, "geo": {"russia": 85, "belarus": 8, "other": 7}}'::jsonb,
  '{"safety_score": 10, "brand_risk": "low", "verified": true}'::jsonb,
  '{"overall": 4.9, "count": 112}'::jsonb,
  'approved',
  true
),
(
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  'crypto_news_ru',
  'Криптовалюты',
  'Новости крипторынка, анализ, обучение трейдингу. Для инвесторов в цифровые активы.',
  ARRAY['crypto', 'blockchain', 'trading'],
  '{"subscribers": 156000, "engagement_rate": 5.5, "avg_views": 112000, "formats": ["post", "repost", "native"], "pricing": {"post": 85000, "repost": 45000, "native": 150000}}'::jsonb,
  '{"age": {"18-24": 40, "25-34": 40, "35-44": 15, "45+": 5}, "gender": {"male": 80, "female": 20}, "geo": {"russia": 60, "ukraine": 15, "other": 25}}'::jsonb,
  '{"safety_score": 7, "brand_risk": "medium", "verified": true}'::jsonb,
  '{"overall": 4.3, "count": 156}'::jsonb,
  'approved',
  false
);

-- Проверка
SELECT 
  title,
  topics,
  metrics->>'subscribers' as subscribers,
  moderation_status,
  is_featured
FROM channels
ORDER BY (metrics->>'subscribers')::int DESC;
