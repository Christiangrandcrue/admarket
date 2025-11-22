import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Get campaign with all related data
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        advertiser:users!campaigns_advertiser_id_fkey(
          id,
          email,
          full_name
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify user owns this campaign
    if (campaign.advertiser_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You do not own this campaign.' },
        { status: 403 }
      )
    }

    // Get all placements for this campaign
    const { data: placements, error: placementsError } = await supabase
      .from('placements')
      .select(`
        *,
        channel:channels!placements_channel_id_fkey(
          id,
          title,
          handle,
          platform,
          followers_count,
          avg_views,
          engagement_rate,
          verified
        )
      `)
      .eq('campaign_id', id)
      .order('created_at', { ascending: false })

    if (placementsError) {
      console.error('Error fetching placements:', placementsError)
    }

    // Calculate campaign statistics
    const stats = {
      totalPlacements: placements?.length || 0,
      pendingPlacements: placements?.filter(p => p.status === 'pending').length || 0,
      acceptedPlacements: placements?.filter(p => p.status === 'accepted').length || 0,
      rejectedPlacements: placements?.filter(p => p.status === 'rejected').length || 0,
      completedPlacements: placements?.filter(p => p.status === 'completed').length || 0,
      totalReach: placements?.reduce((sum, p) => {
        const channel = p.channel as any
        return sum + (channel?.followers_count || 0)
      }, 0) || 0,
      avgEngagementRate: placements?.length 
        ? (placements.reduce((sum, p) => {
            const channel = p.channel as any
            return sum + (channel?.engagement_rate || 0)
          }, 0) / placements.length).toFixed(2)
        : '0.00',
    }

    return NextResponse.json({
      success: true,
      campaign,
      placements: placements || [],
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Parse request body
    const body = await request.json()
    const { action } = body

    // Validate action
    if (!action || !['pause', 'resume', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "pause", "resume", or "cancel".' },
        { status: 400 }
      )
    }

    // Get campaign to verify ownership
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('advertiser_id, status')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify user owns the campaign
    if (campaign.advertiser_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You do not own this campaign.' },
        { status: 403 }
      )
    }

    // Determine new status based on action
    let newStatus: string
    switch (action) {
      case 'pause':
        if (campaign.status !== 'active') {
          return NextResponse.json(
            { error: 'Only active campaigns can be paused' },
            { status: 400 }
          )
        }
        newStatus = 'paused'
        break
      case 'resume':
        if (campaign.status !== 'paused') {
          return NextResponse.json(
            { error: 'Only paused campaigns can be resumed' },
            { status: 400 }
          )
        }
        newStatus = 'active'
        break
      case 'cancel':
        if (['completed', 'cancelled'].includes(campaign.status)) {
          return NextResponse.json(
            { error: 'Campaign is already completed or cancelled' },
            { status: 400 }
          )
        }
        newStatus = 'cancelled'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update campaign status
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: `Campaign ${action}d successfully`,
    })
  } catch (error: any) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
      { status: 500 }
    )
  }
}
