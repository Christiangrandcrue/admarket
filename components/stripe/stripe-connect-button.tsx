/**
 * Stripe Connect Onboarding Button
 * Used by creators to connect their Stripe account
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface StripeConnectStatus {
  connected: boolean
  status: string
  chargesEnabled?: boolean
  payoutsEnabled?: boolean
  requiresAction?: boolean
}

export function StripeConnectButton({
  initialStatus,
  onStatusChange,
}: {
  initialStatus?: StripeConnectStatus
  onStatusChange?: (status: StripeConnectStatus) => void
}) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<StripeConnectStatus>(
    initialStatus || { connected: false, status: 'not_connected' }
  )

  async function handleConnect() {
    try {
      setLoading(true)

      // Create onboarding link
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create onboarding link')
      }

      const data = await response.json()

      // Redirect to Stripe onboarding
      window.location.href = data.url
    } catch (error: any) {
      console.error('Error connecting Stripe:', error)
      alert('Ошибка подключения Stripe. Попробуйте позже.')
      setLoading(false)
    }
  }

  async function refreshStatus() {
    try {
      setLoading(true)

      const response = await fetch('/api/stripe/connect/status')
      if (!response.ok) {
        throw new Error('Failed to fetch status')
      }

      const data = await response.json()
      setStatus(data)
      onStatusChange?.(data)
    } catch (error) {
      console.error('Error fetching Stripe status:', error)
    } finally {
      setLoading(false)
    }
  }

  // Status badges
  const statusConfig = {
    not_connected: {
      icon: AlertCircle,
      text: 'Не подключен',
      color: 'text-gray-600',
      bg: 'bg-gray-100',
    },
    pending: {
      icon: AlertCircle,
      text: 'На проверке',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    connected: {
      icon: CheckCircle,
      text: 'Подключен',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    rejected: {
      icon: AlertCircle,
      text: 'Отклонен',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  }

  const config = statusConfig[status.status as keyof typeof statusConfig] || statusConfig.not_connected
  const StatusIcon = config.icon

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="rounded-full bg-purple-100 p-3">
            <CreditCard className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Stripe Connect</h3>
            <p className="mt-1 text-sm text-gray-600">
              Подключите ваш банковский счёт для получения выплат
            </p>

            <div className={`mt-3 inline-flex items-center space-x-2 rounded-full px-3 py-1 text-sm font-medium ${config.bg} ${config.color}`}>
              <StatusIcon className="h-4 w-4" />
              <span>{config.text}</span>
            </div>

            {status.connected && (
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  {status.chargesEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span>Приём платежей: {status.chargesEnabled ? 'Включен' : 'Отключен'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {status.payoutsEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span>Выплаты: {status.payoutsEnabled ? 'Включены' : 'Отключены'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {!status.connected || status.requiresAction ? (
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка...
                </>
              ) : status.status === 'not_connected' ? (
                'Подключить Stripe'
              ) : (
                'Завершить настройку'
              )}
            </Button>
          ) : (
            <Button
              onClick={refreshStatus}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обновление...
                </>
              ) : (
                'Обновить статус'
              )}
            </Button>
          )}
        </div>
      </div>

      {status.requiresAction && status.status !== 'not_connected' && (
        <div className="mt-4 rounded-lg bg-yellow-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                Требуются дополнительные действия
              </h4>
              <p className="mt-1 text-sm text-yellow-700">
                Для активации выплат необходимо завершить верификацию в Stripe.
                Нажмите "Завершить настройку" выше.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
