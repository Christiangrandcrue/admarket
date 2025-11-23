import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Generate Telegram connection link for user
 * GET /api/telegram/connect
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate bot link with user_id as verification code
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'admarket_notify_bot'
    const verificationCode = user.id
    const telegramLink = `https://t.me/${botUsername}?start=${verificationCode}`

    return NextResponse.json({
      link: telegramLink,
      botUsername,
    })
  } catch (error) {
    console.error('Error generating Telegram link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Disconnect Telegram from user account
 * DELETE /api/telegram/connect
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove telegram connection
    const { error } = await supabase
      .from('users')
      .update({
        telegram_chat_id: null,
        telegram_username: null,
        telegram_connected_at: null,
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error disconnecting Telegram:', error)
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in disconnect:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
