'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Target, 
  TrendingUp,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  goal: string
  status: string
  total_budget: number
  payment_model: string
  start_date: string
  end_date: string
  created_at: string
  selected_channels: any[]
  default_formats: string[]
  platform_fee?: number
  creator_payout?: number
}

function CampaignsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const showSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaigns')
      }

      setCampaigns(data.campaigns || [])
    } catch (error: any) {
      console.error('Error fetching campaigns:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'error' }> = {
      draft: { label: 'Черновик', variant: 'secondary' },
      pending: { label: 'Ожидает оплаты', variant: 'outline' },
      active: { label: 'Активна', variant: 'default' },
      completed: { label: 'Завершена', variant: 'outline' },
      cancelled: { label: 'Отменена', variant: 'error' },
    }

    const config = statusConfig[status] || { label: status, variant: 'outline' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'awareness': return <Eye className="h-4 w-4" />
      case 'traffic': return <MousePointerClick className="h-4 w-4" />
      case 'conversions': return <TrendingUp className="h-4 w-4" />
      case 'sales': return <DollarSign className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
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
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
              <p className="mt-4 text-gray-600">Загрузка кампаний...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Кампания создана успешно!</p>
                <p className="text-sm text-green-700">
                  Теперь вы можете отслеживать её прогресс и метрики.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мои кампании</h1>
            <p className="text-gray-600">
              Управляйте вашими рекламными кампаниями
            </p>
          </div>
          <Link href="/campaign/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Создать кампанию
            </Button>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Ошибка загрузки</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && campaigns.length === 0 && (
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
        )}

        {/* Campaigns Grid */}
        {!error && campaigns.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      {getGoalIcon(campaign.goal)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {getGoalLabel(campaign.goal)}
                      </p>
                    </div>
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
                  {campaign.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/campaign/create?id=${campaign.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats (if campaigns exist) */}
        {!error && campaigns.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-4">
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
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatBudget(campaigns.reduce((sum, c) => sum + c.total_budget, 0))}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">Каналов</p>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + (c.selected_channels?.length || 0), 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Загрузка...</div>}>
      <CampaignsContent />
    </Suspense>
  )
}
