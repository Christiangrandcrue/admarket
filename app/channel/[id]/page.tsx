'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Eye, TrendingUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Channel } from '@/types'

interface ChannelPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const { id } = use(params)
  const [channel, setChannel] = useState<Channel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChannel() {
      try {
        const response = await fetch(`/api/channels/${id}`)
        
        if (!response.ok) {
          setError('Канал не найден')
          return
        }

        const result = await response.json()
        
        if (result.success && result.channel) {
          setChannel(result.channel)
        } else {
          setError('Канал не найден')
        }
      } catch (err) {
        setError('Ошибка загрузки канала')
      } finally {
        setIsLoading(false)
      }
    }

    loadChannel()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-700">Загрузка канала...</p>
        </div>
      </div>
    )
  }

  if (error || !channel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="mb-4 text-lg text-gray-800">{error || 'Канал не найден'}</p>
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
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

        {/* Main Content */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              {channel.platforms?.map((platform) => (
                <span key={platform} className="text-3xl">
                  {platform === 'tiktok' && '🎵'}
                  {platform === 'instagram' && '📷'}
                  {platform === 'youtube' && '🎥'}
                  {platform === 'telegram' && '✈️'}
                  {platform === 'vk' && '🔵'}
                </span>
              ))}
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{channel.title}</h1>
            <p className="text-lg text-gray-700">{channel.handle}</p>
          </div>

          {/* Topics */}
          <div className="mb-6 flex flex-wrap gap-2">
            {channel.topics?.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>

          {/* Description */}
          <p className="mb-6 text-gray-800">{channel.description}</p>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                Подписчики
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(channel.metrics?.followers || 0)}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <Eye className="h-4 w-4" />
                Просмотры
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(channel.metrics?.avg_views || 0)}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                ER
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {channel.metrics?.er || 0}%
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <Link href={`/campaigns/create?channel=${channel.id}`}>
              <Button size="lg" className="w-full md:w-auto">
                Создать кампанию
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
