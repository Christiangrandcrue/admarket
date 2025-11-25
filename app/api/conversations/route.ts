import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/conversations - List conversations for current user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Fetch conversations where user is either advertiser or creator
    let url = `${supabaseUrl}/rest/v1/conversations?select=*,campaigns(id,name,brand:brands(id,name,logo_url)),channels(id,blogger_name,platform,avatar_url)&or=(advertiser_id.eq.${userId},creator_id.eq.${userId})&order=last_message_at.desc.nullslast`

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch conversations')
    }

    const conversations = await response.json()

    // For each conversation, fetch the last message
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation: any) => {
        const messagesUrl = `${supabaseUrl}/rest/v1/messages?conversation_id=eq.${conversation.id}&order=created_at.desc&limit=1`
        
        const messagesResponse = await fetch(messagesUrl, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        })

        let lastMessage = null
        if (messagesResponse.ok) {
          const messages = await messagesResponse.json()
          if (messages && messages.length > 0) {
            lastMessage = messages[0]
          }
        }

        return {
          ...conversation,
          last_message: lastMessage,
        }
      })
    )

    return NextResponse.json({
      success: true,
      conversations: conversationsWithLastMessage,
    })
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Create or get existing conversation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { advertiser_id, creator_id, campaign_id, channel_id, subject } = body

    if (!advertiser_id || !creator_id) {
      return NextResponse.json(
        { success: false, error: 'advertiser_id and creator_id are required' },
        { status: 400 }
      )
    }

    // Check if conversation already exists
    let checkUrl = `${supabaseUrl}/rest/v1/conversations?advertiser_id=eq.${advertiser_id}&creator_id=eq.${creator_id}`
    
    if (campaign_id) {
      checkUrl += `&campaign_id=eq.${campaign_id}`
    } else {
      checkUrl += `&campaign_id=is.null`
    }
    
    if (channel_id) {
      checkUrl += `&channel_id=eq.${channel_id}`
    } else {
      checkUrl += `&channel_id=is.null`
    }

    const checkResponse = await fetch(checkUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (checkResponse.ok) {
      const existingConversations = await checkResponse.json()
      if (existingConversations && existingConversations.length > 0) {
        // Conversation exists, return it
        return NextResponse.json({
          success: true,
          conversation: existingConversations[0],
          existing: true,
        })
      }
    }

    // Create new conversation
    const conversationData: any = {
      advertiser_id,
      creator_id,
      subject: subject || null,
    }

    if (campaign_id) {
      conversationData.campaign_id = campaign_id
    }

    if (channel_id) {
      conversationData.channel_id = channel_id
    }

    const createResponse = await fetch(`${supabaseUrl}/rest/v1/conversations`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(conversationData),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      throw new Error(errorData.message || 'Failed to create conversation')
    }

    const newConversations = await createResponse.json()
    const newConversation = newConversations[0]

    return NextResponse.json({
      success: true,
      conversation: newConversation,
      existing: false,
    })
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
