// Script to create blogger profiles with random photos
const https = require('https');

const SUPABASE_URL = 'https://ekikybqolsdvqffrzfvx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraWt5YnFvbHNkdnFmZnJ6ZnZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzc5MDkyMSwiZXhwIjoyMDUzMzY2OTIxfQ.fLDdtV3dE8WEIu-vOKRCx_nqd4pV0dZyRhGsjvO-ZDc';

// Get random user photos from randomuser.me API
async function getRandomUsers(count) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'randomuser.me',
      path: `/api/?results=${count}&nat=us,gb,au&inc=name,picture`,
      method: 'GET',
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Blogger personas
const bloggers = [
  {
    platform: 'telegram',
    handle: '@health_guru_maria',
    title: 'Здоровье с Марией',
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
    handle: '@business_alex',
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
    handle: '@marketing_kate',
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
    handle: '@tech_insights_dmitry',
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
    handle: '@finance_expert_sergey',
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
    handle: '@crypto_analytics_ivan',
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
    handle: '@fashion_diary_anna',
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
    handle: '@travel_world_oleg',
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
    handle: '@cooking_love_elena',
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
    handle: '@education_methods_tatiana',
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
    handle: '@lifestyle_vlog_dasha',
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
    handle: '@psychology_talks_mikhail',
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
];

// Main function
async function createBloggers() {
  try {
    console.log('Fetching random user photos...');
    const randomUsers = await getRandomUsers(bloggers.length);
    
    console.log(`Got ${randomUsers.length} random photos`);
    
    // First, get the owner user ID
    const channelsResponse = await fetch(`${SUPABASE_URL}/rest/v1/channels?select=owner_user_id&limit=1`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    
    const existingChannels = await channelsResponse.json();
    const ownerUserId = existingChannels[0]?.owner_user_id;
    
    if (!ownerUserId) {
      console.error('No existing channels found to get owner_user_id');
      return;
    }
    
    console.log(`Using owner_user_id: ${ownerUserId}`);
    
    // Delete existing channels
    console.log('Deleting old test channels...');
    const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/channels?owner_user_id=eq.${ownerUserId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    
    console.log('Old channels deleted');
    
    // Create new bloggers
    console.log('Creating new blogger profiles...');
    
    for (let i = 0; i < bloggers.length; i++) {
      const blogger = bloggers[i];
      const randomUser = randomUsers[i];
      
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
          engagement_rate: blogger.er
        },
        audience: {
          age: { '18-24': 15, '25-34': 45, '35-44': 25, '45+': 15 },
          gender: { male: 48, female: 52 },
          geo: { russia: 75, ukraine: 10, belarus: 8, kazakhstan: 7 }
        },
        brand_safety: {
          verified: true,
          language: 'clean',
          content_rating: 'family_friendly'
        },
        rating: {
          score: 4.5 + Math.random() * 0.5,
          reviews_count: Math.floor(Math.random() * 50) + 10
        }
      };
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/channels`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(channel)
      });
      
      if (response.ok) {
        console.log(`✓ Created: ${channel.blogger_name} - ${channel.title}`);
      } else {
        const error = await response.text();
        console.error(`✗ Failed: ${channel.title} - ${error}`);
      }
    }
    
    console.log('\n✅ Blogger creation complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createBloggers();
}

module.exports = { createBloggers };
