'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, SlidersHorizontal } from 'lucide-react'

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

interface CatalogFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  resultCount: number
}

const platformOptions = [
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'youtube', label: 'YouTube', icon: '🎥' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' },
  { id: 'vk', label: 'VK', icon: '🔵' },
]

const topicOptions = [
  { id: 'fitness', label: 'Фитнес' },
  { id: 'tech', label: 'Технологии' },
  { id: 'beauty', label: 'Красота' },
  { id: 'gaming', label: 'Игры' },
  { id: 'lifestyle', label: 'Лайфстайл' },
  { id: 'business', label: 'Бизнес' },
  { id: 'crypto', label: 'Криптовалюты' },
  { id: 'food', label: 'Еда' },
  { id: 'travel', label: 'Путешествия' },
]

const sortOptions = [
  { id: 'followers', label: 'По подписчикам' },
  { id: 'er', label: 'По ER' },
  { id: 'rating', label: 'По рейтингу' },
]

export function CatalogFilters({ filters, onFiltersChange, resultCount }: CatalogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const togglePlatform = (platformId: string) => {
    const newPlatforms = filters.platforms.includes(platformId)
      ? filters.platforms.filter(p => p !== platformId)
      : [...filters.platforms, platformId]
    onFiltersChange({ ...filters, platforms: newPlatforms })
  }

  const toggleTopic = (topicId: string) => {
    const newTopics = filters.topics.includes(topicId)
      ? filters.topics.filter(t => t !== topicId)
      : [...filters.topics, topicId]
    onFiltersChange({ ...filters, topics: newTopics })
  }

  const resetFilters = () => {
    onFiltersChange({
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

  const hasActiveFilters = 
    filters.platforms.length > 0 ||
    filters.topics.length > 0 ||
    filters.followersMin > 0 ||
    filters.followersMax < 1000000 ||
    filters.erMin > 0 ||
    filters.erMax < 20 ||
    filters.verifiedOnly

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <div className="text-sm text-gray-600">
          Найдено: <span className="font-semibold text-gray-900">{resultCount}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
          {hasActiveFilters && (
            <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              !
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      <div
        className={`space-y-6 rounded-2xl border border-gray-100 bg-white p-6 ${
          isOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Фильтры</h2>
            <p className="text-sm text-gray-600">
              Найдено: <span className="font-semibold text-gray-900">{resultCount}</span>
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Сбросить
            </Button>
          )}
        </div>

        {/* Platform Filter */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Платформа</h3>
          <div className="flex flex-wrap gap-2">
            {platformOptions.map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                  filters.platforms.includes(platform.id)
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{platform.icon}</span>
                <span>{platform.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Filter */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Тематика</h3>
          <div className="flex flex-wrap gap-2">
            {topicOptions.map((topic) => (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  filters.topics.includes(topic.id)
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* Followers Range */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Подписчики</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>{formatNumber(filters.followersMin)}</span>
              <span>—</span>
              <span>{formatNumber(filters.followersMax)}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="10000"
              value={filters.followersMin}
              onChange={(e) =>
                onFiltersChange({ ...filters, followersMin: Number(e.target.value) })
              }
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="1000000"
              step="10000"
              value={filters.followersMax}
              onChange={(e) =>
                onFiltersChange({ ...filters, followersMax: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        </div>

        {/* ER Range */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Engagement Rate</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>{filters.erMin}%</span>
              <span>—</span>
              <span>{filters.erMax}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={filters.erMin}
              onChange={(e) =>
                onFiltersChange({ ...filters, erMin: Number(e.target.value) })
              }
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={filters.erMax}
              onChange={(e) =>
                onFiltersChange({ ...filters, erMax: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        </div>

        {/* Verified Only */}
        <div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) =>
                onFiltersChange({ ...filters, verifiedOnly: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-900">Только верифицированные</span>
          </label>
        </div>

        {/* Sort */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Сортировка</h3>
          <div className="space-y-2">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  sortBy: e.target.value as 'followers' | 'er' | 'rating',
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => onFiltersChange({ ...filters, sortOrder: 'desc' })}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                  filters.sortOrder === 'desc'
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                По убыванию
              </button>
              <button
                onClick={() => onFiltersChange({ ...filters, sortOrder: 'asc' })}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                  filters.sortOrder === 'asc'
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                По возрастанию
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
