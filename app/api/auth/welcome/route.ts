import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { welcomeAdvertiserEmail, welcomeCreatorEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Prepare email data
    const userName = profile.full_name || user.email?.split('@')[0] || 'Пользователь'
    const userEmail = user.email || ''
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`

    // Select template based on role
    let emailTemplate
    if (profile.role === 'advertiser') {
      emailTemplate = welcomeAdvertiserEmail({ userName, userEmail, dashboardUrl })
    } else if (profile.role === 'creator') {
      emailTemplate = welcomeCreatorEmail({ userName, userEmail, dashboardUrl })
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 })
    }

    // Send welcome email
    const result = await sendEmail({
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    })

    if (!result.success) {
      console.error('Failed to send welcome email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      provider: result.provider,
      emailId: result.id,
    })
  } catch (error: any) {
    console.error('Error in welcome email endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
