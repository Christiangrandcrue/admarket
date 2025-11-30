import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const advertiser_id = searchParams.get('advertiser_id')

  // Get current user to filter "My Campaigns" vs "Public Board"
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  // If advertiser_id is explicitly requested (e.g. My Campaigns page)
  if (advertiser_id) {
    query = query.eq('advertiser_id', advertiser_id)
  } else if (status === 'active') {
    // Public Board: Show active only
    query = query.eq('status', 'active')
  } else if (user) {
    // Default behavior for logged in user:
    // If advertiser -> show my campaigns
    // If creator -> show active campaigns (Board)
    // But usually the frontend will pass params. 
    // Let's fallback to showing all active if no params.
    
    // We can check user role here if needed, but query params are cleaner.
    // For "My Campaigns" page, we should pass ?advertiser_id=ME or handle it here.
    
    // Let's assume if no params, we return all active (Board view)
    // But for the "My Campaigns" page which calls /api/campaigns without params in current code:
    // We need to handle that.
    
    // Let's check if the user is an advertiser and if the request comes from dashboard
    // This is hard to guess. Let's modify the frontend to pass params.
    // But for now, let's return ALL campaigns if the user is the owner, or ACTIVE if not.
    
    // Actually, safest is: if authenticated, return "My Campaigns" if no other params? 
    // No, that breaks the Board for creators.
    
    // Strategy:
    // Frontend MUST pass ?status=active for Board.
    // Frontend MUST pass ?scope=my for My Campaigns.
    
    const scope = searchParams.get('scope')
    if (scope === 'my') {
        query = query.eq('advertiser_id', user.id)
    } else {
        // Default to active/public if not specified
         query = query.eq('status', 'active')
    }
  }

  const { data: campaigns, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ campaigns })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Map frontend form data to DB schema
    // Frontend sends: name, goal, description, budget: {value, currency}, geo, audience, etc.
    // DB expects: title, description, platform, category, budget, requirements, status, advertiser_id
    
    // We need to adapt or save extra fields in a jsonb column if it exists, or ignore them.
    // For MVP, we map what we can.
    
    // Check DB schema from previous interactions:
    // title, description, platform, category, budget, requirements, status, advertiser_id
    
    const campaignData = {
        advertiser_id: user.id,
        title: body.name,
        description: body.description,
        budget: body.budget?.value || 0,
        status: 'active', // Auto-activate for MVP
        platform: 'instagram', // Default or needs selection in form
        category: 'lifestyle', // Default or needs selection in form
        requirements: `Geo: ${body.geo?.join(', ')}. Age: ${body.audience?.age?.join(', ')}. Goal: ${body.goal}`,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days default
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, campaign: data })
  } catch (error: any) {
    console.error('Campaign creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
