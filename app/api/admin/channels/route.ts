/**
 * API Route: Admin Channels List
 * GET /api/admin/channels
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

    // Get all channels with creator info
    const { data: channels, error } = await supabase
      .from('channels')
      .select(`
        *,
        creator:users!channels_creator_id_fkey(
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ channels: channels || [] })
  } catch (error: any) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}
