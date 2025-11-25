import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('API /api/channels called')
    console.log('Supabase URL:', supabaseUrl ? 'configured' : 'MISSING')
    console.log('Supabase Key:', supabaseKey ? 'configured' : 'MISSING')

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        debug: {
          url: !!supabaseUrl,
          key: !!supabaseKey
        }
      }, { status: 500 })
    }

    // Прямой запрос к Supabase REST API - только approved каналы
    const url = `${supabaseUrl}/rest/v1/channels?select=*&moderation_status=eq.approved`
    console.log('Fetching from:', url)
    
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    })

    console.log('Supabase response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error,
        status: response.status 
      }, { status: response.status })
    }

    const channels = await response.json()
    console.log('Channels loaded:', channels.length)
    
    return NextResponse.json({ 
      success: true,
      count: channels.length,
      channels 
    })
  } catch (error: any) {
    console.error('Exception in /api/channels:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
