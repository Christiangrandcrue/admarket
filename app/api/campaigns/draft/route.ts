import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Parse campaign draft data
    const draft = await request.json()

    // Validate required fields for draft
    if (!draft.description || draft.description.length < 50) {
      return NextResponse.json(
        { error: 'Description must be at least 50 characters' },
        { status: 400 }
      )
    }

    // Prepare campaign data
    const campaignData = {
      advertiser_id: user.id,
      title: draft.description.substring(0, 100), // First 100 chars as title
      description: draft.description,
      goal: draft.goal,
      status: 'draft',
      total_budget: draft.totalBudget || 0,
      payment_model: draft.paymentModel || 'fixed',
      start_date: draft.startDate || null,
      end_date: draft.endDate || null,
      brief: draft.briefDescription || '',
      landing_url: draft.landingUrl || '',
      utm_campaign: draft.utmCampaign || '',
      promo_code: draft.promoCode || null,
      kpis: draft.kpis || {},
      selected_channels: draft.selectedChannels || [],
      default_formats: draft.defaultFormats || [],
      content_requirements: draft.contentRequirements || [],
      restrictions: draft.restrictions || [],
    }

    // Check if draft already exists (update) or create new
    const { data: existingDraft } = await supabase
      .from('campaigns')
      .select('id')
      .eq('advertiser_id', user.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let result

    if (existingDraft) {
      // Update existing draft
      const { data, error } = await supabase
        .from('campaigns')
        .update(campaignData)
        .eq('id', existingDraft.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new draft
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      campaign: result,
      message: 'Draft saved successfully',
    })
  } catch (error: any) {
    console.error('Error saving campaign draft:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save draft' },
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

    // Fetch latest draft
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('advertiser_id', user.id)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (not an error)
      throw error
    }

    return NextResponse.json({
      success: true,
      draft: data || null,
    })
  } catch (error: any) {
    console.error('Error fetching campaign draft:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch draft' },
      { status: 500 }
    )
  }
}
