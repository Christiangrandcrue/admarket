import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Telegram Bot Webhook Handler
 * Receives updates from Telegram bot
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle /start command
    if (body.message?.text?.startsWith('/start')) {
      const chatId = body.message.chat.id
      const username = body.message.chat.username
      const firstName = body.message.chat.first_name

      // Extract verification code from /start command
      // Format: /start VERIFICATION_CODE
      const parts = body.message.text.split(' ')
      const verificationCode = parts[1]

      if (verificationCode) {
        // User clicked link with verification code
        // Save chat_id to user profile using helper function
        const supabase = await createClient()

        const { error } = await supabase.rpc('update_user_telegram', {
          p_user_id: verificationCode, // verification code IS user_id for simplicity
          p_telegram_chat_id: chatId.toString(),
          p_telegram_username: username || null,
        })

        if (error) {
          console.error('Error connecting Telegram:', error)
          
          // Send error message
          await sendTelegramMessage(chatId, 'Ошибка подключения. Попробуйте еще раз через настройки профиля.')
        } else {
          // Send success message
          await sendTelegramMessage(
            chatId,
            `✅ Telegram подключен успешно!\\n\\nПривет, ${firstName}! Теперь вы будете получать уведомления от AdMarket прямо в Telegram.`
          )
        }
      } else {
        // No verification code, send instructions
        await sendTelegramMessage(
          chatId,
          `👋 Привет, ${firstName}!\\n\\nЧтобы подключить уведомления AdMarket:\\n\\n1. Войдите в свой аккаунт на сайте\\n2. Перейдите в Настройки профиля\\n3. Нажмите "Подключить Telegram"\\n4. Нажмите на ссылку\\n\\nПосле этого вы будете получать все уведомления здесь! 🔔`
        )
      }

      return NextResponse.json({ ok: true })
    }

    // Handle other messages
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

/**
 * Helper to send message via Telegram API
 */
async function sendTelegramMessage(chatId: number, text: string) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  
  if (!TELEGRAM_BOT_TOKEN) {
    return
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    })
  } catch (error) {
    console.error('Error sending Telegram message:', error)
  }
}
