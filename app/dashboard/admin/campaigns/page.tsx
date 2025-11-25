'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Campaign {
  id: string
  title: string
  description: string
  status: string
  total_budget: number
  advertiser?: {
    company_name: string
  }
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/campaigns')
      .then(r => r.json())
      .then(d => {
        setCampaigns(d.campaigns || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Черновик',
      pending: 'На модерации',
      active: 'Активна',
      completed: 'Завершена',
      cancelled: 'Отменена',
    }
    return <Badge>{labels[status] || status}</Badge>
  }

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/dashboard/admin" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            ← Вернуться в админ-панель
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Модерация кампаний</h1>
          <p className="text-gray-600">Проверка и одобрение рекламных кампаний</p>
        </div>

        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center">
              <p className="text-gray-600">Нет кампаний для модерации</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{campaign.title}</h3>
                    <p className="text-sm text-gray-600">{campaign.description}</p>
                    {campaign.advertiser && (
                      <p className="mt-2 text-sm text-gray-500">
                        Рекламодатель: {campaign.advertiser.company_name}
                      </p>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      Бюджет: {formatBudget(campaign.total_budget)}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(campaign.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
