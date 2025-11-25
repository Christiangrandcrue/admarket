'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Target, DollarSign, MapPin, Users, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Campaign } from '@/types'

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

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const response = await fetch('/api/campaigns')
        const result = await response.json()

        if (result.success && result.campaigns) {
          setCampaigns(result.campaigns)
        }
      } catch (error) {
        console.error('Error loading campaigns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaigns()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-700">Загрузка кампаний...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Мои кампании</h1>
            <p className="text-gray-600">
              Управляйте рекламными кампаниями и отслеживайте результаты
            </p>
          </div>
          <Link href="/campaigns/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Создать кампанию
            </Button>
          </Link>
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              У вас пока нет кампаний
            </h3>
            <p className="mb-6 text-gray-600">
              Создайте первую кампанию и начните работать с блогерами
            </p>
            <Link href="/campaigns/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Создать первую кампанию
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="block transition-shadow hover:shadow-lg"
              >
                <div className="rounded-2xl border border-gray-100 bg-white p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                        <Badge variant={STATUS_LABELS[campaign.status].variant}>
                          {STATUS_LABELS[campaign.status].label}
                        </Badge>
                      </div>
                      {campaign.description && (
                        <p className="text-gray-600">{campaign.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
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
                        {campaign.audience.age.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Создана {new Date(campaign.created_at).toLocaleDateString('ru-RU')}
                    </div>
                    <Button variant="ghost" size="sm">
                      Подробнее →
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
