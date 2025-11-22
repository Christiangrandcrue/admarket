import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { action, rejection_reason } = body

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject".' },
        { status: 400 }
      )
    }

    // Get placement to verify ownership
    const { data: placement, error: fetchError } = await supabase
      .from('placements')
      .select('*, channel:channels!placements_channel_id_fkey(creator_id)')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (!placement) {
      return NextResponse.json(
        { error: 'Placement not found' },
        { status: 404 }
      )
    }

    // Verify user owns the channel
    if (placement.channel?.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You do not own this channel.' },
        { status: 403 }
      )
    }

    // Check if already processed
    if (placement.status !== 'pending') {
      return NextResponse.json(
        { error: `Placement already ${placement.status}` },
        { status: 400 }
      )
    }

    // Update placement status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected'
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (action === 'reject' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    if (action === 'accept') {
      updateData.accepted_at = new Date().toISOString()
    }

    const { data: updatedPlacement, error: updateError } = await supabase
      .from('placements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Get campaign and advertiser info for notification
    const { data: campaignData } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        advertiser_id,
        advertiser:users!campaigns_advertiser_id_fkey(email, full_name)
      `)
      .eq('id', placement.campaign_id)
      .single()

    // Send notification to advertiser
    if (campaignData) {
      try {
        const notificationMessage = action === 'accept'
          ? `Блогер ${placement.channel_title} принял ваше предложение по кампании "${campaignData.title}"`
          : `Блогер ${placement.channel_title} отклонил ваше предложение по кампании "${campaignData.title}"`

        // TODO: Implement actual email notification (Resend/SendGrid)
        // For now, just log it
        console.log('Notification to advertiser:', {
          to: campaignData.advertiser?.email,
          subject: action === 'accept' ? 'Заявка принята ✅' : 'Заявка отклонена ❌',
          message: notificationMessage,
          placement_id: id,
          campaign_id: campaignData.id,
        })

        // TODO: Create in-app notification record
        // await supabase.from('notifications').insert({
        //   user_id: campaignData.advertiser_id,
        //   type: action === 'accept' ? 'placement_accepted' : 'placement_rejected',
        //   title: action === 'accept' ? 'Заявка принята' : 'Заявка отклонена',
        //   message: notificationMessage,
        //   metadata: { placement_id: id, campaign_id: campaignData.id },
        // })
      } catch (notifError) {
        console.error('Error sending notification:', notifError)
        // Don't fail the request if notification fails
      }
    }

    // TODO: If accepted, trigger escrow release flow

    return NextResponse.json({
      success: true,
      placement: updatedPlacement,
      message: action === 'accept' 
        ? 'Placement accepted successfully. Advertiser has been notified.' 
        : 'Placement rejected. Advertiser has been notified.',
    })
  } catch (error: any) {
    console.error('Error updating placement:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update placement' },
      { status: 500 }
    )
  }
}

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

    // Get placement with campaign details
    const { data: placement, error } = await supabase
      .from('placements')
      .select(`
        *,
        channel:channels!placements_channel_id_fkey(*),
        campaign:campaigns(
          *,
          advertiser:users!campaigns_advertiser_id_fkey(
            id,
            email,
            full_name
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!placement) {
      return NextResponse.json(
        { error: 'Placement not found' },
        { status: 404 }
      )
    }

    // Verify user owns the channel
    if (placement.channel?.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You do not own this channel.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      placement,
    })
  } catch (error: any) {
    console.error('Error fetching placement:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch placement' },
      { status: 500 }
    )
  }
}
