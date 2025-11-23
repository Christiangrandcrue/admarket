import { createClient } from '@/lib/supabase/server'
import { NotificationType } from '@/types'
import { sendTelegramMessage, formatTelegramNotification } from '@/lib/telegram/telegram-client'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  campaignId?: string
  placementId?: string
  channelId?: string
  actionUrl?: string
}

/**
 * Create an in-app notification for a user
 * This function uses the database helper function `create_notification`
 * which is SECURITY DEFINER so it can bypass RLS policies
 * 
 * Also sends notification to Telegram if user has connected Telegram
 */
export async function createNotification(params: CreateNotificationParams): Promise<string | null> {
  try {
    const supabase = await createClient()

    // Call the database function to create notification
    const { data, error } = await supabase.rpc('create_notification', {
      p_user_id: params.userId,
      p_type: params.type,
      p_title: params.title,
      p_message: params.message,
      p_campaign_id: params.campaignId || null,
      p_placement_id: params.placementId || null,
      p_channel_id: params.channelId || null,
      p_action_url: params.actionUrl || null,
    })

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    // Send to Telegram if user has connected (fire-and-forget)
    sendTelegramNotification(params).catch((err) => {
      console.error('Failed to send Telegram notification:', err)
    })

    return data as string
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

/**
 * Send notification to Telegram (internal helper)
 */
async function sendTelegramNotification(params: CreateNotificationParams) {
  try {
    const supabase = await createClient()

    // Get user's telegram_chat_id
    const { data: user } = await supabase
      .from('users')
      .select('telegram_chat_id')
      .eq('id', params.userId)
      .single()

    if (!user?.telegram_chat_id) {
      // User hasn't connected Telegram, skip silently
      return
    }

    // Format message for Telegram
    const { text, replyMarkup } = formatTelegramNotification(
      params.type,
      params.title,
      params.message,
      params.actionUrl
    )

    // Send message
    await sendTelegramMessage({
      chatId: user.telegram_chat_id,
      text,
      parseMode: 'HTML',
      replyMarkup,
    })
  } catch (error) {
    // Don't fail notification creation if Telegram fails
    console.error('Error in sendTelegramNotification:', error)
  }
}
