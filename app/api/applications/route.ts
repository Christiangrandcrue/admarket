import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

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
    const { campaign_id, cover_letter, bid_amount } = body

    if (!campaign_id) {
        return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    // Check if already applied
    const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('campaign_id', campaign_id)
        .eq('creator_id', user.id)
        .single()
    
    if (existing) {
        return NextResponse.json({ error: 'Already applied' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        campaign_id,
        creator_id: user.id,
        cover_letter: cover_letter || '',
        bid_amount: bid_amount || 0,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, application: data })
  } catch (error: any) {
    console.error('Application error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
