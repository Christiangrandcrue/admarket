'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Play,
  Calendar,
  DollarSign,
  ExternalLink,
  Upload,
} from 'lucide-react'

interface Placement {
  id: string
  status: string
  formats: string[]
  budget: number
  accepted_at: string
  channel_title: string
  campaign: {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    landing_url: string
  }
}

export default function CreatorActivePage() {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivePlacements()
  }, [])

  const fetchActivePlacements = async () => {
    try {
      const response = await fetch('/api/creator/placements')
      const data = await response.json()

      if (response.ok) {
        const accepted = data.grouped?.accepted || []
        setPlacements(accepted)
      }
    } catch (error) {
      console.error('Error fetching active placements:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('ru-RU', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/dashboard/creator"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться в дашборд
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Активные размещения</h1>
            <p className="text-gray-600">Принятые кампании в работе</p>
          </div>
        </div>

        {placements.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Нет активных размещений
            </h2>
            <p className="mb-6 text-gray-600">
              Принятые заявки появятся здесь
            </p>
            <Link href="/dashboard/creator/requests">
              <Button>Посмотреть входящие заявки</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {placements.map((placement) => (
              <div
                key={placement.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {placement.campaign.title}
                      </h3>
                      <Badge variant="default" className="bg-green-600">
                        Активна
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {placement.campaign.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Вознаграждение</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatBudget(placement.budget || 0)}
                    </p>
                  </div>
                </div>

                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Период размещения
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatDate(placement.campaign.start_date)} — {formatDate(placement.campaign.end_date)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      Статус оплаты
                    </div>
                    <p className="font-semibold text-orange-600">Ожидает публикации</p>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-gray-100 pt-4">
                  <Button className="flex-1 gap-2">
                    <Upload className="h-4 w-4" />
                    Загрузить контент
                  </Button>
                  {placement.campaign.landing_url && (
                    <Button variant="outline" asChild>
                      <a
                        href={placement.campaign.landing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Landing
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
