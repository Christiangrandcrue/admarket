/**
 * Creator Earnings Page
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CreatorEarningsPage() {
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingPayout: 0,
    completedPlacements: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/creator/earnings')
      .then(r => r.json())
      .then(d => {
        setStats(d.stats || stats)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/dashboard/creator" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            ← Вернуться в дашборд
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Заработок</h1>
          <p className="text-gray-600">Финансы и история выплат</p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Всего заработано</p>
            <p className="text-3xl font-bold text-gray-900">{formatBudget(stats.totalEarned)}</p>
            <p className="mt-2 text-sm text-gray-600">За всё время</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Ожидает выплаты</p>
            <p className="text-3xl font-bold text-gray-900">{formatBudget(stats.pendingPayout)}</p>
            <p className="mt-2 text-sm text-gray-600">Будет выплачено скоро</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Завершённых размещений</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completedPlacements}</p>
            <p className="mt-2 text-sm text-gray-600">Успешно выполнено</p>
          </div>
        </div>
      </div>
    </div>
  )
}
