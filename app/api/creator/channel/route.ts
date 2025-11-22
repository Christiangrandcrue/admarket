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

    // Get user's channels
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    if (channelsError) throw channelsError

    return NextResponse.json({
      success: true,
      channels: channels || [],
      hasChannels: channels && channels.length > 0,
    })
  } catch (error: any) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Parse channel data
    const channelData = await request.json()

    // Validation
    const errors = []
    if (!channelData.platform) errors.push('Platform is required')
    if (!channelData.handle) errors.push('Handle is required')
    if (!channelData.title) errors.push('Title is required')
    if (!channelData.category) errors.push('Category is required')

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Prepare channel record
    const channel = {
      creator_id: user.id,
      platform: channelData.platform,
      handle: channelData.handle,
      title: channelData.title,
      description: channelData.description || '',
      category: channelData.category,
      
      // Metrics
      followers_count: channelData.followers_count || 0,
      avg_views: channelData.avg_views || 0,
      engagement_rate: channelData.engagement_rate || 0,
      
      // Audience demographics (JSONB)
      demographics: channelData.demographics || {},
      
      // Pricing (JSONB)
      formats: channelData.formats || {},
      
      // Status
      verified: false,
      status: 'pending_review',
    }

    // Insert channel
    const { data: insertedChannel, error: insertError } = await supabase
      .from('channels')
      .insert([channel])
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      channel: insertedChannel,
      message: 'Channel created successfully. Pending verification.',
    })
  } catch (error: any) {
    console.error('Error creating channel:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create channel' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    // Parse update data
    const updateData = await request.json()
    const { channel_id, ...channelUpdates } = updateData

    if (!channel_id) {
      return NextResponse.json(
        { error: 'channel_id is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: existingChannel, error: fetchError } = await supabase
      .from('channels')
      .select('creator_id')
      .eq('id', channel_id)
      .single()

    if (fetchError) throw fetchError

    if (!existingChannel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    if (existingChannel.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You do not own this channel.' },
        { status: 403 }
      )
    }

    // Update channel
    const { data: updatedChannel, error: updateError } = await supabase
      .from('channels')
      .update({
        ...channelUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', channel_id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      channel: updatedChannel,
      message: 'Channel updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating channel:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update channel' },
      { status: 500 }
    )
  }
}
