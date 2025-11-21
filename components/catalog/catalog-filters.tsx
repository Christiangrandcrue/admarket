'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import type { Platform, Topic } from '@/types'

const platforms: { value: Platform; label: string }[] = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'vk', label: 'VK' },
]

const topics: { value: Topic; label: string }[] = [
  { value: 'tech', label: 'Технологии' },
  { value: 'fitness', label: 'Фитнес' },
  { value: 'beauty', label: 'Красота' },
  { value: 'gaming', label: 'Игры' },
  { value: 'lifestyle', label: 'Лайфстайл' },
  { value: 'business', label: 'Бизнес' },
  { value: 'education', label: 'Образование' },
  { value: 'travel', label: 'Путешествия' },
  { value: 'food', label: 'Еда' },
]

export function CatalogFilters() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([])

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

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Имя канала или @handle" />
        </CardContent>
      </Card>

      {/* Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Платформы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <Badge
                key={platform.value}
                variant={
                  selectedPlatforms.includes(platform.value)
                    ? 'default'
                    : 'outline'
                }
                className="cursor-pointer"
                onClick={() => togglePlatform(platform.value)}
              >
                {platform.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Тематика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Badge
                key={topic.value}
                variant={
                  selectedTopics.includes(topic.value) ? 'default' : 'outline'
                }
                className="cursor-pointer"
                onClick={() => toggleTopic(topic.value)}
              >
                {topic.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-600">Минимум (%)</label>
              <Input type="number" placeholder="0" min="0" max="100" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-600">Максимум (%)</label>
              <Input type="number" placeholder="100" min="0" max="100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Followers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Подписчики</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-600">От</label>
              <Input type="number" placeholder="10000" min="0" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-600">До</label>
              <Input type="number" placeholder="1000000" min="0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Цена (USD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-600">От</label>
              <Input type="number" placeholder="100" min="0" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-600">До</label>
              <Input type="number" placeholder="10000" min="0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
