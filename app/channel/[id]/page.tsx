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
          {/* Header with Blogger Info */}
          <div className="mb-8">
            <div className="mb-6 flex items-start gap-6">
              {/* Blogger Avatar */}
              {channel.blogger_avatar && (
                <img
                  src={channel.blogger_avatar}
                  alt={channel.blogger_name || channel.title}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-100"
                />
              )}
              
              <div className="flex-1">
                {/* Blogger Name */}
                {channel.blogger_name && (
                  <p className="mb-2 text-lg font-medium text-gray-600">
                    {channel.blogger_name}
                  </p>
                )}
                
                {/* Channel Title */}
                <h1 className="mb-3 text-3xl font-bold text-gray-900">{channel.title}</h1>
                
                {/* Platforms & Handle */}
                <div className="mb-3 flex items-center gap-3">
                  {channel.platforms?.map((platform) => (
                    <span key={platform} className="text-2xl">
                      {platform === 'tiktok' && '🎵'}
                      {platform === 'instagram' && '📷'}
                      {platform === 'youtube' && '🎥'}
                      {platform === 'telegram' && '✈️'}
                      {platform === 'vk' && '🔵'}
                    </span>
                  ))}
                  <span className="text-lg text-gray-700">{channel.handle}</span>
                </div>
                
                {/* Blogger Bio */}
                {channel.blogger_bio && (
                  <p className="text-gray-700">{channel.blogger_bio}</p>
                )}
              </div>
            </div>
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
          <div className="mb-8 grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                Подписчики
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber((channel.metrics as any)?.subscribers || (channel.metrics as any)?.followers || 0)}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <Eye className="h-4 w-4" />
                Просмотры
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber((channel.metrics as any)?.avg_views || 0)}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                ER
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {(channel.metrics as any)?.engagement_rate || (channel.metrics as any)?.er || 0}%
              </div>
            </div>
          </div>

          {/* Case Studies */}
          {channel.case_studies && channel.case_studies.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Примеры работ</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {channel.case_studies.map((caseStudy, index) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">{caseStudy.client}</h3>
                    <p className="mb-3 text-sm text-gray-700">{caseStudy.objective}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {Object.entries(caseStudy.results).map(([key, value]) => (
                        <div key={key} className="rounded-lg bg-white px-3 py-1">
                          <span className="text-gray-600">{key}: </span>
                          <span className="font-semibold text-gray-900">
                            {typeof value === 'number' && value > 1000 
                              ? formatNumber(value) 
                              : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
