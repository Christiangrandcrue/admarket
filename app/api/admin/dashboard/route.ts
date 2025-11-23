/**
 * API Route: Admin Dashboard Statistics
 * GET /api/admin/dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-middleware'

export async function GET(request: NextRequest) {
  // Check admin access
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const supabase = await createClient()

    // Get users stats
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('role, status')

    if (usersError) throw usersError

    const userStats = {
      total: users?.length || 0,
      advertisers: users?.filter((u) => u.role === 'advertiser').length || 0,
      creators: users?.filter((u) => u.role === 'creator').length || 0,
      admins: users?.filter((u) => u.role === 'admin').length || 0,
      active: users?.filter((u) => u.status === 'active').length || 0,
      suspended: users?.filter((u) => u.status === 'suspended').length || 0,
    }

    // Get channels stats
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('moderation_status')

    if (channelsError) throw channelsError

    const channelStats = {
      total: channels?.length || 0,
      pending: channels?.filter((c) => c.moderation_status === 'pending').length || 0,
      approved: channels?.filter((c) => c.moderation_status === 'approved').length || 0,
      rejected: channels?.filter((c) => c.moderation_status === 'rejected').length || 0,
      flagged: channels?.filter((c) => c.moderation_status === 'flagged').length || 0,
    }

    // Get campaigns stats
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('status')

    if (campaignsError) throw campaignsError

    const campaignStats = {
      total: campaigns?.length || 0,
      active: campaigns?.filter((c) => c.status === 'active').length || 0,
      pending: campaigns?.filter((c) => c.status === 'pending').length || 0,
      completed: campaigns?.filter((c) => c.status === 'completed').length || 0,
    }

    // Get financial stats
    const { data: campaignsFinancial, error: financialError } = await supabase
      .from('campaigns')
      .select('total_budget, platform_fee')
      .eq('payment_status', 'succeeded')

    if (financialError) throw financialError

    const gmv = campaignsFinancial?.reduce((sum, c) => sum + (c.total_budget || 0), 0) || 0
    const revenue = campaignsFinancial?.reduce((sum, c) => sum + (c.platform_fee || 0), 0) || 0

    const { data: placements, error: placementsError } = await supabase
      .from('placements')
      .select('payout_amount, payout_status')

    if (placementsError) throw placementsError

    const payouts = placements
      ?.filter((p) => p.payout_status === 'paid')
      .reduce((sum, p) => sum + (p.payout_amount || 0), 0) || 0

    const pendingPayouts = placements
      ?.filter((p) => p.payout_status === 'pending' || p.payout_status === 'processing')
      .reduce((sum, p) => sum + (p.payout_amount || 0), 0) || 0

    const financialStats = {
      gmv,
      revenue,
      payouts,
      pendingPayouts,
    }

    // Get flags stats
    const { data: flags, error: flagsError } = await supabase
      .from('flags')
      .select('status')

    if (flagsError) throw flagsError

    const flagStats = {
      total: flags?.length || 0,
      pending: flags?.filter((f) => f.status === 'pending').length || 0,
      resolved: flags?.filter((f) => f.status === 'resolved').length || 0,
    }

    return NextResponse.json({
      users: userStats,
      channels: channelStats,
      campaigns: campaignStats,
      financials: financialStats,
      flags: flagStats,
    })
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
