import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/campaigns - List campaigns for advertiser
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const advertiserId = searchParams.get('advertiser_id')

    let url = `${supabaseUrl}/rest/v1/campaigns?select=*&order=created_at.desc`
    
    if (advertiserId) {
      url += `&advertiser_id=eq.${advertiserId}`
    }

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch campaigns')
    }

    const campaigns = await response.json()

    return NextResponse.json({
      success: true,
      campaigns,
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
    const body = await request.json()

    // For now, use a hardcoded advertiser ID (same as channel owner)
    // In production, this would come from authenticated session
    const advertiserId = 'bf91c23b-7b52-4870-82f7-ba9ad852b49e'

    const campaign = {
      advertiser_id: advertiserId,
      name: body.name,
      goal: body.goal,
      description: body.description || null,
      geo: body.geo,
      audience: body.audience,
      budget: body.budget,
      model: body.model,
      utm: body.utm,
      promo_codes: body.promo_codes || [],
      status: 'draft',
      integrations: body.integrations,
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/campaigns`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(campaign),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to create campaign')
    }

    const [createdCampaign] = await response.json()

    return NextResponse.json({
      success: true,
      campaign: createdCampaign,
    })
  } catch (error: any) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
