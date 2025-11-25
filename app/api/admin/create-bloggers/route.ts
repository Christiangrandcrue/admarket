import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Blogger personas with Russian names and content
const bloggers = [
  {
    platform: 'telegram',
    handle: '@health_guru',
    title: 'Здоровье и Фитнес',
    description: 'Практикующий нутрициолог с медицинским образованием. Доказательная медицина, ЗОЖ без фанатизма. 5 лет в профессии.',
    topics: ['Здоровье', 'Фитнес', 'Питание'],
    bio: 'Нутрициолог • Тренер • Мама двоих детей',
    subscribers: 52000,
    avg_views: 8500,
    er: 10.3,
    case_studies: [
      { client: 'FitApp', objective: 'Запуск мобильного приложения', results: { downloads: 3500, cpa: 85 } },
      { client: 'BioFood', objective: 'Продажа органических продуктов', results: { sales: 127, roi: 3.2 } }
    ]
  },
  {
    platform: 'telegram',
    handle: '@business_insights',
    title: 'Бизнес Инсайты',
    description: 'Предприниматель с опытом построения трех успешных стартапов. Делюсь кейсами, аналитикой рынка и инвестициями.',
    topics: ['Бизнес', 'Стартапы', 'Инвестиции'],
    bio: 'Серийный предприниматель • 3 exit • Инвестор',
    subscribers: 45000,
    avg_views: 6800,
    er: 8.5,
    case_studies: [
      { client: 'StartupSchool', objective: 'Набор на курс предпринимателей', results: { registrations: 450, conversion: 12.3 } }
    ]
  },
  {
    platform: 'instagram',
    handle: '@marketing_pro',
    title: 'Маркетинг PRO',
    description: 'Руководитель маркетинга в IT-компании. SMM, контент-маркетинг, performance-реклама. Обучаю и консультирую.',
    topics: ['Маркетинг', 'SMM', 'Реклама'],
    bio: 'CMO в IT • Спикер • Консультант по digital',
    subscribers: 67000,
    avg_views: 12500,
    er: 7.2,
    case_studies: [
      { client: 'EdTech Platform', objective: 'Увеличение узнаваемости бренда', results: { reach: 250000, engagement: 18500 } }
    ]
  },
  {
    platform: 'youtube',
    handle: '@tech_insights',
    title: 'IT и Технологии',
    description: 'Senior разработчик и tech-евангелист. Обзоры новых технологий, карьера в IT, кодинг. Говорю просто о сложном.',
    topics: ['IT', 'Технологии', 'Карьера', 'Программирование'],
    bio: 'Senior Developer • Tech Lead • 10+ лет в IT',
    subscribers: 125000,
    avg_views: 22000,
    er: 6.8,
    case_studies: [
      { client: 'CodeSchool', objective: 'Продвижение онлайн-курсов', results: { enrollments: 890, ltv: 24500 } }
    ]
  },
  {
    platform: 'telegram',
    handle: '@finance_expert',
    title: 'Личные Финансы',
    description: 'Сертифицированный финансовый консультант. Инвестиции, накопления, пенсионное планирование. Без воды и хайпа.',
    topics: ['Финансы', 'Инвестиции', 'Накопления'],
    bio: 'CFP® • Финансовый консультант • 8 лет опыта',
    subscribers: 89000,
    avg_views: 14200,
    er: 9.1,
    case_studies: [
      { client: 'InvestApp', objective: 'Привлечение новых инвесторов', results: { signups: 2100, deposits: 15600000 } }
    ]
  },
  {
    platform: 'telegram',
    handle: '@crypto_analytics',
    title: 'Криптовалюты и Блокчейн',
    description: 'Криптоаналитик с 2016 года. Технический анализ, фундаментальные обзоры, DeFi. Инвестирую сам в то, о чем пишу.',
    topics: ['Криптовалюты', 'Блокчейн', 'DeFi', 'Инвестиции'],
    bio: 'Crypto Analyst • Trader • Blockchain Enthusiast',
    subscribers: 156000,
    avg_views: 18500,
    er: 5.5,
    case_studies: [
      { client: 'CryptoExchange', objective: 'Увеличение торговых объемов', results: { new_users: 4500, volume: 89000000 } }
    ]
  },
  {
    platform: 'instagram',
    handle: '@fashion_diary',
    title: 'Мода и Стиль',
    description: 'Стилист и имиджмейкер. Создаю образы для бизнес-леди и креативных профессионалов. Капсульные гардеробы, тренды, шоппинг.',
    topics: ['Мода', 'Стиль', 'Шоппинг'],
    bio: 'Стилист • Fashion-блогер • Основатель студии',
    subscribers: 93000,
    avg_views: 16800,
    er: 8.9,
    case_studies: [
      { client: 'FashionBrand', objective: 'Запуск новой коллекции', results: { sales: 450, reach: 180000 } }
    ]
  },
  {
    platform: 'youtube',
    handle: '@travel_world',
    title: 'Путешествия и Приключения',
    description: 'Трэвел-блогер, побывавший в 67 странах. Нестандартные маршруты, лайфхаки путешественника, культура разных народов.',
    topics: ['Путешествия', 'Туризм', 'Культура'],
    bio: 'Travel Blogger • 67 стран • Фотограф',
    subscribers: 78000,
    avg_views: 13500,
    er: 7.8,
    case_studies: [
      { client: 'TravelAgency', objective: 'Продажа туров в Грузию', results: { bookings: 145, revenue: 8900000 } }
    ]
  },
  {
    platform: 'instagram',
    handle: '@cooking_love',
    title: 'Кулинария и Рецепты',
    description: 'Шеф-повар и кулинарный блогер. Простые рецепты на каждый день, авторские блюда, секреты профессиональной кухни.',
    topics: ['Кулинария', 'Рецепты', 'Еда'],
    bio: 'Шеф-повар • Кулинарный блогер • Автор книги',
    subscribers: 112000,
    avg_views: 19600,
    er: 9.4,
    case_studies: [
      { client: 'KitchenBrand', objective: 'Продвижение кухонной техники', results: { sales: 340, engagement: 28000 } }
    ]
  },
  {
    platform: 'telegram',
    handle: '@education_methods',
    title: 'Образование и Развитие',
    description: 'Педагог с 15-летним стажем. Современные методики обучения, развитие детей, советы родителям.',
    topics: ['Образование', 'Педагогика', 'Развитие детей'],
    bio: 'Педагог • Психолог • Автор методик',
    subscribers: 54000,
    avg_views: 8900,
    er: 8.7,
    case_studies: [
      { client: 'OnlineSchool', objective: 'Набор учеников на курсы', results: { enrollments: 560, retention: 87 } }
    ]
  },
  {
    platform: 'tiktok',
    handle: '@lifestyle_vlog',
    title: 'Лайфстайл Влог',
    description: 'Lifestyle-блогер из Москвы. Мода, красота, путешествия, день из жизни. Живу ярко и делюсь этим с вами!',
    topics: ['Лайфстайл', 'Мода', 'Красота', 'Влог'],
    bio: 'Lifestyle Blogger • Moscow • Collaboration',
    subscribers: 187000,
    avg_views: 45000,
    er: 12.5,
    case_studies: [
      { client: 'BeautyBrand', objective: 'Продвижение косметики', results: { views: 890000, sales: 670 } }
    ]
  },
  {
    platform: 'youtube',
    handle: '@psychology_talks',
    title: 'Психология и Саморазвитие',
    description: 'Практикующий психолог. Разбираю актуальные проблемы, даю инструменты для работы над собой. Научный подход.',
    topics: ['Психология', 'Саморазвитие', 'Отношения'],
    bio: 'Психолог • Психотерапевт • 12 лет практики',
    subscribers: 96000,
    avg_views: 17800,
    er: 7.9,
    case_studies: [
      { client: 'TherapyApp', objective: 'Привлечение пользователей', results: { downloads: 4200, sessions: 18500 } }
    ]
  }
]

export async function GET() {
  try {
    // Get random user photos from randomuser.me
    const randomUsersResponse = await fetch(
      `https://randomuser.me/api/?results=${bloggers.length}&nat=us,gb,au&inc=name,picture`
    )
    const randomUsersData = await randomUsersResponse.json()
    const randomUsers = randomUsersData.results

    // Get existing owner_user_id
    const existingChannelsResponse = await fetch(
      `${supabaseUrl}/rest/v1/channels?select=owner_user_id&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    const existingChannels = await existingChannelsResponse.json()
    const ownerUserId = existingChannels[0]?.owner_user_id

    if (!ownerUserId) {
      return NextResponse.json({ error: 'No owner user found' }, { status: 404 })
    }

    // Delete old channels
    await fetch(`${supabaseUrl}/rest/v1/channels?owner_user_id=eq.${ownerUserId}`, {
      method: 'DELETE',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    // Create new blogger channels
    const results = []
    
    for (let i = 0; i < bloggers.length; i++) {
      const blogger = bloggers[i]
      const randomUser = randomUsers[i]

      const channel = {
        owner_user_id: ownerUserId,
        platforms: [blogger.platform],
        handle: blogger.handle,
        title: blogger.title,
        description: blogger.description,
        topics: blogger.topics,
        blogger_name: `${randomUser.name.first} ${randomUser.name.last}`,
        blogger_avatar: randomUser.picture.large,
        blogger_bio: blogger.bio,
        case_studies: blogger.case_studies,
        moderation_status: 'approved',
        metrics: {
          subscribers: blogger.subscribers,
          avg_views: blogger.avg_views,
          engagement_rate: blogger.er,
        },
        audience: {
          age: { '18-24': 15, '25-34': 45, '35-44': 25, '45+': 15 },
          gender: { male: 48, female: 52 },
          geo: { russia: 75, ukraine: 10, belarus: 8, kazakhstan: 7 },
        },
        brand_safety: {
          verified: true,
          language: 'clean',
          content_rating: 'family_friendly',
        },
        rating: {
          score: 4.5 + Math.random() * 0.5,
          reviews_count: Math.floor(Math.random() * 50) + 10,
        },
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/channels`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(channel),
      })

      if (response.ok) {
        const created = await response.json()
        results.push({
          success: true,
          blogger: channel.blogger_name,
          title: channel.title,
        })
      } else {
        const error = await response.text()
        results.push({
          success: false,
          title: channel.title,
          error,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.filter((r) => r.success).length} bloggers`,
      results,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create bloggers' },
      { status: 500 }
    )
  }
}
