/**
 * API Route: Moderate Campaign
 * PATCH /api/admin/campaigns/[id]/moderate
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, logAdminAction } from '@/lib/auth/admin-middleware'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, notes } = body

    if (!action || !['approve', 'reject', 'flag'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const { data: oldCampaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      flag: 'flagged',
    }

    const newStatus = statusMap[action]

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        moderation_status: newStatus,
        moderation_notes: notes || null,
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await logAdminAction({
      action: `moderate_campaign_${action}`,
      entityType: 'campaign',
      entityId: id,
      oldValues: { moderation_status: oldCampaign?.moderation_status },
      newValues: { moderation_status: newStatus },
      notes,
    })

    return NextResponse.json({
      success: true,
      campaign,
      message: `Campaign ${action}d successfully`,
    })
  } catch (error: any) {
    console.error('Error moderating campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to moderate campaign' },
      { status: 500 }
    )
  }
}
