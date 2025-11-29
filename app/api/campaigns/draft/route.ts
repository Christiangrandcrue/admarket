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
    if (!draft.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Simple mapping logic for Draft
    const platform = draft.selectedChannels?.length > 0 
      ? 'mixed' 
      : 'instagram' // default

    const requirements = [
      draft.briefDescription,
      ...(draft.contentRequirements || []),
      ...(draft.restrictions || [])
    ].filter(Boolean).join('\n\n')

    // Prepare campaign data
    const campaignData = {
      advertiser_id: user.id,
      title: draft.title,
      description: draft.description || '',
      category: 'General',
      status: 'draft',
      budget: draft.totalBudget || 0,
      platform: platform,
      deadline: draft.endDate ? new Date(draft.endDate).toISOString() : null,
      requirements: requirements
    }

    // Check if draft already exists (update) or create new
    // Since we don't track "draft ID" in the frontend state in this simple version,
    // we might keep creating new drafts or need to find the latest one.
    // For MVP, let's just Insert a new one to be safe and return it.
    
    const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single()

      if (error) throw error

    return NextResponse.json({
      success: true,
      campaign: data,
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
