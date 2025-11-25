import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/user-ratings - Get user rating
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Fetch user rating
    const url = `${supabaseUrl}/rest/v1/user_ratings?user_id=eq.${userId}`

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user rating')
    }

    const ratings = await response.json()

    if (!ratings || ratings.length === 0) {
      // Return default rating if not found
      return NextResponse.json({
        success: true,
        rating: {
          user_id: userId,
          overall_rating: 0,
          communication_rating: 0,
          quality_rating: 0,
          professionalism_rating: 0,
          timeliness_rating: 0,
          total_reviews: 0,
          positive_reviews: 0,
          neutral_reviews: 0,
          negative_reviews: 0,
          would_work_again_count: 0,
          would_work_again_percentage: 0,
        },
      })
    }

    return NextResponse.json({
      success: true,
      rating: ratings[0],
    })
  } catch (error: any) {
    console.error('Error fetching user rating:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user rating' },
      { status: 500 }
    )
  }
}
