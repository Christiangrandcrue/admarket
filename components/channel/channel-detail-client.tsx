'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Users,
  Eye,
  TrendingUp,
  Heart,
  Share2,
  CheckCircle2,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  Loader2,
} from 'lucide-react'
import type { Channel } from '@/types'

const platformIcons: Record<string, string> = {
  tiktok: '🎵',
  instagram: '📷',
  youtube: '🎥',
  telegram: '✈️',
  vk: '🔵',
}

const topicLabels: Record<string, string> = {
  fitness: 'Фитнес',
  tech: 'Технологии',
  beauty: 'Красота',
  gaming: 'Игры',
  lifestyle: 'Лайфстайл',
  business: 'Бизнес',
  crypto: 'Криптовалюты',
  food: 'Еда',
  travel: 'Путешествия',
  marketing: 'Маркетинг',
  digital: 'Digital',
  smm: 'SMM',
  health: 'Здоровье',
  finance: 'Финансы',
  investment: 'Инвестиции',
  money: 'Деньги',
  startups: 'Стартапы',
  blockchain: 'Блокчейн',
  trading: 'Трейдинг',
  it: 'IT',
  programming: 'Программирование',
  technology: 'Технологии',
}

interface ChannelDetailClientProps {
  channelId: string
}

export function ChannelDetailClient({ channelId }: ChannelDetailClientProps) {
  const router = useRouter()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChannel() {
      try {
        console.log('[ChannelDetail] Loading channel:', channelId)
        const response = await fetch(`/api/channels/${channelId}`)
        console.log('[ChannelDetail] Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[ChannelDetail] API error:', errorText)
          
          if (response.status === 404) {
            setError('Канал не найден')
          } else {
            setError('Ошибка загрузки канала')
          }
          setIsLoading(false)
          return
        }

        const result = await response.json()
        console.log('[ChannelDetail] API result:', result)
        
        if (result.success && result.channel) {
          console.log('[ChannelDetail] Channel loaded successfully')
          setChannel(result.channel)
        } else {
          console.error('[ChannelDetail] No channel in result')
          setError('Канал не найден')
        }
      } catch (err) {
        console.error('[ChannelDetail] Exception:', err)
        setError('Ошибка загрузки канала')
      } finally {
        setIsLoading(false)
      }
    }

    loadChannel()
  }, [channelId])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-700">[NEW VERSION v2] Загрузка канала {channelId}...</p>
        </div>
      </div>
    )
  }

  if (error || !channel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="mb-4 text-lg text-gray-800">
            [NEW VERSION] {error || 'Канал не найден - данные не загрузились'}
          </p>
          <p className="mb-4 text-sm text-gray-600">Channel ID: {channelId}</p>
          <Link href="/catalog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться в каталог
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
          <Link href="/catalog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад в каталог
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    {channel.platforms &&
                      Array.isArray(channel.platforms) &&
                      channel.platforms.map((platform: string) => (
                        <span key={platform} className="text-3xl">
                          {platformIcons[platform] || '📱'}
                        </span>
                      ))}
                  </div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">{channel.title}</h1>
                  <p className="text-lg text-gray-700">{channel.handle}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {channel.topics &&
                  Array.isArray(channel.topics) &&
                  channel.topics.map((topic: string) => (
                    <Badge key={topic} variant="secondary">
                      {topicLabels[topic] || topic}
                    </Badge>
                  ))}
              </div>

              <p className="mb-6 text-gray-800">{channel.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-6">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    Подписчики
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {channel.metrics && formatNumber(channel.metrics.subscribers || 0)}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    Просмотры
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {channel.metrics && formatNumber(channel.metrics.avg_views || 0)}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    ER
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {channel.metrics ? channel.metrics.engagement_rate : 0}%
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                {channel.brand_safety && channel.brand_safety.verified && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Верифицирован
                  </Badge>
                )}
                {channel.rating && channel.rating.overall >= 4.5 && (
                  <Badge variant="secondary">⭐ {channel.rating.overall}</Badge>
                )}
                {channel.is_featured && <Badge variant="secondary">🔥 Рекомендуем</Badge>}
              </div>
            </div>

            {/* Audience Demographics */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Аудитория</h2>

              <div className="space-y-6">
                {/* Gender */}
                <div>
                  <h3 className="mb-3 font-semibold text-gray-800">Пол</h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Мужчины</span>
                        <span className="font-semibold">
                          {channel.audience?.gender?.male || 0}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${channel.audience?.gender?.male || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Женщины</span>
                        <span className="font-semibold">
                          {channel.audience?.gender?.female || 0}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-pink-500"
                          style={{ width: `${channel.audience?.gender?.female || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Age */}
                <div>
                  <h3 className="mb-3 font-semibold text-gray-800">Возраст</h3>
                  <div className="space-y-2">
                    {channel.audience?.age &&
                      Object.entries(channel.audience.age).map(([range, percentage]) => (
                        <div key={range}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span>{range}</span>
                            <span className="font-semibold">{percentage}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Geography */}
                <div>
                  <h3 className="mb-3 font-semibold text-gray-800">География</h3>
                  <div className="space-y-2">
                    {channel.audience?.geo &&
                      Object.entries(channel.audience.geo).map(([country, percentage]) => (
                        <div key={country}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="capitalize">{country}</span>
                            <span className="font-semibold">{percentage}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Прайс-лист</h2>

              <div className="grid gap-4 md:grid-cols-2">
                {channel.metrics?.pricing &&
                  Object.entries(channel.metrics.pricing).map(([format, price]) => (
                    <div
                      key={format}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div>
                        <div className="font-semibold text-gray-900 capitalize">
                          {format === 'post' && 'Пост'}
                          {format === 'story' && 'История'}
                          {format === 'repost' && 'Репост'}
                          {format === 'native' && 'Нативная реклама'}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(price as number)} ₽
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Запустить кампанию</h3>
              <p className="mb-6 text-sm text-gray-700">
                Разместите рекламу в этом канале. Мы поможем с созданием контента и оплатой.
              </p>
              <Link href={`/campaigns/create?channel=${channel.id}`}>
                <Button className="w-full" size="lg">
                  Создать кампанию
                </Button>
              </Link>
            </div>

            {/* Stats Card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Статистика</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Рейтинг</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900">
                      {channel.rating?.overall || 0}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({channel.rating?.count || 0})
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Brand Safety</span>
                  <Badge
                    variant={
                      channel.brand_safety?.brand_risk === 'low' ? 'success' : 'secondary'
                    }
                  >
                    {channel.brand_safety?.safety_score || 0}/10
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Создан</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(channel.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
