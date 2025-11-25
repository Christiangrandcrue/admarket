'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Target,
  DollarSign,
  MapPin,
  Users,
  Calendar,
  Loader2,
  Plus,
  Search,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { Campaign, Channel } from '@/types'

const GOAL_LABELS: Record<string, string> = {
  sales: 'Продажи',
  installs: 'Установки',
  awareness: 'Узнаваемость',
  traffic: 'Трафик',
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' }> = {
  draft: { label: 'Черновик', variant: 'secondary' },
  pending: { label: 'На модерации', variant: 'default' },
  active: { label: 'Активна', variant: 'success' },
  paused: { label: 'Приостановлена', variant: 'default' },
  completed: { label: 'Завершена', variant: 'secondary' },
  disputed: { label: 'Спор', variant: 'destructive' },
}

const platformIcons: Record<string, string> = {
  tiktok: '🎵',
  instagram: '📷',
  youtube: '🎥',
  telegram: '✈️',
  vk: '🔵',
}

interface CampaignPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { id } = use(params)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPlacements, setIsCreatingPlacements] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Load campaign
        const campaignResponse = await fetch(`/api/campaigns/${id}`)
        if (!campaignResponse.ok) {
          setError('Кампания не найдена')
          return
        }

        const campaignResult = await campaignResponse.json()
        if (campaignResult.success && campaignResult.campaign) {
          setCampaign(campaignResult.campaign)
        } else {
          setError('Кампания не найдена')
          return
        }

        // Load channels
        const channelsResponse = await fetch('/api/channels')
        const channelsResult = await channelsResponse.json()
        if (channelsResult.success && channelsResult.channels) {
          setChannels(channelsResult.channels)
        }
      } catch (err) {
        setError('Ошибка загрузки данных')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleToggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    )
  }

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch =
      searchQuery === '' ||
      channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.blogger_name?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  const handleCreatePlacements = async () => {
    if (selectedChannels.length === 0) return

    setIsCreatingPlacements(true)
    try {
      const response = await fetch('/api/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: id,
          channel_ids: selectedChannels,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create placements')
      }

      const result = await response.json()

      if (result.success) {
        alert(`Успешно создано ${result.placements.length} размещений! Блогеры получили уведомления.`)
        setSelectedChannels([])
        // Redirect to placements view
        window.location.href = `/campaigns/${id}/placements`
      }
    } catch (error) {
      console.error('Error creating placements:', error)
      alert('Ошибка создания размещений')
    } finally {
      setIsCreatingPlacements(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-700">Загрузка кампании...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="mb-4 text-lg text-gray-800">{error || 'Кампания не найдена'}</p>
          <Link href="/campaigns">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к кампаниям
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/campaigns">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад к кампаниям
            </Button>
          </Link>
        </div>

        {/* Campaign Info */}
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                <Badge variant={STATUS_LABELS[campaign.status].variant}>
                  {STATUS_LABELS[campaign.status].label}
                </Badge>
              </div>
              {campaign.description && (
                <p className="text-gray-600">{campaign.description}</p>
              )}
            </div>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <Target className="h-4 w-4" />
                Цель
              </div>
              <div className="font-semibold text-gray-900">
                {GOAL_LABELS[campaign.goal] || campaign.goal}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                Бюджет
              </div>
              <div className="font-semibold text-gray-900">
                {campaign.budget.value.toLocaleString()} {campaign.budget.currency}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                География
              </div>
              <div className="font-semibold text-gray-900">
                {campaign.geo.join(', ')}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                Аудитория
              </div>
              <div className="font-semibold text-gray-900">
                {campaign.audience.gender === 'any' ? 'Любой' : campaign.audience.gender === 'male' ? 'Мужской' : 'Женский'}, {campaign.audience.age.join(', ')}
              </div>
            </div>
          </div>

          {/* UTM & Tracking */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">Трекинг</h3>
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <div>
                <span className="text-gray-600">utm_source:</span>{' '}
                <span className="font-mono font-medium text-gray-900">{campaign.utm.source}</span>
              </div>
              <div>
                <span className="text-gray-600">utm_medium:</span>{' '}
                <span className="font-mono font-medium text-gray-900">{campaign.utm.medium}</span>
              </div>
              <div>
                <span className="text-gray-600">utm_campaign:</span>{' '}
                <span className="font-mono font-medium text-gray-900">{campaign.utm.campaign}</span>
              </div>
            </div>
            {campaign.promo_codes.length > 0 && (
              <div className="mt-3">
                <span className="text-sm text-gray-600">Промокоды:</span>{' '}
                <div className="mt-2 flex flex-wrap gap-2">
                  {campaign.promo_codes.map((code) => (
                    <Badge key={code} variant="secondary">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Select Channels */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Выбор блогеров</h2>
              <p className="text-gray-600">
                Выберите блогеров для размещения в этой кампании
              </p>
            </div>
            {selectedChannels.length > 0 && (
              <Badge variant="default" className="text-base">
                Выбрано: {selectedChannels.length}
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />
              <Input
                type="text"
                placeholder="Поиск блогеров..."
                className="pl-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChannels.map((channel) => {
              const isSelected = selectedChannels.includes(channel.id)
              
              return (
                <button
                  key={channel.id}
                  onClick={() => handleToggleChannel(channel.id)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-3 flex items-start gap-3">
                    {channel.blogger_avatar && (
                      <img
                        src={channel.blogger_avatar}
                        alt={channel.blogger_name || channel.title}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    )}
                    <div className="flex-1">
                      {channel.blogger_name && (
                        <p className="mb-1 text-sm font-medium text-gray-700">
                          {channel.blogger_name}
                        </p>
                      )}
                      <h4 className="text-base font-semibold text-gray-900">
                        {channel.title}
                      </h4>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-black" />
                    )}
                  </div>

                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                    {channel.platforms?.map((platform) => (
                      <span key={platform}>{platformIcons[platform] || '📱'}</span>
                    ))}
                    <span>{channel.handle}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-600">Подписчики</div>
                      <div className="font-semibold text-gray-900">
                        {formatNumber((channel.metrics as any)?.subscribers || (channel.metrics as any)?.followers || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Просмотры</div>
                      <div className="font-semibold text-gray-900">
                        {formatNumber((channel.metrics as any)?.avg_views || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">ER</div>
                      <div className="font-semibold text-gray-900">
                        {(channel.metrics as any)?.engagement_rate || (channel.metrics as any)?.er || 0}%
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Action */}
          {selectedChannels.length > 0 && (
            <div className="mt-8 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedChannels([])}
                disabled={isCreatingPlacements}
              >
                Сбросить выбор
              </Button>
              <Button 
                size="lg" 
                className="gap-2"
                onClick={handleCreatePlacements}
                disabled={isCreatingPlacements}
              >
                {isCreatingPlacements ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Создать размещения ({selectedChannels.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
