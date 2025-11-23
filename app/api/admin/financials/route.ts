/**
 * API Route: Admin Financial Reports
 * GET /api/admin/financials
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-middleware'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get GMV and Revenue
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('total_budget, platform_fee, payment_status, created_at')
      .eq('payment_status', 'succeeded')
      .gte('created_at', startDate.toISOString())

    const gmv = campaigns?.reduce((sum, c) => sum + (c.total_budget || 0), 0) || 0
    const revenue = campaigns?.reduce((sum, c) => sum + (c.platform_fee || 0), 0) || 0

    // Get Payouts
    const { data: placements } = await supabase
      .from('placements')
      .select('payout_amount, payout_status')
      .gte('created_at', startDate.toISOString())

    const payouts = placements
      ?.filter((p) => p.payout_status === 'paid')
      .reduce((sum, p) => sum + (p.payout_amount || 0), 0) || 0

    const pendingPayouts = placements
      ?.filter((p) => p.payout_status === 'pending' || p.payout_status === 'processing')
      .reduce((sum, p) => sum + (p.payout_amount || 0), 0) || 0

    // Calculate AOV
    const averageOrderValue = campaigns && campaigns.length > 0 ? gmv / campaigns.length : 0

    // Get Previous Period for Growth
    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - days)

    const { data: prevCampaigns } = await supabase
      .from('campaigns')
      .select('total_budget, platform_fee')
      .eq('payment_status', 'succeeded')
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    const prevGmv = prevCampaigns?.reduce((sum, c) => sum + (c.total_budget || 0), 0) || 0
    const prevRevenue = prevCampaigns?.reduce((sum, c) => sum + (c.platform_fee || 0), 0) || 0

    const gmvGrowth = prevGmv > 0 ? ((gmv - prevGmv) / prevGmv) * 100 : 0
    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0
    const campaignsGrowth = prevCampaigns && prevCampaigns.length > 0
      ? (((campaigns?.length || 0) - prevCampaigns.length) / prevCampaigns.length) * 100
      : 0

    // Get Transaction Stats
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', startDate.toISOString())

    const totalTransactions = transactions?.length || 0
    const successfulPayments = transactions?.filter((t) => t.status === 'succeeded').length || 0
    const failedPayments = transactions?.filter((t) => t.status === 'failed').length || 0
    const refunds = transactions?.filter((t) => t.type === 'refund').length || 0

    // Get Recent Transactions
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select(`
        *,
        user:users!transactions_user_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    const formattedTransactions = recentTransactions?.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      user_name: (tx.user as any)?.name || 'Unknown',
      created_at: tx.created_at,
    })) || []

    return NextResponse.json({
      overview: {
        gmv,
        revenue,
        payouts,
        pendingPayouts,
        averageOrderValue,
        platformFeeRate: 10,
      },
      growth: {
        gmvGrowth,
        revenueGrowth,
        campaignsGrowth,
      },
      transactions: {
        totalTransactions,
        successfulPayments,
        failedPayments,
        refunds,
      },
      recentTransactions: formattedTransactions,
    })
  } catch (error: any) {
    console.error('Error fetching financials:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch financials' },
      { status: 500 }
    )
  }
}
