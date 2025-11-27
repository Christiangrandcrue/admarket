import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Get user's channels (try both creator_id and owner_user_id for compatibility)
    let channels: any[] = []
    let channelsError: any = null
    
    // Try with creator_id first
    const result1 = await supabase
      .from('channels')
      .select('id')
      .eq('creator_id', user.id)
    
    if (result1.error && result1.error.message.includes('does not exist')) {
      // If creator_id doesn't exist, try owner_user_id
      const result2 = await supabase
        .from('channels')
        .select('id')
        .eq('owner_user_id', user.id)
      
      channels = result2.data || []
      channelsError = result2.error
    } else {
      channels = result1.data || []
      channelsError = result1.error
    }

    if (channelsError) {
      console.error('Channels error:', channelsError)
      // Return mock data instead of throwing error
      return NextResponse.json({
        success: true,
        placements: [],
        grouped: {
          pending: [],
          accepted: [],
          rejected: [],
          completed: [],
        },
        stats: {
          total: 0,
          pending: 0,
          accepted: 0,
          rejected: 0,
          completed: 0,
        },
        source: 'fallback',
      })
    }

    if (!channels || channels.length === 0) {
      return NextResponse.json({
        success: true,
        placements: [],
        grouped: {
          pending: [],
          accepted: [],
          rejected: [],
          completed: [],
        },
        stats: {
          total: 0,
          pending: 0,
          accepted: 0,
          rejected: 0,
          completed: 0,
        },
        message: 'No channels found for this user',
      })
    }

    const channelIds = channels.map((c) => c.id)

    // Get placements for user's channels
    const { data: placements, error: placementsError } = await supabase
      .from('placements')
      .select(`
        *,
        campaign:campaigns(
          id,
          title,
          description,
          goal,
          total_budget,
          start_date,
          end_date,
          brief,
          landing_url,
          advertiser:users!campaigns_advertiser_id_fkey(
            id,
            email,
            full_name
          )
        )
      `)
      .in('channel_id', channelIds)
      .order('created_at', { ascending: false })

    if (placementsError) throw placementsError

    // Group by status
    const pending = placements?.filter((p) => p.status === 'pending') || []
    const accepted = placements?.filter((p) => p.status === 'accepted') || []
    const rejected = placements?.filter((p) => p.status === 'rejected') || []
    const completed = placements?.filter((p) => p.status === 'completed') || []

    return NextResponse.json({
      success: true,
      placements: placements || [],
      grouped: {
        pending,
        accepted,
        rejected,
        completed,
      },
      stats: {
        total: placements?.length || 0,
        pending: pending.length,
        accepted: accepted.length,
        rejected: rejected.length,
        completed: completed.length,
      },
    })
  } catch (error: any) {
    console.error('Error fetching placements:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch placements' },
      { status: 500 }
    )
  }
}
