import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
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

    // Get user's channels (try both creator_id and owner_user_id)
    let channels: any[] = []
    let channelsError: any = null
    
    // Try with creator_id first
    const result1 = await supabase
      .from('channels')
      .select('id')
      .eq('creator_id', user.id)
    
    if (result1.error && result1.error.message.includes('does not exist')) {
      // If creator_id doesn't exist, try owner_user_id
      const result2 = await supabase
        .from('channels')
        .select('id')
        .eq('owner_user_id', user.id)
      
      channels = result2.data || []
      channelsError = result2.error
    } else {
      channels = result1.data || []
      channelsError = result1.error
    }

    if (channelsError) {
      console.error('Channels error:', channelsError)
      // Return empty stats instead of throwing
      return NextResponse.json({
        success: true,
        stats: {
          totalEarned: 0,
          pendingPayout: 0,
          availableForWithdrawal: 0,
          completedPlacements: 0,
          activePlacements: 0,
        },
        transactions: [],
        message: 'Database error',
        source: 'fallback',
      })
    }

    if (!channels || channels.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          totalEarned: 0,
          pendingPayout: 0,
          availableForWithdrawal: 0,
          completedPlacements: 0,
          activePlacements: 0,
        },
        transactions: [],
        message: 'No channels found',
      })
    }

    const channelIds = channels.map((c) => c.id)

    // Get all placements for user's channels
    const { data: placements, error: placementsError } = await supabase
      .from('placements')
      .select('id, status, budget, accepted_at, completed_at, channel_id')
      .in('channel_id', channelIds)

    if (placementsError) throw placementsError

    // Calculate earnings
    const completedPlacements = placements?.filter((p) => p.status === 'completed') || []
    const acceptedPlacements = placements?.filter((p) => p.status === 'accepted') || []
    
    // Total earned from completed placements
    const totalEarned = completedPlacements.reduce((sum, p) => sum + (p.budget || 0), 0)
    
    // Pending payout from accepted placements (not yet completed)
    const pendingPayout = acceptedPlacements.reduce((sum, p) => sum + (p.budget || 0), 0)

    // Available for withdrawal (completed but not yet withdrawn)
    // In real implementation, this would check escrow/payment status
    const availableForWithdrawal = totalEarned

    // Get transaction history (completed placements as transactions)
    const transactions = completedPlacements.map((p) => ({
      id: p.id,
      type: 'payout',
      amount: p.budget || 0,
      status: 'completed',
      date: p.completed_at || p.accepted_at,
      placement_id: p.id,
    }))

    return NextResponse.json({
      success: true,
      stats: {
        totalEarned,
        pendingPayout,
        availableForWithdrawal,
        completedPlacements: completedPlacements.length,
        activePlacements: acceptedPlacements.length,
      },
      transactions: transactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    })
  } catch (error: any) {
    console.error('Error fetching earnings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}
