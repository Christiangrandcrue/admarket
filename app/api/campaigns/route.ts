import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { newPlacementRequestEmail } from '@/lib/email/templates'

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

    // Parse campaign data
    const campaignData = await request.json()

    // Validate required fields
    const validationErrors = []

    if (!campaignData.description || campaignData.description.length < 50) {
      validationErrors.push('Description must be at least 50 characters')
    }
    if (!campaignData.selectedChannels || campaignData.selectedChannels.length === 0) {
      validationErrors.push('At least one channel must be selected')
    }
    if (!campaignData.defaultFormats || campaignData.defaultFormats.length === 0) {
      validationErrors.push('At least one format must be selected')
    }
    if (!campaignData.totalBudget || campaignData.totalBudget <= 0) {
      validationErrors.push('Budget must be greater than 0')
    }
    if (!campaignData.startDate || !campaignData.endDate) {
      validationErrors.push('Start and end dates are required')
    }
    if (!campaignData.briefDescription || campaignData.briefDescription.length === 0) {
      validationErrors.push('Brief description is required')
    }
    if (!campaignData.landingUrl || campaignData.landingUrl.length === 0) {
      validationErrors.push('Landing URL is required')
    }
    if (!campaignData.agreedToTerms) {
      validationErrors.push('You must agree to the terms and conditions')
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Calculate platform commission (10%)
    const platformFee = campaignData.totalBudget * 0.1
    const creatorPayout = campaignData.totalBudget - platformFee

    // Prepare campaign record
    const campaign = {
      advertiser_id: user.id,
      title: campaignData.description.substring(0, 100), // First 100 chars
      description: campaignData.description,
      goal: campaignData.goal,
      status: 'pending', // Pending until payment
      total_budget: campaignData.totalBudget,
      payment_model: campaignData.paymentModel,
      start_date: campaignData.startDate,
      end_date: campaignData.endDate,
      brief: campaignData.briefDescription,
      landing_url: campaignData.landingUrl,
      utm_campaign: campaignData.utmCampaign || `campaign_${Date.now()}`,
      promo_code: campaignData.promoCode || null,
      kpis: campaignData.kpis || {},
      selected_channels: campaignData.selectedChannels || [],
      default_formats: campaignData.defaultFormats || [],
      content_requirements: campaignData.contentRequirements || [],
      restrictions: campaignData.restrictions || [],
      platform_fee: platformFee,
      creator_payout: creatorPayout,
    }

    // Insert campaign into database
    const { data: insertedCampaign, error: insertError } = await supabase
      .from('campaigns')
      .insert([campaign])
      .select()
      .single()

    if (insertError) throw insertError

    // Create placements for each selected channel
    const placements = campaignData.selectedChannels.map((channel: any) => ({
      campaign_id: insertedCampaign.id,
      channel_id: channel.channelId,
      channel_title: channel.channelTitle,
      channel_handle: channel.channelHandle,
      formats: channel.formats || campaignData.defaultFormats,
      budget: channel.budget || 0,
      status: 'pending',
    }))

    if (placements.length > 0) {
      const { data: insertedPlacements, error: placementsError } = await supabase
        .from('placements')
        .insert(placements)
        .select()

      if (placementsError) {
        console.error('Error creating placements:', placementsError)
        // Don't fail the whole request if placements fail
      } else if (insertedPlacements) {
        // Send email notifications to creators for each placement
        for (const placement of insertedPlacements) {
          try {
            // Get creator email from channel
            const { data: channel } = await supabase
              .from('channels')
              .select('creator:users!channels_creator_id_fkey(email, full_name)')
              .eq('id', placement.channel_id)
              .single()

            if (channel?.creator?.email) {
              const creatorName = channel.creator.full_name || 'Блогер'
              const advertiserName = user.email?.split('@')[0] || 'Рекламодатель'
              const requestUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/creator/placements/${placement.id}`

              const emailContent = newPlacementRequestEmail({
                creatorName,
                advertiserName,
                campaignTitle: insertedCampaign.title,
                budget: placement.budget,
                requestUrl,
              })

              await sendEmail({
                to: channel.creator.email,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text,
              })

              console.log(`✅ Placement request email sent to: ${channel.creator.email}`)
            }
          } catch (emailError) {
            console.error('❌ Error sending placement request email:', emailError)
            // Don't fail the request if email fails
          }
        }
      }
    }

    // TODO: Create escrow transaction
    // This will be implemented when Stripe Connect is integrated
    // For now, we just mark the campaign as pending

    // Delete any existing drafts for this user
    await supabase
      .from('campaigns')
      .delete()
      .eq('advertiser_id', user.id)
      .eq('status', 'draft')

    return NextResponse.json({
      success: true,
      campaign: insertedCampaign,
      message: 'Campaign created successfully',
    })
  } catch (error: any) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

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

    // Fetch all campaigns for this user
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('advertiser_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      campaigns: data || [],
    })
  } catch (error: any) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
