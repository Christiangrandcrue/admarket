import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Notification } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const type = searchParams.get('type')

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by unread
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    // Filter by type
    if (type) {
      query = query.eq('type', type)
    }

    const { data: notifications, error: notificationsError } = await query

    if (notificationsError) {
      // Return empty array if table doesn't exist
      console.error('Notifications error:', notificationsError)
      return NextResponse.json({
        success: true,
        notifications: [],
        unreadCount: 0,
      })
    }

    // Get unread count
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (countError) {
      console.error('Error fetching unread count:', countError)
    }

    return NextResponse.json({
      notifications: notifications || [],
      unread_count: unreadCount || 0,
      total: notifications?.length || 0,
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
