import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/analytics - Get analytics data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const userType = searchParams.get('user_type') // 'advertiser' or 'creator'

    if (!userId || !userType) {
      return NextResponse.json(
        { success: false, error: 'user_id and user_type are required' },
        { status: 400 }
      )
    }

    const analytics: any = {
      campaigns: {},
      placements: {},
      reviews: {},
      messages: {},
      financial: {},
    }

    if (userType === 'advertiser') {
      // Campaigns statistics
      const campaignsResponse = await fetch(
        `${supabaseUrl}/rest/v1/campaigns?advertiser_id=eq.${userId}&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      if (campaignsResponse.ok) {
        const campaigns = await campaignsResponse.json()
        
        analytics.campaigns = {
          total: campaigns.length,
          active: campaigns.filter((c: any) => c.status === 'active').length,
          paused: campaigns.filter((c: any) => c.status === 'paused').length,
          completed: campaigns.filter((c: any) => c.status === 'completed').length,
          draft: campaigns.filter((c: any) => c.status === 'draft').length,
          totalBudget: campaigns.reduce((sum: number, c: any) => sum + (c.budget?.value || 0), 0),
        }
      }

      // Placements statistics
      const placementsResponse = await fetch(
        `${supabaseUrl}/rest/v1/placements?select=*,campaigns!inner(advertiser_id)&campaigns.advertiser_id=eq.${userId}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      if (placementsResponse.ok) {
        const placements = await placementsResponse.json()
        
        analytics.placements = {
          total: placements.length,
          proposal: placements.filter((p: any) => p.status === 'proposal').length,
          booked: placements.filter((p: any) => p.status === 'booked').length,
          in_progress: placements.filter((p: any) => p.status === 'in_progress').length,
          posted: placements.filter((p: any) => p.status === 'posted').length,
          approved: placements.filter((p: any) => p.status === 'approved').length,
          rejected: placements.filter((p: any) => p.status === 'rejected').length,
          totalSpent: placements
            .filter((p: any) => p.status === 'approved')
            .reduce((sum: number, p: any) => sum + (p.unit_price?.value || 0), 0),
          avgPrice: placements.length > 0
            ? placements.reduce((sum: number, p: any) => sum + (p.unit_price?.value || 0), 0) / placements.length
            : 0,
          conversionRate: placements.length > 0
            ? (placements.filter((p: any) => p.status === 'approved').length / placements.length) * 100
            : 0,
        }
      }

      // Reviews given by advertiser
      const reviewsGivenResponse = await fetch(
        `${supabaseUrl}/rest/v1/reviews?reviewer_id=eq.${userId}&reviewer_type=eq.advertiser&is_approved=eq.true&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      if (reviewsGivenResponse.ok) {
        const reviewsGiven = await reviewsGivenResponse.json()
        
        analytics.reviews.given = {
          total: reviewsGiven.length,
          avgRating: reviewsGiven.length > 0
            ? reviewsGiven.reduce((sum: number, r: any) => sum + r.overall_rating, 0) / reviewsGiven.length
            : 0,
        }
      }

      // Reviews received by advertiser
      const reviewsReceivedResponse = await fetch(
        `${supabaseUrl}/rest/v1/reviews?reviewee_id=eq.${userId}&reviewee_type=eq.advertiser&is_approved=eq.true&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      if (reviewsReceivedResponse.ok) {
        const reviewsReceived = await reviewsReceivedResponse.json()
        
        analytics.reviews.received = {
          total: reviewsReceived.length,
          avgRating: reviewsReceived.length > 0
            ? reviewsReceived.reduce((sum: number, r: any) => sum + r.overall_rating, 0) / reviewsReceived.length
            : 0,
        }
      }
    } else if (userType === 'creator') {
      // Get creator's channels
      const channelsResponse = await fetch(
        `${supabaseUrl}/rest/v1/channels?owner_user_id=eq.${userId}&select=id`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      let channelIds: string[] = []
      if (channelsResponse.ok) {
        const channels = await channelsResponse.json()
        channelIds = channels.map((c: any) => c.id)
      }

      if (channelIds.length > 0) {
        // Placements for creator's channels
        const placementsResponse = await fetch(
          `${supabaseUrl}/rest/v1/placements?channel_id=in.(${channelIds.join(',')})&select=*`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        )

        if (placementsResponse.ok) {
          const placements = await placementsResponse.json()
          
          analytics.placements = {
            total: placements.length,
            proposal: placements.filter((p: any) => p.status === 'proposal').length,
            booked: placements.filter((p: any) => p.status === 'booked').length,
            in_progress: placements.filter((p: any) => p.status === 'in_progress').length,
            posted: placements.filter((p: any) => p.status === 'posted').length,
            approved: placements.filter((p: any) => p.status === 'approved').length,
            rejected: placements.filter((p: any) => p.status === 'rejected').length,
            totalEarned: placements
              .filter((p: any) => p.status === 'approved')
              .reduce((sum: number, p: any) => sum + (p.unit_price?.value || 0), 0),
            avgEarnings: placements.filter((p: any) => p.status === 'approved').length > 0
              ? placements
                  .filter((p: any) => p.status === 'approved')
                  .reduce((sum: number, p: any) => sum + (p.unit_price?.value || 0), 0) /
                placements.filter((p: any) => p.status === 'approved').length
              : 0,
            completionRate: placements.length > 0
              ? (placements.filter((p: any) => p.status === 'approved').length / placements.filter((p: any) => p.status !== 'proposal' && p.status !== 'rejected').length) * 100
              : 0,
          }
        }

        // Reviews received by creator
        const reviewsReceivedResponse = await fetch(
          `${supabaseUrl}/rest/v1/reviews?reviewee_id=eq.${userId}&reviewee_type=eq.creator&is_approved=eq.true&select=*`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        )

        if (reviewsReceivedResponse.ok) {
          const reviewsReceived = await reviewsReceivedResponse.json()
          
          analytics.reviews.received = {
            total: reviewsReceived.length,
            avgRating: reviewsReceived.length > 0
              ? reviewsReceived.reduce((sum: number, r: any) => sum + r.overall_rating, 0) / reviewsReceived.length
              : 0,
          }
        }

        // Reviews given by creator
        const reviewsGivenResponse = await fetch(
          `${supabaseUrl}/rest/v1/reviews?reviewer_id=eq.${userId}&reviewer_type=eq.creator&is_approved=eq.true&select=*`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        )

        if (reviewsGivenResponse.ok) {
          const reviewsGiven = await reviewsGivenResponse.json()
          
          analytics.reviews.given = {
            total: reviewsGiven.length,
            avgRating: reviewsGiven.length > 0
              ? reviewsGiven.reduce((sum: number, r: any) => sum + r.overall_rating, 0) / reviewsGiven.length
              : 0,
          }
        }
      }
    }

    // Messages statistics (for both types)
    const conversationsResponse = await fetch(
      `${supabaseUrl}/rest/v1/conversations?or=(advertiser_id.eq.${userId},creator_id.eq.${userId})&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (conversationsResponse.ok) {
      const conversations = await conversationsResponse.json()
      
      const unreadCount = userType === 'advertiser'
        ? conversations.reduce((sum: number, c: any) => sum + c.unread_count_advertiser, 0)
        : conversations.reduce((sum: number, c: any) => sum + c.unread_count_creator, 0)

      analytics.messages = {
        totalConversations: conversations.length,
        unreadCount,
        activeConversations: conversations.filter((c: any) => c.last_message_at).length,
      }
    }

    return NextResponse.json({
      success: true,
      analytics,
    })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
