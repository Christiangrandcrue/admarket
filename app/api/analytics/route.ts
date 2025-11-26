import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Helper function to get last N months
function getLastNMonths(n: number) {
  const months = []
  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
  const now = new Date()
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: monthNames[date.getMonth()],
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    })
  }
  
  return months
}

// Helper function to group placements by month
function groupPlacementsByMonth(placements: any[], months: any[]) {
  const timeline = months.map(m => ({
    date: m.label,
    created: 0,
    approved: 0,
    completed: 0,
  }))

  placements.forEach((p: any) => {
    const createdDate = new Date(p.created_at)
    const createdKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`
    const createdIndex = months.findIndex(m => m.key === createdKey)
    
    if (createdIndex !== -1) {
      timeline[createdIndex].created++
      
      if (p.status === 'approved') {
        timeline[createdIndex].completed++
        // Count as approved in the same month for simplicity
        timeline[createdIndex].approved++
      } else if (['booked', 'in_progress', 'posted'].includes(p.status)) {
        timeline[createdIndex].approved++
      }
    }
  })

  return timeline
}

// Helper function to calculate revenue/expense by month
function calculateRevenueExpenseByMonth(placements: any[], months: any[]) {
  const data = months.map(m => ({
    month: m.label,
    revenue: 0,
    expense: 0,
  }))

  placements.forEach((p: any) => {
    if (p.status === 'approved' && p.unit_price?.value) {
      const createdDate = new Date(p.created_at)
      const createdKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`
      const createdIndex = months.findIndex(m => m.key === createdKey)
      
      if (createdIndex !== -1) {
        // Value is in cents/kopeks, keep as is for chart
        data[createdIndex].revenue += p.unit_price.value * 100 // Convert to kopeks
        data[createdIndex].expense += p.unit_price.value * 100
      }
    }
  })

  return data
}

// GET /api/analytics - Get analytics data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const userType = searchParams.get('user_type') // 'advertiser' or 'creator'
    const includeCharts = searchParams.get('include_charts') === 'true' // Include chart data

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

    // Chart data will be added if requested
    if (includeCharts) {
      analytics.charts = {
        placementsTimeline: [],
        placementsStatus: [],
        revenueExpense: [],
      }
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

        // Generate chart data if requested
        if (includeCharts) {
          const months = getLastNMonths(6)
          
          // Timeline chart
          analytics.charts.placementsTimeline = groupPlacementsByMonth(placements, months)
          
          // Status distribution chart
          analytics.charts.placementsStatus = [
            { name: 'Предложения', value: analytics.placements.proposal, color: '#6b7280' },
            { name: 'Забронировано', value: analytics.placements.booked, color: '#3b82f6' },
            { name: 'В работе', value: analytics.placements.in_progress, color: '#f59e0b' },
            { name: 'Опубликовано', value: analytics.placements.posted, color: '#10b981' },
            { name: 'Одобрено', value: analytics.placements.approved, color: '#059669' },
            { name: 'Отклонено', value: analytics.placements.rejected, color: '#ef4444' },
          ].filter(item => item.value > 0)
          
          // Revenue/Expense chart
          analytics.charts.revenueExpense = calculateRevenueExpenseByMonth(placements, months)
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

          // Generate chart data if requested
          if (includeCharts) {
            const months = getLastNMonths(6)
            
            // Timeline chart
            analytics.charts.placementsTimeline = groupPlacementsByMonth(placements, months)
            
            // Status distribution chart
            analytics.charts.placementsStatus = [
              { name: 'Предложения', value: analytics.placements.proposal, color: '#6b7280' },
              { name: 'Забронировано', value: analytics.placements.booked, color: '#3b82f6' },
              { name: 'В работе', value: analytics.placements.in_progress, color: '#f59e0b' },
              { name: 'Опубликовано', value: analytics.placements.posted, color: '#10b981' },
              { name: 'Одобрено', value: analytics.placements.approved, color: '#059669' },
              { name: 'Отклонено', value: analytics.placements.rejected, color: '#ef4444' },
            ].filter(item => item.value > 0)
            
            // Revenue/Expense chart
            analytics.charts.revenueExpense = calculateRevenueExpenseByMonth(placements, months)
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
