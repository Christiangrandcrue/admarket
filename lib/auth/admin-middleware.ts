/**
 * Admin Middleware
 * Protects admin routes and provides admin utilities
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return false
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    return userData?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Require admin role for API routes
 */
export async function requireAdmin(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden. Admin access required.' },
      { status: 403 }
    )
  }

  if (userData.status !== 'active') {
    return NextResponse.json(
      { error: 'Account suspended or banned' },
      { status: 403 }
    )
  }

  return null // No error, proceed
}

/**
 * Log admin action
 */
export async function logAdminAction(params: {
  action: string
  entityType: string
  entityId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  notes?: string
}) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.warn('Cannot log admin action: No user')
      return
    }

    await supabase.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action: params.action,
      p_entity_type: params.entityType,
      p_entity_id: params.entityId || null,
      p_old_values: params.oldValues || null,
      p_new_values: params.newValues || null,
      p_notes: params.notes || null,
    })

    console.log(`✅ Admin action logged: ${params.action} on ${params.entityType}`)
  } catch (error) {
    console.error('Error logging admin action:', error)
  }
}

/**
 * Get platform settings
 */
export async function getPlatformSettings() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')

    if (error) throw error

    // Convert to key-value object
    const settings: Record<string, any> = {}
    data?.forEach((setting) => {
      settings[setting.key] = setting.value
    })

    return settings
  } catch (error) {
    console.error('Error getting platform settings:', error)
    return {}
  }
}

/**
 * Update platform setting
 */
export async function updatePlatformSetting(
  key: string,
  value: any
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { error } = await supabase
      .from('platform_settings')
      .update({
        value,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)

    if (error) throw error

    await logAdminAction({
      action: 'update_setting',
      entityType: 'platform_settings',
      entityId: key,
      newValues: { [key]: value },
    })

    return true
  } catch (error) {
    console.error('Error updating platform setting:', error)
    return false
  }
}
