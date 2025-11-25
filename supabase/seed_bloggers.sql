-- Delete old test channels first
DELETE FROM public.channels WHERE owner_user_id = 'bf91c23b-7b52-4870-82f7-ba9ad852b49e';

-- Insert blogger profiles with random photos from UI Avatars (text-based avatars)
-- These will be replaced with real photos via randomuser.me in the UI

-- 1. Мария - Здоровье и Фитнес
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  '@health_guru',
  'Здоровье и Фитнес',
  'Практикующий нутрициолог с медицинским образованием. Доказательная медицина, ЗОЖ без фанатизма. 5 лет в профессии.',
  ARRAY['Здоровье', 'Фитнес', 'Питание'],
  'Мария Соколова',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'Нутрициолог • Тренер • Мама двоих детей',
  '[{"client": "FitApp", "objective": "Запуск мобильного приложения", "results": {"downloads": 3500, "cpa": 85}}, {"client": "BioFood", "objective": "Продажа органических продуктов", "results": {"sales": 127, "roi": 3.2}}]'::jsonb,
  'approved',
  '{"subscribers": 52000, "avg_views": 8500, "engagement_rate": 10.3}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.7, "reviews_count": 34}'::jsonb
);

-- 2. Алексей - Бизнес Инсайты
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  '@business_insights',
  'Бизнес Инсайты',
  'Предприниматель с опытом построения трех успешных стартапов. Делюсь кейсами, аналитикой рынка и инвестициями.',
  ARRAY['Бизнес', 'Стартапы', 'Инвестиции'],
  'Алексей Волков',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'Серийный предприниматель • 3 exit • Инвестор',
  '[{"client": "StartupSchool", "objective": "Набор на курс предпринимателей", "results": {"registrations": 450, "conversion": 12.3}}]'::jsonb,
  'approved',
  '{"subscribers": 45000, "avg_views": 6800, "engagement_rate": 8.5}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.8, "reviews_count": 42}'::jsonb
);

-- 3. Екатерина - Маркетинг PRO
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['instagram'],
  '@marketing_pro',
  'Маркетинг PRO',
  'Руководитель маркетинга в IT-компании. SMM, контент-маркетинг, performance-реклама. Обучаю и консультирую.',
  ARRAY['Маркетинг', 'SMM', 'Реклама'],
  'Екатерина Новикова',
  'https://randomuser.me/api/portraits/women/65.jpg',
  'CMO в IT • Спикер • Консультант по digital',
  '[{"client": "EdTech Platform", "objective": "Увеличение узнаваемости бренда", "results": {"reach": 250000, "engagement": 18500}}]'::jsonb,
  'approved',
  '{"subscribers": 67000, "avg_views": 12500, "engagement_rate": 7.2}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.6, "reviews_count": 28}'::jsonb
);

-- 4. Дмитрий - IT и Технологии
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['youtube'],
  '@tech_insights',
  'IT и Технологии',
  'Senior разработчик и tech-евангелист. Обзоры новых технологий, карьера в IT, кодинг. Говорю просто о сложном.',
  ARRAY['IT', 'Технологии', 'Карьера', 'Программирование'],
  'Дмитрий Козлов',
  'https://randomuser.me/api/portraits/men/54.jpg',
  'Senior Developer • Tech Lead • 10+ лет в IT',
  '[{"client": "CodeSchool", "objective": "Продвижение онлайн-курсов", "results": {"enrollments": 890, "ltv": 24500}}]'::jsonb,
  'approved',
  '{"subscribers": 125000, "avg_views": 22000, "engagement_rate": 6.8}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.9, "reviews_count": 56}'::jsonb
);

-- 5. Сергей - Личные Финансы
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  '@finance_expert',
  'Личные Финансы',
  'Сертифицированный финансовый консультант. Инвестиции, накопления, пенсионное планирование. Без воды и хайпа.',
  ARRAY['Финансы', 'Инвестиции', 'Накопления'],
  'Сергей Лебедев',
  'https://randomuser.me/api/portraits/men/71.jpg',
  'CFP® • Финансовый консультант • 8 лет опыта',
  '[{"client": "InvestApp", "objective": "Привлечение новых инвесторов", "results": {"signups": 2100, "deposits": 15600000}}]'::jsonb,
  'approved',
  '{"subscribers": 89000, "avg_views": 14200, "engagement_rate": 9.1}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.8, "reviews_count": 47}'::jsonb
);

-- 6. Иван - Криптовалюты
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  '@crypto_analytics',
  'Криптовалюты и Блокчейн',
  'Криптоаналитик с 2016 года. Технический анализ, фундаментальные обзоры, DeFi. Инвестирую сам в то, о чем пишу.',
  ARRAY['Криптовалюты', 'Блокчейн', 'DeFi', 'Инвестиции'],
  'Иван Смирнов',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'Crypto Analyst • Trader • Blockchain Enthusiast',
  '[{"client": "CryptoExchange", "objective": "Увеличение торговых объемов", "results": {"new_users": 4500, "volume": 89000000}}]'::jsonb,
  'approved',
  '{"subscribers": 156000, "avg_views": 18500, "engagement_rate": 5.5}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.5, "reviews_count": 38}'::jsonb
);

-- 7. Анна - Мода и Стиль
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['instagram'],
  '@fashion_diary',
  'Мода и Стиль',
  'Стилист и имиджмейкер. Создаю образы для бизнес-леди и креативных профессионалов. Капсульные гардеробы, тренды, шоппинг.',
  ARRAY['Мода', 'Стиль', 'Шоппинг'],
  'Анна Кузнецова',
  'https://randomuser.me/api/portraits/women/79.jpg',
  'Стилист • Fashion-блогер • Основатель студии',
  '[{"client": "FashionBrand", "objective": "Запуск новой коллекции", "results": {"sales": 450, "reach": 180000}}]'::jsonb,
  'approved',
  '{"subscribers": 93000, "avg_views": 16800, "engagement_rate": 8.9}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.7, "reviews_count": 52}'::jsonb
);

-- 8. Олег - Путешествия
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['youtube'],
  '@travel_world',
  'Путешествия и Приключения',
  'Трэвел-блогер, побывавший в 67 странах. Нестандартные маршруты, лайфхаки путешественника, культура разных народов.',
  ARRAY['Путешествия', 'Туризм', 'Культура'],
  'Олег Морозов',
  'https://randomuser.me/api/portraits/men/46.jpg',
  'Travel Blogger • 67 стран • Фотограф',
  '[{"client": "TravelAgency", "objective": "Продажа туров в Грузию", "results": {"bookings": 145, "revenue": 8900000}}]'::jsonb,
  'approved',
  '{"subscribers": 78000, "avg_views": 13500, "engagement_rate": 7.8}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.6, "reviews_count": 41}'::jsonb
);

-- 9. Елена - Кулинария
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['instagram'],
  '@cooking_love',
  'Кулинария и Рецепты',
  'Шеф-повар и кулинарный блогер. Простые рецепты на каждый день, авторские блюда, секреты профессиональной кухни.',
  ARRAY['Кулинария', 'Рецепты', 'Еда'],
  'Елена Павлова',
  'https://randomuser.me/api/portraits/women/8.jpg',
  'Шеф-повар • Кулинарный блогер • Автор книги',
  '[{"client": "KitchenBrand", "objective": "Продвижение кухонной техники", "results": {"sales": 340, "engagement": 28000}}]'::jsonb,
  'approved',
  '{"subscribers": 112000, "avg_views": 19600, "engagement_rate": 9.4}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.9, "reviews_count": 63}'::jsonb
);

-- 10. Татьяна - Образование
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['telegram'],
  '@education_methods',
  'Образование и Развитие',
  'Педагог с 15-летним стажем. Современные методики обучения, развитие детей, советы родителям.',
  ARRAY['Образование', 'Педагогика', 'Развитие детей'],
  'Татьяна Егорова',
  'https://randomuser.me/api/portraits/women/27.jpg',
  'Педагог • Психолог • Автор методик',
  '[{"client": "OnlineSchool", "objective": "Набор учеников на курсы", "results": {"enrollments": 560, "retention": 87}}]'::jsonb,
  'approved',
  '{"subscribers": 54000, "avg_views": 8900, "engagement_rate": 8.7}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.8, "reviews_count": 35}'::jsonb
);

-- 11. Дарья - Лайфстайл
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['tiktok'],
  '@lifestyle_vlog',
  'Лайфстайл Влог',
  'Lifestyle-блогер из Москвы. Мода, красота, путешествия, день из жизни. Живу ярко и делюсь этим с вами!',
  ARRAY['Лайфстайл', 'Мода', 'Красота', 'Влог'],
  'Дарья Романова',
  'https://randomuser.me/api/portraits/women/90.jpg',
  'Lifestyle Blogger • Moscow • Collaboration',
  '[{"client": "BeautyBrand", "objective": "Продвижение косметики", "results": {"views": 890000, "sales": 670}}]'::jsonb,
  'approved',
  '{"subscribers": 187000, "avg_views": 45000, "engagement_rate": 12.5}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.7, "reviews_count": 58}'::jsonb
);

-- 12. Михаил - Психология
INSERT INTO public.channels (
  owner_user_id, platforms, handle, title, description, topics,
  blogger_name, blogger_avatar, blogger_bio, case_studies, moderation_status,
  metrics, audience, brand_safety, rating
) VALUES (
  'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
  ARRAY['youtube'],
  '@psychology_talks',
  'Психология и Саморазвитие',
  'Практикующий психолог. Разбираю актуальные проблемы, даю инструменты для работы над собой. Научный подход.',
  ARRAY['Психология', 'Саморазвитие', 'Отношения'],
  'Михаил Петров',
  'https://randomuser.me/api/portraits/men/83.jpg',
  'Психолог • Психотерапевт • 12 лет практики',
  '[{"client": "TherapyApp", "objective": "Привлечение пользователей", "results": {"downloads": 4200, "sessions": 18500}}]'::jsonb,
  'approved',
  '{"subscribers": 96000, "avg_views": 17800, "engagement_rate": 7.9}'::jsonb,
  '{"age": {"18-24": 15, "25-34": 45, "35-44": 25, "45+": 15}, "gender": {"male": 48, "female": 52}, "geo": {"russia": 75, "ukraine": 10, "belarus": 8, "kazakhstan": 7}}'::jsonb,
  '{"verified": true, "language": "clean", "content_rating": "family_friendly"}'::jsonb,
  '{"score": 4.8, "reviews_count": 44}'::jsonb
);
