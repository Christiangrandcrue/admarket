'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Target, 
  Eye,
  Clock
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  goal: string
  status: string
  total_budget: number
  start_date: string
  end_date: string
  selected_channels: any[]
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/campaigns')
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
      pending: 'Ожидает оплаты',
      active: 'Активна',
      completed: 'Завершена',
      cancelled: 'Отменена',
    }
    return <Badge>{labels[status] || status}</Badge>
  }

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      awareness: 'Узнаваемость',
      traffic: 'Трафик',
      conversions: 'Конверсии',
      sales: 'Продажи',
    }
    return labels[goal] || goal
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мои кампании</h1>
            <p className="text-gray-600">Управляйте вашими рекламными кампаниями</p>
          </div>
          <Link href="/campaign/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Создать кампанию
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              У вас пока нет кампаний
            </h2>
            <p className="mb-6 text-gray-600">
              Создайте первую кампанию, чтобы начать работу с блогерами
            </p>
            <Link href="/campaign/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Создать первую кампанию
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Campaigns Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        {getGoalLabel(campaign.goal)}
                      </p>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 font-bold text-gray-900 line-clamp-2">
                    {campaign.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                    {campaign.description}
                  </p>

                  {/* Stats */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Бюджет:</span>
                      <span className="font-semibold text-gray-900">
                        {formatBudget(campaign.total_budget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Каналов:</span>
                      <span className="font-semibold text-gray-900">
                        {campaign.selected_channels?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Период:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(campaign.start_date)} — {formatDate(campaign.end_date)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-gray-100 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      Открыть
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-white p-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Всего кампаний</p>
                  <Target className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Активных</p>
                  <Clock className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter((c) => c.status === 'active').length}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Общий бюджет</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBudget(campaigns.reduce((sum, c) => sum + c.total_budget, 0))}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
