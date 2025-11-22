'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  DollarSign, 
  Users, 
  TrendingUp,
  Pause,
  Play,
  XCircle,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
  brief: string
  landing_url: string
  utm_campaign: string
  promo_code: string | null
  platform_fee: number
  creator_payout: number
  created_at: string
  updated_at: string
}

interface Placement {
  id: string
  channel_id: string
  channel_title: string
  channel_handle: string
  formats: string[]
  budget: number
  status: string
  accepted_at: string | null
  rejection_reason: string | null
  created_at: string
  channel?: {
    id: string
    title: string
    handle: string
    platform: string
    followers_count: number
    avg_views: number
    engagement_rate: number
    verified: boolean
  }
}

interface Stats {
  totalPlacements: number
  pendingPlacements: number
  acceptedPlacements: number
  rejectedPlacements: number
  completedPlacements: number
  totalReach: number
  avgEngagementRate: string
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [campaignId, setCampaignId] = useState<string>('')
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [placements, setPlacements] = useState<Placement[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => {
      setCampaignId(id)
      fetchCampaignData(id)
    })
  }, [])

  const fetchCampaignData = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaign')
      }

      setCampaign(data.campaign)
      setPlacements(data.placements)
      setStats(data.stats)
    } catch (error: any) {
      console.error('Error fetching campaign:', error)
      alert(error.message || 'Ошибка загрузки кампании')
      router.push('/dashboard/campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!campaignId) return

    const confirmMessages = {
      pause: 'Вы уверены, что хотите приостановить кампанию?',
      resume: 'Вы уверены, что хотите возобновить кампанию?',
      cancel: 'Вы уверены, что хотите отменить кампанию? Это действие необратимо.',
    }

    if (!confirm(confirmMessages[action])) return

    setActionLoading(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update campaign')
      }

      // Refresh campaign data
      await fetchCampaignData(campaignId)
      alert(data.message || 'Кампания успешно обновлена')
    } catch (error: any) {
      console.error('Error updating campaign:', error)
      alert(error.message || 'Ошибка обновления кампании')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'error' | 'success' | 'warning' }> = {
      draft: { label: 'Черновик', variant: 'secondary' },
      pending: { label: 'Ожидает оплаты', variant: 'warning' },
      active: { label: 'Активна', variant: 'success' },
      paused: { label: 'Приостановлена', variant: 'warning' },
      completed: { label: 'Завершена', variant: 'outline' },
      cancelled: { label: 'Отменена', variant: 'error' },
    }

    const config = statusConfig[status] || { label: status, variant: 'outline' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPlacementStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'error' | 'success' | 'warning'; icon: any }> = {
      pending: { label: 'Ожидает ответа', variant: 'warning', icon: Clock },
      accepted: { label: 'Принята', variant: 'success', icon: CheckCircle2 },
      rejected: { label: 'Отклонена', variant: 'error', icon: XCircle },
      completed: { label: 'Завершена', variant: 'default', icon: CheckCircle2 },
    }

    const config = statusConfig[status] || { label: status, variant: 'outline', icon: AlertCircle }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'awareness': return <Eye className="h-5 w-5" />
      case 'traffic': return <TrendingUp className="h-5 w-5" />
      case 'conversions': return <Target className="h-5 w-5" />
      case 'sales': return <DollarSign className="h-5 w-5" />
      default: return <Target className="h-5 w-5" />
    }
  }

  const getGoalLabel = (goal: string) => {
    const goals: Record<string, string> = {
      awareness: 'Узнаваемость',
      traffic: 'Трафик',
      conversions: 'Конверсии',
      sales: 'Продажи',
    }
    return goals[goal] || goal
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="text-gray-600">Загрузка кампании...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Кампания не найдена</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/dashboard/campaigns" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Назад к кампаниям
      </Link>

      {/* Campaign Header */}
      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-gray-600">{campaign.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {campaign.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCampaignAction('pause')}
                disabled={actionLoading}
              >
                <Pause className="mr-2 h-4 w-4" />
                Приостановить
              </Button>
            )}
            {campaign.status === 'paused' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCampaignAction('resume')}
                disabled={actionLoading}
              >
                <Play className="mr-2 h-4 w-4" />
                Возобновить
              </Button>
            )}
            {!['completed', 'cancelled'].includes(campaign.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCampaignAction('cancel')}
                disabled={actionLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Отменить
              </Button>
            )}
          </div>
        </div>

        {/* Campaign Meta */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
            <div className="rounded-full bg-purple-100 p-2 text-purple-600">
              {getGoalIcon(campaign.goal)}
            </div>
            <div>
              <div className="text-xs text-gray-600">Цель</div>
              <div className="font-semibold text-gray-900">{getGoalLabel(campaign.goal)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
            <div className="rounded-full bg-green-100 p-2 text-green-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Бюджет</div>
              <div className="font-semibold text-gray-900">{formatCurrency(campaign.total_budget)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Период</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatDate(campaign.start_date)} — {formatDate(campaign.end_date)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
            <div className="rounded-full bg-orange-100 p-2 text-orange-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Каналов</div>
              <div className="font-semibold text-gray-900">{stats?.totalPlacements || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Stats */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="mb-2 text-sm font-medium text-gray-600">Всего размещений</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalPlacements}</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="mb-2 text-sm font-medium text-gray-600">Принято</div>
            <div className="text-3xl font-bold text-green-600">{stats.acceptedPlacements}</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="mb-2 text-sm font-medium text-gray-600">Ожидает ответа</div>
            <div className="text-3xl font-bold text-orange-600">{stats.pendingPlacements}</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="mb-2 text-sm font-medium text-gray-600">Общий охват</div>
            <div className="text-3xl font-bold text-purple-600">{formatNumber(stats.totalReach)}</div>
          </div>
        </div>
      )}

      {/* Campaign Details */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Brief */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Техническое задание</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p className="whitespace-pre-wrap">{campaign.brief}</p>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Информация о кампании</h2>
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs font-medium text-gray-600">Landing URL</div>
              <a 
                href={campaign.landing_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                {campaign.landing_url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div>
              <div className="mb-1 text-xs font-medium text-gray-600">UTM Campaign</div>
              <div className="text-sm text-gray-900">{campaign.utm_campaign}</div>
            </div>

            {campaign.promo_code && (
              <div>
                <div className="mb-1 text-xs font-medium text-gray-600">Промокод</div>
                <div className="rounded bg-gray-50 px-3 py-2 font-mono text-sm font-semibold text-gray-900">
                  {campaign.promo_code}
                </div>
              </div>
            )}

            <div>
              <div className="mb-1 text-xs font-medium text-gray-600">Модель оплаты</div>
              <div className="text-sm text-gray-900">{campaign.payment_model}</div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="mb-1 text-xs font-medium text-gray-600">Комиссия платформы (10%)</div>
              <div className="text-sm text-gray-900">{formatCurrency(campaign.platform_fee)}</div>
            </div>

            <div>
              <div className="mb-1 text-xs font-medium text-gray-600">Выплата блогерам</div>
              <div className="text-sm font-semibold text-green-600">{formatCurrency(campaign.creator_payout)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Placements List */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Размещения ({placements.length})</h2>

        {placements.length === 0 ? (
          <div className="py-12 text-center text-gray-600">
            Нет размещений для этой кампании
          </div>
        ) : (
          <div className="space-y-4">
            {placements.map((placement) => (
              <div
                key={placement.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-600">
                    {placement.channel?.title?.charAt(0) || '?'}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{placement.channel_title}</h3>
                      {placement.channel?.verified && (
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{placement.channel?.platform}</span>
                      <span>•</span>
                      <span>{formatNumber(placement.channel?.followers_count || 0)} подписчиков</span>
                      <span>•</span>
                      <span>ER: {placement.channel?.engagement_rate}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="mb-1 text-sm font-medium text-gray-600">Бюджет</div>
                    <div className="font-bold text-gray-900">{formatCurrency(placement.budget)}</div>
                  </div>

                  {getPlacementStatusBadge(placement.status)}

                  <Link href={`/channel/${placement.channel_id}`}>
                    <Button variant="outline" size="sm">
                      Открыть канал
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
