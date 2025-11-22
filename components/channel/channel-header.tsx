'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Share2, Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Channel } from '@/types'

interface ChannelHeaderProps {
  channel: Channel
}

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
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8">
      {/* Back Button */}
      <Link 
        href="/catalog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Вернуться к каталогу
      </Link>

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Left Side - Channel Info */}
        <div className="flex-1">
          <div className="mb-4 flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-3xl font-bold text-white">
              {channel.title.charAt(0)}
            </div>

            {/* Title & Handle */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">{channel.title}</h1>
                {channel.brand_safety?.verified && (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                )}
              </div>
              <p className="text-lg text-gray-600">{channel.handle}</p>
            </div>
          </div>

          {/* Platforms */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Платформы:</span>
            <div className="flex gap-2">
              {channel.platforms && Array.isArray(channel.platforms) && channel.platforms.map((platform: string) => (
                <span key={platform} className="text-3xl" title={platform}>
                  {platformIcons[platform] || '📱'}
                </span>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className="mb-4 flex flex-wrap gap-2">
            {channel.topics && Array.isArray(channel.topics) && channel.topics.map((topic: string) => (
              <Badge key={topic} variant="secondary" className="text-sm">
                {topicLabels[topic] || topic}
              </Badge>
            ))}
          </div>

          {/* Rating */}
          {channel.rating && channel.rating.score && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-2xl">⭐</span>
                <span className="text-xl font-bold text-gray-900">
                  {channel.rating.score}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                ({channel.rating.reviews_count || 0} отзывов)
              </span>
            </div>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Brand Safety Badge */}
          {channel.brand_safety?.verified && (
            <Badge variant="success" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Верифицированный канал
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
