import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/messages - List messages for a conversation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversation_id is required' },
        { status: 400 }
      )
    }

    // Fetch messages for conversation
    const url = `${supabaseUrl}/rest/v1/messages?conversation_id=eq.${conversationId}&order=created_at.asc`

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }

    const messages = await response.json()

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversation_id, sender_id, sender_type, content, attachments } = body

    if (!conversation_id || !sender_id || !sender_type || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'conversation_id, sender_id, sender_type, and content are required',
        },
        { status: 400 }
      )
    }

    if (!['advertiser', 'creator'].includes(sender_type)) {
      return NextResponse.json(
        { success: false, error: 'sender_type must be "advertiser" or "creator"' },
        { status: 400 }
      )
    }

    // Verify conversation exists and user is part of it
    const conversationUrl = `${supabaseUrl}/rest/v1/conversations?id=eq.${conversation_id}`
    const conversationResponse = await fetch(conversationUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!conversationResponse.ok) {
      throw new Error('Conversation not found')
    }

    const conversations = await conversationResponse.json()
    if (!conversations || conversations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const conversation = conversations[0]

    // Verify sender is part of conversation
    if (
      (sender_type === 'advertiser' && conversation.advertiser_id !== sender_id) ||
      (sender_type === 'creator' && conversation.creator_id !== sender_id)
    ) {
      return NextResponse.json(
        { success: false, error: 'Sender is not part of this conversation' },
        { status: 403 }
      )
    }

    // Create message
    const messageData = {
      conversation_id,
      sender_id,
      sender_type,
      content,
      attachments: attachments || [],
    }

    const createResponse = await fetch(`${supabaseUrl}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(messageData),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      throw new Error(errorData.message || 'Failed to create message')
    }

    const newMessages = await createResponse.json()
    const newMessage = newMessages[0]

    // Create notification for recipient
    const recipientId =
      sender_type === 'advertiser' ? conversation.creator_id : conversation.advertiser_id

    const notificationData = {
      user_id: recipientId,
      type: 'new_message',
      title: 'Новое сообщение',
      message: `У вас новое сообщение: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
      conversation_id,
      is_read: false,
    }

    // Send notification (fire and forget)
    fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    }).catch((err) => console.error('Failed to create notification:', err))

    return NextResponse.json({
      success: true,
      message: newMessage,
    })
  } catch (error: any) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create message' },
      { status: 500 }
    )
  }
}
