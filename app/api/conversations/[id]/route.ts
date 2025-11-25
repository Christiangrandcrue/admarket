import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/conversations/[id] - Get conversation details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const url = `${supabaseUrl}/rest/v1/conversations?id=eq.${id}&select=*,campaigns(id,name,brand:brands(id,name,logo_url)),channels(id,blogger_name,platform,avatar_url,owner_user_id)`

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch conversation')
    }

    const conversations = await response.json()

    if (!conversations || conversations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      conversation: conversations[0],
    })
  } catch (error: any) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

// PATCH /api/conversations/[id] - Update conversation (mark as read)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { user_id, mark_as_read } = body

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      )
    }

    // If marking as read, reset unread count for this user
    if (mark_as_read) {
      // First, get conversation to determine user role
      const getResponse = await fetch(
        `${supabaseUrl}/rest/v1/conversations?id=eq.${id}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      if (!getResponse.ok) {
        throw new Error('Conversation not found')
      }

      const conversations = await getResponse.json()
      if (!conversations || conversations.length === 0) {
        throw new Error('Conversation not found')
      }

      const conversation = conversations[0]
      const isAdvertiser = conversation.advertiser_id === user_id
      const isCreator = conversation.creator_id === user_id

      if (!isAdvertiser && !isCreator) {
        return NextResponse.json(
          { success: false, error: 'User is not part of this conversation' },
          { status: 403 }
        )
      }

      // Update unread count
      const updateData: any = {}
      if (isAdvertiser) {
        updateData.unread_count_advertiser = 0
      }
      if (isCreator) {
        updateData.unread_count_creator = 0
      }

      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/conversations?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(updateData),
        }
      )

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.message || 'Failed to update conversation')
      }

      const updatedConversations = await updateResponse.json()

      // Also mark all unread messages as read
      const markMessagesResponse = await fetch(
        `${supabaseUrl}/rest/v1/messages?conversation_id=eq.${id}&sender_id=neq.${user_id}&is_read=eq.false`,
        {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_read: true,
            read_at: new Date().toISOString(),
          }),
        }
      )

      return NextResponse.json({
        success: true,
        conversation: updatedConversations[0],
      })
    }

    return NextResponse.json(
      { success: false, error: 'No update action specified' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update conversation' },
      { status: 500 }
    )
  }
}
