import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    // Mock conversations data
    const mockConversations = [
      {
        id: '1',
        advertiser_id: 'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
        creator_id: 'creator-1',
        campaign_id: 'campaign-1',
        channel_id: 'channel-1',
        subject: 'Размещение рекламы в Stories',
        last_message_at: new Date(Date.now() - 3600000).toISOString(),
        unread_count_advertiser: 2,
        unread_count_creator: 0,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        campaign: {
          id: 'campaign-1',
          name: 'Весенняя распродажа',
          brand: {
            id: 'brand-1',
            name: 'TechStore',
            logo_url: null,
          },
        },
        channel: {
          id: 'channel-1',
          blogger_name: 'FitnessKate',
          platform: 'instagram',
          avatar_url: null,
        },
        last_message: {
          id: 'msg-1',
          content: 'Привет! Готова обсудить размещение. Какие у вас сроки?',
          sender_type: 'creator',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      },
      {
        id: '2',
        advertiser_id: 'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
        creator_id: 'creator-2',
        campaign_id: 'campaign-2',
        channel_id: 'channel-2',
        subject: 'Интеграция в видео',
        last_message_at: new Date(Date.now() - 7200000).toISOString(),
        unread_count_advertiser: 0,
        unread_count_creator: 1,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        campaign: {
          id: 'campaign-2',
          name: 'Запуск нового продукта',
          brand: {
            id: 'brand-2',
            name: 'BeautyLab',
            logo_url: null,
          },
        },
        channel: {
          id: 'channel-2',
          blogger_name: 'TechReview',
          platform: 'youtube',
          avatar_url: null,
        },
        last_message: {
          id: 'msg-2',
          content: 'Спасибо за детали! Давайте я подготовлю варианты интеграции.',
          sender_type: 'advertiser',
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      },
      {
        id: '3',
        advertiser_id: 'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
        creator_id: 'creator-3',
        campaign_id: 'campaign-3',
        channel_id: 'channel-3',
        subject: 'Обсуждение условий',
        last_message_at: new Date(Date.now() - 86400000).toISOString(),
        unread_count_advertiser: 0,
        unread_count_creator: 0,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        campaign: {
          id: 'campaign-3',
          name: 'Black Friday кампания',
          brand: {
            id: 'brand-3',
            name: 'FashionHub',
            logo_url: null,
          },
        },
        channel: {
          id: 'channel-3',
          blogger_name: 'CryptoNews',
          platform: 'telegram',
          avatar_url: null,
        },
        last_message: {
          id: 'msg-3',
          content: 'Отлично! Я согласен на эти условия. Когда начинаем?',
          sender_type: 'creator',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      },
      {
        id: '4',
        advertiser_id: 'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
        creator_id: 'creator-4',
        campaign_id: 'campaign-4',
        channel_id: 'channel-4',
        subject: 'Вопрос по креативу',
        last_message_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        unread_count_advertiser: 1,
        unread_count_creator: 0,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        campaign: {
          id: 'campaign-4',
          name: 'Летняя коллекция',
          brand: {
            id: 'brand-4',
            name: 'SportGear',
            logo_url: null,
          },
        },
        channel: {
          id: 'channel-4',
          blogger_name: 'BeautyLab',
          platform: 'tiktok',
          avatar_url: null,
        },
        last_message: {
          id: 'msg-4',
          content: 'Можем ли мы изменить цветовую палитру в креативе?',
          sender_type: 'creator',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      },
    ]

    return NextResponse.json({
      success: true,
      conversations: mockConversations,
      count: mockConversations.length,
    })
  } catch (error: any) {
    console.error('Error in /api/conversations:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
