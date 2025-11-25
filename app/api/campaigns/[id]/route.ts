import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: Request,
  { params: initialParams }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await initialParams
    
    const url = `${supabaseUrl}/rest/v1/campaigns?select=*&id=eq.${params.id}`

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch campaign')
    }

    const campaigns = await response.json()

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      campaign: campaigns[0],
    })
  } catch (error: any) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}
