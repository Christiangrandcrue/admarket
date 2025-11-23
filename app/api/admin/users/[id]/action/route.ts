/**
 * API Route: User Actions (Suspend/Ban/Activate)
 * PATCH /api/admin/users/[id]/action
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
    const { action, reason } = body

    if (!action || !['suspend', 'ban', 'activate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: oldUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    let updateData: any = {}

    if (action === 'suspend') {
      const suspendUntil = new Date()
      suspendUntil.setDate(suspendUntil.getDate() + 30) // 30 days

      updateData = {
        status: 'suspended',
        suspended_until: suspendUntil.toISOString(),
        suspension_reason: reason || 'Suspended by admin',
      }
    } else if (action === 'ban') {
      updateData = {
        status: 'banned',
        banned_at: new Date().toISOString(),
        ban_reason: reason || 'Banned by admin',
        banned_by: user.id,
      }
    } else if (action === 'activate') {
      updateData = {
        status: 'active',
        suspended_until: null,
        suspension_reason: null,
        banned_at: null,
        ban_reason: null,
        banned_by: null,
      }
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await logAdminAction({
      action: `user_${action}`,
      entityType: 'user',
      entityId: id,
      oldValues: { status: oldUser?.status },
      newValues: { status: updateData.status },
      notes: reason,
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${action}d successfully`,
    })
  } catch (error: any) {
    console.error('Error performing user action:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform action' },
      { status: 500 }
    )
  }
}
