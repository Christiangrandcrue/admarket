/**
 * Telegram Bot API Client
 * Sends notifications to users via Telegram
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

interface SendMessageParams {
  chatId: string
  text: string
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disableWebPagePreview?: boolean
  replyMarkup?: {
    inline_keyboard?: Array<Array<{
      text: string
      url?: string
      callback_data?: string
    }>>
  }
}

/**
 * Send message to Telegram chat
 */
export async function sendTelegramMessage(params: SendMessageParams): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not configured, skipping Telegram notification')
    return false
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.text,
        parse_mode: params.parseMode || 'HTML',
        disable_web_page_preview: params.disableWebPagePreview || false,
        reply_markup: params.replyMarkup,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Telegram API error:', data)
      return false
    }

    console.log('✅ Telegram message sent successfully')
    return true
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error)
    return false
  }
}

/**
 * Format notification for Telegram
 */
export function formatTelegramNotification(
  type: string,
  title: string,
  message: string,
  actionUrl?: string
): { text: string; replyMarkup?: SendMessageParams['replyMarkup'] } {
  // Icon mapping for notification types
  const icons: Record<string, string> = {
    placement_accepted: '✅',
    placement_rejected: '❌',
    new_placement_request: '🎯',
    content_uploaded: '📤',
    content_approved: '✅',
    content_revision_requested: '🔄',
    campaign_completed: '🎉',
    payment_received: '💰',
    payment_sent: '💸',
  }

  const icon = icons[type] || '🔔'

  // Format message with HTML
  let text = `${icon} <b>${title}</b>\n\n${message}`

  // Add inline button if action URL provided
  let replyMarkup: SendMessageParams['replyMarkup'] | undefined

  if (actionUrl) {
    replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '👀 Открыть',
            url: actionUrl,
          },
        ],
      ],
    }
  }

  return { text, replyMarkup }
}

/**
 * Get bot info (for testing)
 */
export async function getTelegramBotInfo() {
  if (!TELEGRAM_BOT_TOKEN) {
    return null
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/getMe`)
    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Error getting bot info:', error)
    return null
  }
}

/**
 * Set webhook for Telegram bot
 */
export async function setTelegramWebhook(webhookUrl: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    return false
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
      }),
    })

    const data = await response.json()
    return data.ok
  } catch (error) {
    console.error('Error setting webhook:', error)
    return false
  }
}
