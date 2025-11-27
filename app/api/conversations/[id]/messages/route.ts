import { NextRequest, NextResponse } from 'next/server'

// GET /api/conversations/[id]/messages - Get messages in conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Mock messages data
    const mockMessages = [
      {
        id: 'msg-1',
        conversation_id: id,
        sender_id: 'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
        sender_type: 'advertiser',
        content: 'Здравствуйте! Хотел бы обсудить размещение рекламы нашего продукта на вашем канале.',
        attachments: [],
        is_read: true,
        read_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'msg-2',
        conversation_id: id,
        sender_id: 'creator-1',
        sender_type: 'creator',
        content: 'Привет! Конечно, я открыт к сотрудничеству. Расскажите подробнее о вашем продукте и целевой аудитории.',
        attachments: [],
        is_read: true,
        read_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 2 - 3600000).toISOString(),
      },
      {
        id: 'msg-3',
        conversation_id: id,
        sender_id: 'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
        sender_type: 'advertiser',
        content: 'Мы продаём фитнес-трекеры и умные часы. Наша ЦА — активные люди 25-40 лет, которые следят за здоровьем.',
        attachments: [],
        is_read: true,
        read_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 2 - 7200000).toISOString(),
      },
      {
        id: 'msg-4',
        conversation_id: id,
        sender_id: 'creator-1',
        sender_type: 'creator',
        content: 'Отлично! Это прямо в тему моего контента. Какие у вас сроки и бюджет?',
        attachments: [],
        is_read: true,
        read_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 2 - 10800000).toISOString(),
      },
      {
        id: 'msg-5',
        conversation_id: id,
        sender_id: 'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
        sender_type: 'advertiser',
        content: 'Планируем запуститься через 2 недели. Бюджет на интеграцию — до 50 000 ₽. Вас устроит?',
        attachments: [],
        is_read: true,
        read_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000 - 3600000).toISOString(),
      },
      {
        id: 'msg-6',
        conversation_id: id,
        sender_id: 'creator-1',
        sender_type: 'creator',
        content: 'Да, меня устраивает! Давайте я подготовлю несколько вариантов интеграции и отправлю вам на согласование.',
        attachments: [],
        is_read: true,
        read_at: new Date(Date.now() - 7200000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'msg-7',
        conversation_id: id,
        sender_id: 'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
        sender_type: 'advertiser',
        content: 'Супер! Жду варианты. Также отправлю вам креативы и основные месседжи.',
        attachments: [],
        is_read: true,
        read_at: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'msg-8',
        conversation_id: id,
        sender_id: 'creator-1',
        sender_type: 'creator',
        content: 'Отлично! А можно промокод для моих подписчиков? Это всегда хорошо заходит.',
        attachments: [],
        is_read: false,
        read_at: null,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      messages: mockMessages,
      count: mockMessages.length,
      source: 'mock',
    })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// POST /api/conversations/[id]/messages - Send new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, sender_id, sender_type } = body

    if (!content || !sender_id || !sender_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Mock response for sending message
    const newMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: id,
      sender_id,
      sender_type,
      content,
      attachments: [],
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
      source: 'mock',
    })
  } catch (error: any) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
