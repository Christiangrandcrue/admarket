'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Target,
  ExternalLink,
  ArrowLeft,
  Loader2,
} from 'lucide-react'

interface Placement {
  id: string
  status: string
  formats: string[]
  budget: number
  created_at: string
  channel_id: string
  channel_title: string
  campaign: {
    id: string
    title: string
    description: string
    goal: string
    total_budget: number
    start_date: string
    end_date: string
    brief: string
    landing_url: string
    advertiser: {
      id: string
      email: string
      full_name: string
    }
  }
}

export default function CreatorRequestsPage() {
  const router = useRouter()
  const [placements, setPlacements] = useState<Placement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPlacements()
  }, [])

  const fetchPlacements = async () => {
    try {
      const response = await fetch('/api/creator/placements')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch placements')
      }

      // Filter only pending placements
      const pending = data.grouped?.pending || []
      setPlacements(pending)
    } catch (error: any) {
      console.error('Error fetching placements:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (placementId: string, action: 'accept' | 'reject') => {
    setProcessingId(placementId)
    try {
      const response = await fetch(`/api/creator/placements/${placementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} placement`)
      }

      // Remove from list
      setPlacements((prev) => prev.filter((p) => p.id !== placementId))

      // Show success message
      alert(data.message)
    } catch (error: any) {
      console.error(`Error ${action}ing placement:`, error)
      alert(`Ошибка: ${error.message}`)
    } finally {
      setProcessingId(null)
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
      year: 'numeric',
    })
  }

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getFormatLabel = (format: string) => {
    const labels: Record<string, string> = {
      story: '📸 Story',
      post: '📝 Пост',
      video: '🎥 Видео',
      short: '⚡ Short',
      integration: '🎬 Интеграция',
      dedicated: '🎯 Отдельный ролик',
    }
    return labels[format] || format
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
              <p className="mt-4 text-gray-600">Загрузка заявок...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/creator"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться в дашборд
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Входящие заявки</h1>
            <p className="text-gray-600">
              Предложения о размещении от рекламодателей
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6">
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
        {!error && placements.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Нет новых заявок
            </h2>
            <p className="mb-6 text-gray-600">
              Новые предложения о размещении появятся здесь
            </p>
            <Link href="/dashboard/creator">
              <Button variant="outline">Вернуться в дашборд</Button>
            </Link>
          </div>
        )}

        {/* Placements List */}
        {!error && placements.length > 0 && (
          <div className="space-y-6">
            {placements.map((placement) => (
              <div
                key={placement.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                {/* Campaign Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {placement.campaign.title}
                      </h3>
                      <Badge variant="outline">
                        {getGoalLabel(placement.campaign.goal)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      От: {placement.campaign.advertiser?.full_name || placement.campaign.advertiser?.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Ваше вознаграждение</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatBudget(placement.budget || 0)}
                    </p>
                  </div>
                </div>

                {/* Campaign Description */}
                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-3">
                    {placement.campaign.description}
                  </p>
                </div>

                {/* Campaign Details */}
                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Даты кампании
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatDate(placement.campaign.start_date)} — {formatDate(placement.campaign.end_date)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      Форматы размещения
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {placement.formats?.map((format, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-900"
                        >
                          {getFormatLabel(format)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Brief */}
                <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-gray-900">
                    Техническое задание:
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {placement.campaign.brief || 'Техническое задание не указано'}
                  </p>
                </div>

                {/* Landing URL */}
                {placement.campaign.landing_url && (
                  <div className="mb-6">
                    <a
                      href={placement.campaign.landing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Открыть landing page
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 border-t border-gray-100 pt-4">
                  <Button
                    onClick={() => handleAction(placement.id, 'accept')}
                    disabled={processingId === placement.id}
                    className="flex-1 gap-2"
                  >
                    {processingId === placement.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Принять заявку
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAction(placement.id, 'reject')}
                    disabled={processingId === placement.id}
                    className="flex-1 gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Отклонить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
