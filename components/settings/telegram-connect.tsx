'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'

export function TelegramConnect() {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  // Check connection status
  useEffect(() => {
    if (!user) return

    checkConnection()
  }, [user])

  async function checkConnection() {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('telegram_chat_id, telegram_username')
        .eq('id', user?.id)
        .single()

      if (data?.telegram_chat_id) {
        setIsConnected(true)
        setTelegramUsername(data.telegram_username)
      }
    } catch (error) {
      console.error('Error checking Telegram connection:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect() {
    try {
      setConnecting(true)

      // Get connection link from API
      const response = await fetch('/api/telegram/connect')
      const data = await response.json()

      if (data.link) {
        // Open Telegram link in new window
        window.open(data.link, '_blank')

        // Poll for connection status
        const pollInterval = setInterval(async () => {
          await checkConnection()
          
          // Check if connected
          const supabase = createClient()
          const { data: userData } = await supabase
            .from('users')
            .select('telegram_chat_id')
            .eq('id', user?.id)
            .single()

          if (userData?.telegram_chat_id) {
            setIsConnected(true)
            clearInterval(pollInterval)
            setConnecting(false)
          }
        }, 3000)

        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval)
          setConnecting(false)
        }, 120000)
      }
    } catch (error) {
      console.error('Error connecting Telegram:', error)
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    if (!confirm('Отключить Telegram? Вы перестанете получать уведомления в Telegram.')) {
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/telegram/connect', {
        method: 'DELETE',
      })

      if (response.ok) {
        setIsConnected(false)
        setTelegramUsername(null)
      }
    } catch (error) {
      console.error('Error disconnecting Telegram:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Telegram уведомления</h3>
            {isConnected && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                ✓ Подключено
              </span>
            )}
          </div>
          
          <p className="mt-1 text-sm text-gray-600">
            Получайте уведомления о новых заявках, платежах и других важных событиях прямо в Telegram
          </p>

          {isConnected && telegramUsername && (
            <p className="mt-2 text-sm text-gray-500">
              Подключён: @{telegramUsername}
            </p>
          )}
        </div>

        <div className="ml-4">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Отключить
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {connecting ? 'Ожидание...' : 'Подключить'}
            </button>
          )}
        </div>
      </div>

      {connecting && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            🤖 Откройте Telegram и нажмите кнопку <strong>START</strong> в боте
          </p>
          <p className="mt-1 text-xs text-blue-600">
            После этого вернитесь сюда — подключение произойдёт автоматически
          </p>
        </div>
      )}

      {!isConnected && !connecting && (
        <div className="mt-4 space-y-2 text-sm text-gray-500">
          <p className="font-medium">Как подключить:</p>
          <ol className="ml-4 list-decimal space-y-1">
            <li>Нажмите кнопку "Подключить"</li>
            <li>В Telegram нажмите START в боте</li>
            <li>Готово! Уведомления будут приходить в Telegram</li>
          </ol>
        </div>
      )}
    </div>
  )
}
