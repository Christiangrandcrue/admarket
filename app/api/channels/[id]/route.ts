import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/channels?id=eq.${id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch channel' },
        { status: response.status }
      )
    }

    const channels = await response.json()

    if (!channels || channels.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Channel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      channel: channels[0]
    })
  } catch (error: any) {
    console.error('Error fetching channel:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
