/**
 * Stripe Payment Form
 * Used by advertisers to pay for campaigns
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2, CheckCircle } from 'lucide-react'
import { getStripe, formatAmount } from '@/lib/stripe/client'
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

interface PaymentFormProps {
  campaignId: string
  amount: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

function CheckoutForm({
  campaignId,
  amount,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/campaigns/${campaignId}?payment=success`,
        },
      })

      if (error) {
        setErrorMessage(error.message || 'Ошибка оплаты')
        onError?.(error.message || 'Ошибка оплаты')
      } else {
        onSuccess?.()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка оплаты')
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-purple-600 hover:bg-purple-700"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Обработка платежа...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Оплатить {formatAmount(amount * 100, 'RUB')}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-gray-500">
        Безопасная оплата через Stripe. Средства будут удержаны до публикации контента.
      </p>
    </form>
  )
}

export function PaymentForm({
  campaignId,
  amount,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create Payment Intent
    async function createPaymentIntent() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/stripe/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create payment intent')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (err: any) {
        setError(err.message || 'Ошибка создания платежа')
        onError?.(err.message)
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [campaignId, onError])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="text-red-800">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Попробовать снова
        </Button>
      </div>
    )
  }

  if (!clientSecret) {
    return null
  }

  const stripePromise = getStripe()

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-purple-100 p-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Оплата кампании</h3>
            <p className="text-sm text-gray-600">
              Безопасная оплата с эскроу-защитой
            </p>
          </div>
        </div>
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#9333ea',
              colorBackground: '#ffffff',
              colorText: '#1f2937',
              colorDanger: '#ef4444',
              borderRadius: '8px',
            },
          },
        }}
      >
        <CheckoutForm
          campaignId={campaignId}
          amount={amount}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </div>
  )
}
