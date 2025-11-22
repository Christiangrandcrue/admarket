import { createClient } from '@/lib/supabase/server'
import { NotificationType } from '@/types'

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

    return data as string
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}
