/**
 * API Route: Moderate Channel
 * PATCH /api/admin/channels/[id]/moderate
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, logAdminAction } from '@/lib/auth/admin-middleware'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin access
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { id } = await params
    const supabase = await createClient()

    // Get admin user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { action, notes } = body

    if (!action || !['approve', 'reject', 'flag'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or flag.' },
        { status: 400 }
      )
    }

    // Get current channel state
    const { data: oldChannel } = await supabase
      .from('channels')
      .select('*')
      .eq('id', id)
      .single()

    // Determine new status
    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      flag: 'flagged',
    }

    const newStatus = statusMap[action]

    // Update channel
    const { data: channel, error } = await supabase
      .from('channels')
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

    // Log admin action
    await logAdminAction({
      action: `moderate_channel_${action}`,
      entityType: 'channel',
      entityId: id,
      oldValues: { moderation_status: oldChannel?.moderation_status },
      newValues: { moderation_status: newStatus },
      notes,
    })

    // TODO: Send notification to creator
    // If approved: congratulations email
    // If rejected: explanation email with notes

    return NextResponse.json({
      success: true,
      channel,
      message: `Channel ${action}d successfully`,
    })
  } catch (error: any) {
    console.error('Error moderating channel:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to moderate channel' },
      { status: 500 }
    )
  }
}
