/**
 * Stripe Client-side utilities
 * For use in React components
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.warn('⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
}

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Get Stripe.js instance (singleton pattern)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
    )
  }
  return stripePromise
}

/**
 * Format amount for display (cents to rubles)
 */
export function formatAmount(cents: number, currency: string = 'RUB'): string {
  const amount = cents / 100

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Payment status badge colors
 */
export function getPaymentStatusColor(status: string): {
  bg: string
  text: string
  label: string
} {
  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    not_paid: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Не оплачено' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Обработка' },
    succeeded: { bg: 'bg-green-100', text: 'text-green-700', label: 'Оплачено' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ошибка' },
    refunded: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Возврат' },
  }

  return statusMap[status] || statusMap.not_paid
}

/**
 * Payout status badge colors
 */
export function getPayoutStatusColor(status: string): {
  bg: string
  text: string
  label: string
} {
  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Ожидает' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Обработка' },
    paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Выплачено' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ошибка' },
    refunded: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Возврат' },
  }

  return statusMap[status] || statusMap.pending
}

/**
 * Stripe account status badge colors
 */
export function getStripeAccountStatusColor(status: string): {
  bg: string
  text: string
  label: string
} {
  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    not_connected: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Не подключен' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'На проверке' },
    connected: { bg: 'bg-green-100', text: 'text-green-700', label: 'Подключен' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Отклонен' },
  }

  return statusMap[status] || statusMap.not_connected
}
