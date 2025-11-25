import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/placements/[id] - Get single placement
export async function GET(
  request: Request,
  { params: initialParams }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await initialParams

    const url = `${supabaseUrl}/rest/v1/placements?select=*,channels(*),campaigns(*),formats(*)&id=eq.${params.id}`

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch placement')
    }

    const placements = await response.json()

    if (!placements || placements.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Placement not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      placement: placements[0],
    })
  } catch (error: any) {
    console.error('Error fetching placement:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch placement' },
      { status: 500 }
    )
  }
}

// PATCH /api/placements/[id] - Update placement status
export async function PATCH(
  request: Request,
  { params: initialParams }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await initialParams
    const body = await request.json()
    const { status, post_link } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status transitions
    const validStatuses = ['proposal', 'booked', 'in_progress', 'posted', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: any = { status }
    if (post_link !== undefined) {
      updateData.post_link = post_link
    }

    // Update placement
    const response = await fetch(
      `${supabaseUrl}/rest/v1/placements?id=eq.${params.id}`,
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

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to update placement')
    }

    const [updatedPlacement] = await response.json()

    // Create notification for status change
    if (status === 'booked' || status === 'rejected' || status === 'posted') {
      // Get placement details with campaign info
      const placementResponse = await fetch(
        `${supabaseUrl}/rest/v1/placements?select=*,campaigns(*),channels(*)&id=eq.${params.id}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      if (placementResponse.ok) {
        const [placement] = await placementResponse.json()
        const campaign = placement.campaigns
        const channel = placement.channels

        let notificationData: any = {}

        if (status === 'booked') {
          notificationData = {
            user_id: campaign.advertiser_id,
            type: 'placement_accepted',
            title: 'Размещение принято',
            message: `Блогер "${channel.blogger_name || channel.title}" принял предложение размещения в кампании "${campaign.name}"`,
            campaign_id: campaign.id,
            channel_id: channel.id,
            placement_id: params.id,
            is_read: false,
          }
        } else if (status === 'rejected') {
          notificationData = {
            user_id: campaign.advertiser_id,
            type: 'placement_rejected',
            title: 'Размещение отклонено',
            message: `Блогер "${channel.blogger_name || channel.title}" отклонил предложение размещения в кампании "${campaign.name}"`,
            campaign_id: campaign.id,
            channel_id: channel.id,
            placement_id: params.id,
            is_read: false,
          }
        } else if (status === 'posted') {
          notificationData = {
            user_id: campaign.advertiser_id,
            type: 'content_uploaded',
            title: 'Контент опубликован',
            message: `Блогер "${channel.blogger_name || channel.title}" опубликовал контент для кампании "${campaign.name}"`,
            campaign_id: campaign.id,
            channel_id: channel.id,
            placement_id: params.id,
            is_read: false,
          }
        }

        // Create notification
        await fetch(`${supabaseUrl}/rest/v1/notifications`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(notificationData),
        })
      }
    }

    return NextResponse.json({
      success: true,
      placement: updatedPlacement,
    })
  } catch (error: any) {
    console.error('Error updating placement:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update placement' },
      { status: 500 }
    )
  }
}
