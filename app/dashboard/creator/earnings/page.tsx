'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StripeConnectButton } from '@/components/stripe/stripe-connect-button'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Download,
} from 'lucide-react'

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  date: string
}

function CreatorEarningsContent() {
  const searchParams = useSearchParams()
  const onboardingStatus = searchParams.get('onboarding')
  
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingPayout: 0,
    availableForWithdrawal: 0,
    completedPlacements: 0,
    activePlacements: 0,
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [stripeStatus, setStripeStatus] = useState<any>(null)

  useEffect(() => {
    fetchEarnings()
    fetchStripeStatus()
  }, [])

  useEffect(() => {
    // Show success message after Stripe onboarding
    if (onboardingStatus === 'success') {
      fetchStripeStatus()
    }
  }, [onboardingStatus])

  const fetchEarnings = async () => {
    try {
      const response = await fetch('/api/creator/earnings')
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats || {
          totalEarned: 0,
          pendingPayout: 0,
          availableForWithdrawal: 0,
          completedPlacements: 0,
          activePlacements: 0,
        })
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStripeStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/status')
      const data = await response.json()
      setStripeStatus(data)
    } catch (error) {
      console.error('Error fetching Stripe status:', error)
    }
  }

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/dashboard/creator"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться в дашборд
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Заработок</h1>
            <p className="text-gray-600">Финансы и история выплат</p>
          </div>
        </div>

        {/* Stripe Connect Banner */}
        {onboardingStatus === 'success' && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                Stripe успешно подключен! Теперь вы можете получать выплаты.
              </p>
            </div>
          </div>
        )}

        {/* Stripe Connect Setup */}
        <div className="mb-8">
          <StripeConnectButton
            initialStatus={stripeStatus}
            onStatusChange={setStripeStatus}
          />
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Всего заработано</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatBudget(stats.totalEarned)}
            </p>
            <p className="mt-2 text-sm text-gray-600">За всё время</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Ожидает выплаты</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatBudget(stats.pendingPayout)}
            </p>
            <p className="mt-2 text-sm text-gray-600">Будет выплачено скоро</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Завершённых размещений</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.completedPlacements}
            </p>
            <p className="mt-2 text-sm text-gray-600">Успешно выполнено</p>
          </div>
        </div>

        {/* Payout Info */}
        <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-blue-900">
                Автоматические выплаты
              </h3>
              <p className="text-sm text-blue-700">
                Выплаты производятся автоматически после завершения размещения и подтверждения публикации. 
                Средства поступают на указанный вами способ оплаты в течение 3-5 рабочих дней.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">История транзакций</h2>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Экспорт
            </Button>
          </div>

          {/* Transaction List or Empty State */}
          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                История пока пуста
              </h3>
              <p className="text-gray-600">
                Выплаты появятся здесь после завершения размещений
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Выплата за размещение
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      +{formatBudget(tx.amount)}
                    </p>
                    <p className="text-sm text-gray-600">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CreatorEarningsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>
      </div>
    }>
      <CreatorEarningsContent />
    </Suspense>
  )
}
