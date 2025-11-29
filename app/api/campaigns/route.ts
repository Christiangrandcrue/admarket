import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/campaigns - List campaigns for advertiser
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch campaigns for this advertiser
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('advertiser_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || [],
    })
  } catch (error: any) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Map CampaignDraft to Database Schema
    // Draft fields: title, goal, description, selectedChannels, totalBudget, paymentModel, startDate, endDate, contentRequirements
    
    // Simple mapping logic
    const platform = body.selectedChannels?.length > 0 
      ? 'mixed' 
      : 'instagram' // default

    const requirements = [
      body.briefDescription,
      ...(body.contentRequirements || []),
      ...(body.restrictions || [])
    ].filter(Boolean).join('\n\n')

    const campaignData = {
      advertiser_id: user.id,
      title: body.title,
      description: body.description,
      platform: platform,
      category: 'General', // Default as it's not in the wizard yet
      budget: body.totalBudget || 0,
      requirements: requirements,
      deadline: body.endDate ? new Date(body.endDate).toISOString() : null,
      status: 'active', // Default to active for immediate visibility
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      campaign: campaign,
    })
  } catch (error: any) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
