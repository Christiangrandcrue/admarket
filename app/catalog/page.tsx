'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockChannels } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  CheckCircle2,
  TrendingUp,
  Users,
  Eye
} from 'lucide-react'
import type { Channel, Platform, Topic } from '@/types'

const platformIcons: Record<Platform, string> = {
  tiktok: '📱',
  instagram: '📷',
  youtube: '▶️',
  telegram: '✈️',
  vk: 'ВК',
}

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const filteredChannels = mockChannels.filter((channel) => {
    const matchesSearch =
      searchQuery === '' ||
      channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.handle.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPlatforms =
      selectedPlatforms.length === 0 ||
      selectedPlatforms.some((p) => channel.platforms.includes(p))

    const matchesTopics =
      selectedTopics.length === 0 ||
      selectedTopics.some((t) => channel.topics.includes(t))

    return matchesSearch && matchesPlatforms && matchesTopics
  })

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const toggleTopic = (topic: Topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Каталог каналов</h1>
          <p className="text-lg text-gray-600">
            {filteredChannels.length} верифицированных блогеров и пабликов
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} className="mr-2" />
              Фильтры
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-semibold">Платформы</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['tiktok', 'instagram', 'youtube', 'telegram', 'vk'] as Platform[]).map(
                      (platform) => (
                        <button
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                            selectedPlatforms.includes(platform)
                              ? 'border-black bg-black text-white'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {platformIcons[platform]} {platform}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold">Тематики</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['fitness', 'tech', 'beauty', 'gaming', 'lifestyle', 'business'] as Topic[]).map(
                      (topic) => (
                        <button
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                            selectedTopics.includes(topic)
                              ? 'border-black bg-black text-white'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {topic}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Channel Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChannels.map((channel) => (
            <Link
              key={channel.id}
              href={`/channel/${channel.id}`}
              className="group"
            >
              <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-900 hover:shadow-lg">
                {/* Header */}
                <div className="mb-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold group-hover:underline">
                        {channel.title}
                      </h3>
                      <p className="text-sm text-gray-500">{channel.handle}</p>
                    </div>
                    {channel.brand_safety.verified && (
                      <Badge variant="success">
                        <CheckCircle2 size={14} className="mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {channel.platforms.map((platform) => (
                      <span key={platform} className="text-lg">
                        {platformIcons[platform]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                  {channel.description}
                </p>

                {/* Topics */}
                <div className="mb-4 flex flex-wrap gap-1">
                  {channel.topics.map((topic) => (
                    <Badge key={topic} variant="default">
                      {topic}
                    </Badge>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                      <Users size={14} />
                    </div>
                    <div className="font-semibold">
                      {formatNumber(channel.metrics.followers)}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                      <Eye size={14} />
                    </div>
                    <div className="font-semibold">
                      {formatNumber(channel.metrics.avg_views)}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                      <TrendingUp size={14} />
                      ER
                    </div>
                    <div className="font-semibold">
                      {channel.metrics.er.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="text-sm text-gray-500">От</div>
                  <div className="text-xl font-bold">
                    ${Math.min(...channel.formats.map((f) => f.price.value))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredChannels.length === 0 && (
          <div className="py-20 text-center">
            <p className="mb-4 text-lg text-gray-600">
              Ничего не найдено по вашим фильтрам
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedPlatforms([])
                setSelectedTopics([])
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
