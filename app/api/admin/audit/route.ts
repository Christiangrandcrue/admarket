/**
 * API Route: Admin Audit Logs
 * GET /api/admin/audit
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-middleware'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const supabase = await createClient()

    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        admin:users!audit_logs_admin_id_fkey(
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ logs: logs || [] })
  } catch (error: any) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
