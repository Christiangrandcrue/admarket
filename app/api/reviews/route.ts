import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/reviews - List reviews
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const revieweeId = searchParams.get('reviewee_id')
    const placementId = searchParams.get('placement_id')
    const isApproved = searchParams.get('is_approved') !== 'false' // default true

    let url = `${supabaseUrl}/rest/v1/reviews?select=*,placements(id,campaign:campaigns(id,name,brand:brands(id,name,logo_url)),channel:channels(id,blogger_name,platform,avatar_url))&order=created_at.desc`

    if (revieweeId) {
      url += `&reviewee_id=eq.${revieweeId}`
    }

    if (placementId) {
      url += `&placement_id=eq.${placementId}`
    }

    if (isApproved) {
      url += `&is_approved=eq.true`
    }

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch reviews')
    }

    const reviews = await response.json()

    return NextResponse.json({
      success: true,
      reviews,
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a review
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      placement_id,
      reviewer_id,
      reviewer_type,
      reviewee_id,
      reviewee_type,
      overall_rating,
      communication_rating,
      quality_rating,
      professionalism_rating,
      timeliness_rating,
      comment,
      would_work_again,
    } = body

    // Validate required fields
    if (
      !placement_id ||
      !reviewer_id ||
      !reviewer_type ||
      !reviewee_id ||
      !reviewee_type ||
      !overall_rating
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Validate ratings
    if (
      overall_rating < 1 ||
      overall_rating > 5 ||
      (communication_rating && (communication_rating < 1 || communication_rating > 5)) ||
      (quality_rating && (quality_rating < 1 || quality_rating > 5)) ||
      (professionalism_rating &&
        (professionalism_rating < 1 || professionalism_rating > 5)) ||
      (timeliness_rating && (timeliness_rating < 1 || timeliness_rating > 5))
    ) {
      return NextResponse.json(
        { success: false, error: 'Ratings must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Verify placement exists and is approved
    const placementResponse = await fetch(
      `${supabaseUrl}/rest/v1/placements?id=eq.${placement_id}&status=eq.approved`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!placementResponse.ok) {
      throw new Error('Placement not found')
    }

    const placements = await placementResponse.json()
    if (!placements || placements.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Placement not found or not approved' },
        { status: 404 }
      )
    }

    const placement = placements[0]

    // Verify reviewer is part of placement
    const channelResponse = await fetch(
      `${supabaseUrl}/rest/v1/channels?id=eq.${placement.channel_id}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!channelResponse.ok) {
      throw new Error('Channel not found')
    }

    const channels = await channelResponse.json()
    const channel = channels[0]

    // Validate reviewer
    if (
      (reviewer_type === 'advertiser' && placement.advertiser_id !== reviewer_id) ||
      (reviewer_type === 'creator' && channel.owner_user_id !== reviewer_id)
    ) {
      return NextResponse.json(
        { success: false, error: 'Reviewer is not part of this placement' },
        { status: 403 }
      )
    }

    // Check if review already exists
    const existingReviewResponse = await fetch(
      `${supabaseUrl}/rest/v1/reviews?placement_id=eq.${placement_id}&reviewer_id=eq.${reviewer_id}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (existingReviewResponse.ok) {
      const existingReviews = await existingReviewResponse.json()
      if (existingReviews && existingReviews.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Review already exists for this placement' },
          { status: 409 }
        )
      }
    }

    // Create review
    const reviewData = {
      placement_id,
      reviewer_id,
      reviewer_type,
      reviewee_id,
      reviewee_type,
      overall_rating,
      communication_rating: communication_rating || null,
      quality_rating: quality_rating || null,
      professionalism_rating: professionalism_rating || null,
      timeliness_rating: timeliness_rating || null,
      comment: comment || null,
      would_work_again: would_work_again !== undefined ? would_work_again : true,
      is_approved: true, // Auto-approve for now (can add moderation later)
    }

    const createResponse = await fetch(`${supabaseUrl}/rest/v1/reviews`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(reviewData),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      throw new Error(errorData.message || 'Failed to create review')
    }

    const newReviews = await createResponse.json()
    const newReview = newReviews[0]

    // Create notification for reviewee
    const notificationData = {
      user_id: reviewee_id,
      type: 'new_review',
      title: 'Новый отзыв',
      message: `Вы получили новый отзыв (${overall_rating}/5 звёзд)${comment ? `: "${comment.substring(0, 50)}..."` : ''}`,
      is_read: false,
    }

    // Send notification (fire and forget)
    fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    }).catch((err) => console.error('Failed to create notification:', err))

    return NextResponse.json({
      success: true,
      review: newReview,
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create review' },
      { status: 500 }
    )
  }
}
