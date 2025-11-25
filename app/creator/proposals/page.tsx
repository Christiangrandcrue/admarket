'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Calendar,
  Target,
  Eye,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Placement {
  id: string
  campaign_id: string
  channel_id: string
  format_id: string
  unit_price: {
    value: number
    currency: string
    model: string
  }
  deadline_at: string
  status: string
  created_at: string
  campaigns?: {
    id: string
    name: string
    goal: string
    description?: string
    budget: {
      value: number
      currency: string
    }
    geo: string[]
    audience: {
      gender: string
      age: string[]
    }
  }
  channels?: {
    id: string
    title: string
    handle: string
    blogger_name?: string
    blogger_avatar?: string
    metrics?: any
  }
}

const GOAL_LABELS: Record<string, string> = {
  sales: 'Продажи',
  installs: 'Установки',
  awareness: 'Узнаваемость',
  traffic: 'Трафик',
}

export default function CreatorProposalsPage() {
  const [proposals, setProposals] = useState<Placement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Hardcoded creator user ID (same as channel owner)
  // In production, this would come from auth session
  const creatorUserId = 'bf91c23b-7b52-4870-82f7-ba9ad852b49e'

  useEffect(() => {
    loadProposals()
  }, [])

  const loadProposals = async () => {
    try {
      // Get creator's channels
      const channelsResponse = await fetch(
        `/api/channels?owner_user_id=${creatorUserId}`
      )
      const channelsResult = await channelsResponse.json()

      if (!channelsResult.success || !channelsResult.channels) {
        return
      }

      const channelIds = channelsResult.channels.map((c: any) => c.id)

      // Get placements for these channels with status 'proposal'
      const placementsResponse = await fetch(
        `/api/placements?channel_ids=${channelIds.join(',')}&status=proposal`
      )
      const placementsResult = await placementsResponse.json()

      if (placementsResult.success && placementsResult.placements) {
        setProposals(placementsResult.placements)
      }
    } catch (error) {
      console.error('Error loading proposals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (placementId: string) => {
    setProcessingId(placementId)
    try {
      const response = await fetch(`/api/placements/${placementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'booked' }),
      })

      if (response.ok) {
        // Remove from proposals list
        setProposals((prev) => prev.filter((p) => p.id !== placementId))
      } else {
        alert('Ошибка при принятии предложения')
      }
    } catch (error) {
      console.error('Error accepting proposal:', error)
      alert('Ошибка при принятии предложения')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (placementId: string) => {
    setProcessingId(placementId)
    try {
      const response = await fetch(`/api/placements/${placementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (response.ok) {
        // Remove from proposals list
        setProposals((prev) => prev.filter((p) => p.id !== placementId))
      } else {
        alert('Ошибка при отклонении предложения')
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error)
      alert('Ошибка при отклонении предложения')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-700">Загрузка предложений...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Предложения размещений
          </h1>
          <p className="text-gray-600">
            {proposals.length} {proposals.length === 1 ? 'новое предложение' : 'новых предложений'}
          </p>
        </div>

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <CheckCircle2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Нет новых предложений
            </h3>
            <p className="text-gray-600">
              Когда рекламодатели предложат размещение в ваших каналах, они появятся здесь
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {proposals.map((proposal) => {
              const campaign = proposal.campaigns
              const channel = proposal.channels
              const isProcessing = processingId === proposal.id

              return (
                <div
                  key={proposal.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {campaign?.name}
                        </h3>
                        <Badge variant="secondary">
                          <Clock className="mr-1 h-3 w-3" />
                          Новое предложение
                        </Badge>
                      </div>
                      {campaign?.description && (
                        <p className="mb-2 text-gray-600">{campaign.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Campaign Info */}
                  <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-4">
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-sm text-gray-600">
                        <Target className="h-3 w-3" />
                        Цель
                      </div>
                      <div className="font-semibold text-gray-900">
                        {GOAL_LABELS[campaign?.goal || ''] || campaign?.goal}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-sm text-gray-600">
                        <DollarSign className="h-3 w-3" />
                        Бюджет кампании
                      </div>
                      <div className="font-semibold text-gray-900">
                        {campaign?.budget.value.toLocaleString()} {campaign?.budget.currency}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-3 w-3" />
                        Аудитория
                      </div>
                      <div className="font-semibold text-gray-900">
                        {campaign?.audience.age.join(', ')}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="h-3 w-3" />
                        География
                      </div>
                      <div className="font-semibold text-gray-900">
                        {campaign?.geo.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Placement Details */}
                  <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h4 className="mb-3 font-semibold text-gray-900">Детали размещения</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <div className="mb-1 text-sm text-gray-600">Канал</div>
                        <div className="font-medium text-gray-900">
                          {channel?.title}
                        </div>
                        <div className="text-sm text-gray-600">{channel?.handle}</div>
                      </div>
                      <div>
                        <div className="mb-1 text-sm text-gray-600">Ваше вознаграждение</div>
                        <div className="text-lg font-bold text-green-600">
                          {proposal.unit_price.value.toLocaleString()} {proposal.unit_price.currency}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-sm text-gray-600">Дедлайн</div>
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <Calendar className="h-4 w-4" />
                          {formatDate(proposal.deadline_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(proposal.id)}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Отклонить
                    </Button>
                    <Button
                      onClick={() => handleAccept(proposal.id)}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Принять
                    </Button>
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
