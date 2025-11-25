'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Placement } from '@/types'

const STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive'; icon: any }
> = {
  proposal: {
    label: 'Предложение',
    variant: 'secondary',
    icon: Clock,
  },
  booked: {
    label: 'Забронировано',
    variant: 'default',
    icon: CheckCircle2,
  },
  in_progress: {
    label: 'В работе',
    variant: 'default',
    icon: Clock,
  },
  posted: {
    label: 'Опубликовано',
    variant: 'success',
    icon: CheckCircle2,
  },
  approved: {
    label: 'Утверждено',
    variant: 'success',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Отклонено',
    variant: 'destructive',
    icon: XCircle,
  },
}

const platformIcons: Record<string, string> = {
  tiktok: '🎵',
  instagram: '📷',
  youtube: '🎥',
  telegram: '✈️',
  vk: '🔵',
}

interface PlacementsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PlacementsPage({ params }: PlacementsPageProps) {
  const { id: campaignId } = use(params)
  const [placements, setPlacements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPlacements() {
      try {
        const response = await fetch(`/api/placements?campaign_id=${campaignId}`)

        if (!response.ok) {
          setError('Не удалось загрузить размещения')
          return
        }

        const result = await response.json()

        if (result.success && result.placements) {
          setPlacements(result.placements)
        }
      } catch (err) {
        setError('Ошибка загрузки размещений')
      } finally {
        setIsLoading(false)
      }
    }

    loadPlacements()
  }, [campaignId])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-700">Загрузка размещений...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="mb-4 text-lg text-gray-800">{error}</p>
          <Link href={`/campaigns/${campaignId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к кампании
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/campaigns/${campaignId}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад к кампании
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Размещения</h1>
              <p className="text-gray-600">
                {placements.length} {placements.length === 1 ? 'размещение' : 'размещений'}
              </p>
            </div>
          </div>
        </div>

        {/* Placements List */}
        {placements.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Нет размещений
            </h3>
            <p className="mb-6 text-gray-600">
              Вернитесь к кампании и выберите блогеров для размещения
            </p>
            <Link href={`/campaigns/${campaignId}`}>
              <Button>Выбрать блогеров</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {placements.map((placement) => {
              const channel = placement.channels
              const StatusIcon = STATUS_LABELS[placement.status]?.icon || Clock

              return (
                <div
                  key={placement.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-start gap-6">
                    {/* Channel Avatar */}
                    {channel?.blogger_avatar && (
                      <img
                        src={channel.blogger_avatar}
                        alt={channel.blogger_name || channel.title}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    )}

                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          {channel?.blogger_name && (
                            <p className="mb-1 text-sm font-medium text-gray-600">
                              {channel.blogger_name}
                            </p>
                          )}
                          <h3 className="mb-2 text-xl font-bold text-gray-900">
                            {channel?.title || 'Канал'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {channel?.platforms?.map((platform: string) => (
                              <span key={platform}>{platformIcons[platform] || '📱'}</span>
                            ))}
                            <span>{channel?.handle}</span>
                          </div>
                        </div>

                        <Badge variant={STATUS_LABELS[placement.status]?.variant || 'default'}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {STATUS_LABELS[placement.status]?.label || placement.status}
                        </Badge>
                      </div>

                      {/* Metrics */}
                      <div className="mb-4 flex gap-6 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="h-3 w-3" />
                            Подписчики
                          </div>
                          <div className="font-semibold text-gray-900">
                            {formatNumber(
                              (channel?.metrics as any)?.subscribers ||
                                (channel?.metrics as any)?.followers ||
                                0
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Eye className="h-3 w-3" />
                            Просмотры
                          </div>
                          <div className="font-semibold text-gray-900">
                            {formatNumber((channel?.metrics as any)?.avg_views || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Цена:</span>{' '}
                          {placement.unit_price.value.toLocaleString()} {placement.unit_price.currency}
                        </div>
                        <div>
                          <span className="font-medium">Дедлайн:</span>{' '}
                          {formatDate(placement.deadline_at)}
                        </div>
                      </div>

                      {/* Post Link */}
                      {placement.post_link && (
                        <div className="mt-3">
                          <a
                            href={placement.post_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Ссылка на публикацию →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
