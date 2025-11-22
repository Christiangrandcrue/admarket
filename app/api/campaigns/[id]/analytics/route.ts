import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Get campaign to verify ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (campaignError) throw campaignError

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify user owns this campaign
    if (campaign.advertiser_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You do not own this campaign.' },
        { status: 403 }
      )
    }

    // Get all placements for this campaign with channel data
    const { data: placements, error: placementsError } = await supabase
      .from('placements')
      .select(`
        *,
        channel:channels!placements_channel_id_fkey(
          id,
          title,
          platform,
          followers_count,
          avg_views,
          engagement_rate
        )
      `)
      .eq('campaign_id', id)

    if (placementsError) throw placementsError

    // Generate mock analytics data based on placements
    // In production, this would query the analytics_events table
    const now = new Date()
    const campaignStart = new Date(campaign.start_date)
    const daysActive = Math.max(1, Math.floor((now.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Generate daily data for the last 30 days or campaign duration
    const daysToShow = Math.min(30, daysActive)
    const dailyData = []
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Calculate metrics based on approved placements
      const approvedPlacements = placements?.filter(p => 
        p.status === 'accepted' && 
        p.content_status === 'approved' &&
        new Date(p.accepted_at || campaign.start_date) <= date
      ) || []

      const totalReach = approvedPlacements.reduce((sum, p) => {
        const channel = p.channel as any
        return sum + (channel?.followers_count || 0)
      }, 0)

      // Generate realistic mock metrics
      const impressions = Math.floor(totalReach * (0.3 + Math.random() * 0.4)) // 30-70% reach
      const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.04)) // 1-5% CTR
      const conversions = Math.floor(clicks * (0.02 + Math.random() * 0.08)) // 2-10% conversion rate

      dailyData.push({
        date: date.toISOString().split('T')[0],
        impressions,
        clicks,
        conversions,
        reach: totalReach,
      })
    }

    // Calculate overall metrics
    const totalImpressions = dailyData.reduce((sum, d) => sum + d.impressions, 0)
    const totalClicks = dailyData.reduce((sum, d) => sum + d.clicks, 0)
    const totalConversions = dailyData.reduce((sum, d) => sum + d.conversions, 0)
    const totalReach = Math.max(...dailyData.map(d => d.reach))

    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00'
    
    // Calculate CPM, CPC, CPA
    const cpm = totalImpressions > 0 ? ((campaign.total_budget / totalImpressions) * 1000).toFixed(2) : '0.00'
    const cpc = totalClicks > 0 ? (campaign.total_budget / totalClicks).toFixed(2) : '0.00'
    const cpa = totalConversions > 0 ? (campaign.total_budget / totalConversions).toFixed(2) : '0.00'

    // Performance by channel
    const channelPerformance = (placements || [])
      .filter(p => p.status === 'accepted')
      .map((placement) => {
        const channel = placement.channel as any
        const reach = channel?.followers_count || 0
        const impressions = Math.floor(reach * (0.3 + Math.random() * 0.4))
        const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.04))
        const conversions = Math.floor(clicks * (0.02 + Math.random() * 0.08))
        
        return {
          placement_id: placement.id,
          channel_id: channel?.id,
          channel_title: placement.channel_title,
          platform: channel?.platform,
          followers: reach,
          engagement_rate: channel?.engagement_rate || 0,
          budget: placement.budget,
          impressions,
          clicks,
          conversions,
          ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00',
          cpa: conversions > 0 ? (placement.budget / conversions).toFixed(2) : '0.00',
          roi: conversions > 0 ? (((conversions * 1000) - placement.budget) / placement.budget * 100).toFixed(2) : '0.00', // Assuming avg order value 1000
          content_status: placement.content_status,
        }
      })
      .sort((a, b) => b.impressions - a.impressions) // Sort by impressions

    // Calculate estimated ROI
    // Assuming average order value of 1000 RUB
    const avgOrderValue = 1000
    const revenue = totalConversions * avgOrderValue
    const roi = campaign.total_budget > 0 
      ? (((revenue - campaign.total_budget) / campaign.total_budget) * 100).toFixed(2)
      : '0.00'

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalImpressions,
          totalClicks,
          totalConversions,
          totalReach,
          ctr: parseFloat(ctr),
          conversionRate: parseFloat(conversionRate),
          cpm: parseFloat(cpm),
          cpc: parseFloat(cpc),
          cpa: parseFloat(cpa),
        },
        roi: {
          budget: campaign.total_budget,
          revenue,
          profit: revenue - campaign.total_budget,
          roi: parseFloat(roi),
          avgOrderValue,
        },
        daily: dailyData,
        channelPerformance,
        campaign: {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          total_budget: campaign.total_budget,
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
