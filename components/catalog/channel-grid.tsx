import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Channel } from '@/types'
import Link from 'next/link'
import { 
  Eye, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  ShieldCheck,
  Heart,
  ExternalLink
} from 'lucide-react'

interface ChannelGridProps {
  channels: Channel[]
}

const platformIcons: Record<string, string> = {
  youtube: '🎥',
  instagram: '📷',
  tiktok: '🎵',
  telegram: '✈️',
  vk: '🔵',
}

const topicLabels: Record<string, string> = {
  tech: 'Технологии',
  fitness: 'Фитнес',
  beauty: 'Красота',
  gaming: 'Игры',
  lifestyle: 'Лайфстайл',
  business: 'Бизнес',
  education: 'Образование',
  travel: 'Путешествия',
  food: 'Еда',
}

export function ChannelGrid({ channels }: ChannelGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Найдено каналов: {channels.length}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {channels.map((channel) => (
          <Card key={channel.id} className="overflow-hidden transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    {channel.platforms.map((platform) => (
                      <span key={platform} className="text-2xl">
                        {platformIcons[platform]}
                      </span>
                    ))}
                  </div>
                  <CardTitle className="mb-1">{channel.title}</CardTitle>
                  <p className="text-sm text-gray-500">{channel.handle}</p>
                </div>
                <button className="rounded-lg p-2 hover:bg-gray-100">
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {channel.topics.map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topicLabels[topic] || topic}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-4">
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    Подписчики
                  </div>
                  <div className="font-semibold">
                    {(channel.metrics.followers / 1000).toFixed(0)}K
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="h-3 w-3" />
                    Ср. просмотры
                  </div>
                  <div className="font-semibold">
                    {(channel.metrics.avg_views / 1000).toFixed(0)}K
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3" />
                    ER
                  </div>
                  <div className="font-semibold">{channel.metrics.er}%</div>
                </div>
              </div>

              {/* Price */}
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="mb-2 text-sm text-gray-600">От</div>
                <div className="mb-1 text-2xl font-bold">
                  ${Math.min(...channel.formats.map((f) => f.price.value))}
                </div>
                <div className="text-xs text-gray-500">
                  {channel.formats.length} формат(а) доступно
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {channel.brand_safety.verified && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Верифицирован
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Эскроу
                </Badge>
                {channel.rating.score >= 4.5 && (
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
                <Button variant="outline" size="sm">
                  Медиакит
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
