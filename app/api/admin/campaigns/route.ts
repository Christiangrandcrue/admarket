/**
 * API Route: Admin Campaigns List
 * GET /api/admin/campaigns
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-middleware'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const supabase = await createClient()

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        advertiser:users!campaigns_advertiser_id_fkey(
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ campaigns: campaigns || [] })
  } catch (error: any) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
