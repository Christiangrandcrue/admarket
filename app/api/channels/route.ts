import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Supabase not configured'
      }, { status: 500 })
    }

    // Прямой запрос к Supabase REST API - только approved каналы
    const url = `${supabaseUrl}/rest/v1/channels?select=*&moderation_status=eq.approved`
    
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ 
        error,
        status: response.status 
      }, { status: response.status })
    }

    const channels = await response.json()
    
    return NextResponse.json({ 
      success: true,
      count: channels.length,
      channels 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message
    }, { status: 500 })
  }
}
