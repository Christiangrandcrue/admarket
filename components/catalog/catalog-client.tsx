'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CatalogFilters } from './catalog-filters'
import { 
  Search, 
  CheckCircle2,
  TrendingUp,
  Users,
  Eye,
  Heart,
  ExternalLink
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
}

interface CatalogClientProps {
  channels: Channel[]
}

interface FilterState {
  platforms: string[]
  topics: string[]
  followersMin: number
  followersMax: number
  erMin: number
  erMax: number
  verifiedOnly: boolean
  sortBy: 'followers' | 'er' | 'rating'
  sortOrder: 'asc' | 'desc'
}

export function CatalogClient({ channels }: CatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    platforms: [],
    topics: [],
    followersMin: 0,
    followersMax: 1000000,
    erMin: 0,
    erMax: 20,
    verifiedOnly: false,
    sortBy: 'followers',
    sortOrder: 'desc',
  })

  const filteredAndSortedChannels = useMemo(() => {
    let result = channels.filter((channel) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.handle.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      // Platform filter
      if (filters.platforms.length > 0) {
        const channelPlatforms = channel.platforms || []
        const hasMatchingPlatform = filters.platforms.some(p => 
          channelPlatforms.includes(p)
        )
        if (!hasMatchingPlatform) return false
      }

      // Topic filter
      if (filters.topics.length > 0) {
        const channelTopics = channel.topics || []
        const hasMatchingTopic = filters.topics.some(t => 
          channelTopics.includes(t)
        )
        if (!hasMatchingTopic) return false
      }

      // Followers filter
      const followers = channel.metrics?.followers || 0
      if (followers < filters.followersMin || followers > filters.followersMax) {
        return false
      }

      // ER filter
      const er = channel.metrics?.er || 0
      if (er < filters.erMin || er > filters.erMax) {
        return false
      }

      // Verified filter
      if (filters.verifiedOnly && !channel.brand_safety?.verified) {
        return false
      }

      return true
    })

    // Sorting
    result.sort((a, b) => {
      let valueA: number
      let valueB: number

      if (filters.sortBy === 'followers') {
        valueA = a.metrics?.followers || 0
        valueB = b.metrics?.followers || 0
      } else if (filters.sortBy === 'er') {
        valueA = a.metrics?.er || 0
        valueB = b.metrics?.er || 0
      } else {
        valueA = a.rating?.score || 0
        valueB = b.rating?.score || 0
      }

      return filters.sortOrder === 'desc' ? valueB - valueA : valueA - valueB
    })

    return result
  }, [channels, searchQuery, filters])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <CatalogFilters
          filters={filters}
          onFiltersChange={setFilters}
          resultCount={filteredAndSortedChannels.length}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6 lg:col-span-3">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
          <Input
            type="text"
            placeholder="Поиск по названию или @handle..."
            className="pl-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredAndSortedChannels.map((channel) => (
            <div
              key={channel.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 transition-shadow hover:shadow-lg"
            >
              {/* Header */}
              <div className="mb-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {channel.platforms && Array.isArray(channel.platforms) && channel.platforms.map((platform: string) => (
                        <span key={platform} className="text-2xl">
                          {platformIcons[platform] || '📱'}
                        </span>
                      ))}
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-gray-900">{channel.title}</h3>
                    <p className="text-sm text-gray-700">{channel.handle}</p>
                  </div>
                  <button className="rounded-lg p-2 hover:bg-gray-100">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {channel.topics && Array.isArray(channel.topics) && channel.topics.map((topic: string) => (
                    <Badge key={topic} variant="secondary">
                      {topicLabels[topic] || topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="mb-4 line-clamp-2 text-sm text-gray-800">
                {channel.description}
              </p>

              {/* Metrics */}
              <div className="mb-4 grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-4">
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-gray-600">
                    <Users className="h-3 w-3" />
                    Подписчики
                  </div>
                  <div className="font-semibold text-gray-900">
                    {channel.metrics && formatNumber(channel.metrics.followers || 0)}
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-gray-600">
                    <Eye className="h-3 w-3" />
                    Просмотры
                  </div>
                  <div className="font-semibold text-gray-900">
                    {channel.metrics && formatNumber(channel.metrics.avg_views || 0)}
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-gray-600">
                    <TrendingUp className="h-3 w-3" />
                    ER
                  </div>
                  <div className="font-semibold text-gray-900">{channel.metrics ? channel.metrics.er : 0}%</div>
                </div>
              </div>

              {/* Badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                {channel.brand_safety && channel.brand_safety.verified && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Верифицирован
                  </Badge>
                )}
                {channel.rating && channel.rating.score >= 4.5 && (
                  <Badge variant="secondary">
                    ⭐ {channel.rating.score}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/channel/${channel.id}`} className="flex-1">
                  <Button className="w-full" size="sm">
                    Посмотреть
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedChannels.length === 0 && (
          <div className="py-20 text-center">
            <p className="mb-4 text-lg text-gray-800">
              Ничего не найдено
            </p>
            <p className="mb-6 text-sm text-gray-600">
              Попробуйте изменить параметры фильтрации или поисковый запрос
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Сбросить поиск
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    platforms: [],
                    topics: [],
                    followersMin: 0,
                    followersMax: 1000000,
                    erMin: 0,
                    erMax: 20,
                    verifiedOnly: false,
                    sortBy: 'followers',
                    sortOrder: 'desc',
                  })
                }
              >
                Сбросить фильтры
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
