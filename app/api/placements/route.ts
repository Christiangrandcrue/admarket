import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/placements - List placements for campaign or channels
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')
    const channelIds = searchParams.get('channel_ids')
    const status = searchParams.get('status')

    let url = `${supabaseUrl}/rest/v1/placements?select=*,channels(*),campaigns(*),formats(*)&order=created_at.desc`
    
    if (campaignId) {
      url += `&campaign_id=eq.${campaignId}`
    }

    if (channelIds) {
      url += `&channel_id=in.(${channelIds})`
    }

    if (status) {
      // Support both single status and multiple statuses with in.() operator
      // e.g., status=proposal or status=in.(booked,in_progress,posted)
      if (status.startsWith('in.(')) {
        url += `&status=${status}`
      } else {
        url += `&status=eq.${status}`
      }
    }

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch placements')
    }

    const placements = await response.json()

    return NextResponse.json({
      success: true,
      placements,
    })
  } catch (error: any) {
    console.error('Error fetching placements:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch placements' },
      { status: 500 }
    )
  }
}

// POST /api/placements - Create placements for selected channels
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { campaign_id, channel_ids } = body

    if (!campaign_id || !channel_ids || !Array.isArray(channel_ids) || channel_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'campaign_id and channel_ids array are required' },
        { status: 400 }
      )
    }

    // Fetch campaign details
    const campaignResponse = await fetch(
      `${supabaseUrl}/rest/v1/campaigns?select=*&id=eq.${campaign_id}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!campaignResponse.ok) {
      throw new Error('Campaign not found')
    }

    const campaigns = await campaignResponse.json()
    if (!campaigns || campaigns.length === 0) {
      throw new Error('Campaign not found')
    }

    const campaign = campaigns[0]

    // Fetch channels with their formats
    const channelsResponse = await fetch(
      `${supabaseUrl}/rest/v1/channels?select=*,formats(*)&id=in.(${channel_ids.join(',')})`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!channelsResponse.ok) {
      throw new Error('Failed to fetch channels')
    }

    const channels = await channelsResponse.json()

    // Create placements for each channel
    const placements = []
    const notifications = []

    for (const channel of channels) {
      // Get first available format (or create default one)
      let format = channel.formats && channel.formats.length > 0 ? channel.formats[0] : null

      // If no format exists, create a default one
      if (!format) {
        const defaultFormat = {
          channel_id: channel.id,
          name: 'post',
          rights: 'standard',
          price: {
            value: 10000,
            currency: 'RUB',
            model: 'fixed',
          },
          sla_days: 3,
        }

        const formatResponse = await fetch(`${supabaseUrl}/rest/v1/formats`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(defaultFormat),
        })

        if (formatResponse.ok) {
          const [createdFormat] = await formatResponse.json()
          format = createdFormat
        } else {
          console.error('Failed to create format for channel:', channel.id)
          continue
        }
      }

      // Calculate deadline (campaign creation date + format SLA days)
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + (format.sla_days || 7))

      const placement = {
        campaign_id: campaign.id,
        channel_id: channel.id,
        format_id: format.id,
        unit_price: format.price,
        deadline_at: deadline.toISOString(),
        status: 'proposal',
        assets: [],
      }

      placements.push(placement)

      // Create notification for channel owner
      const notification = {
        user_id: channel.owner_user_id,
        type: 'new_placement_request',
        title: 'Новое предложение размещения',
        message: `Вам поступило предложение разместить рекламу в канале "${channel.title}" от кампании "${campaign.name}"`,
        campaign_id: campaign.id,
        channel_id: channel.id,
        is_read: false,
      }

      notifications.push(notification)
    }

    // Bulk insert placements
    const placementsResponse = await fetch(`${supabaseUrl}/rest/v1/placements`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(placements),
    })

    if (!placementsResponse.ok) {
      const error = await placementsResponse.text()
      throw new Error(error || 'Failed to create placements')
    }

    const createdPlacements = await placementsResponse.json()

    // Update notifications with placement IDs
    for (let i = 0; i < notifications.length; i++) {
      if (createdPlacements[i]) {
        notifications[i].placement_id = createdPlacements[i].id
      }
    }

    // Bulk insert notifications
    const notificationsResponse = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(notifications),
    })

    if (!notificationsResponse.ok) {
      console.error('Failed to create notifications')
    }

    return NextResponse.json({
      success: true,
      placements: createdPlacements,
      message: `Created ${createdPlacements.length} placements`,
    })
  } catch (error: any) {
    console.error('Error creating placements:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create placements' },
      { status: 500 }
    )
  }
}
