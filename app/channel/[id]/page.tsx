import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockChannels } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import {
  Users,
  Eye,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Star,
  Clock,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
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

const formatLabels: Record<string, string> = {
  story: 'Story',
  post: 'Пост',
  short: 'Shorts',
  video: 'Видео',
  telegram_post: 'Telegram пост',
}

export default async function ChannelPage({ params }: PageProps) {
  const { id } = await params
  const channel = mockChannels.find((c) => c.id === id)

  if (!channel) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {/* Channel Info */}
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-2">
                  {channel.platforms.map((platform) => (
                    <span key={platform} className="text-3xl">
                      {platformIcons[platform]}
                    </span>
                  ))}
                </div>
                <h1 className="mb-2 text-4xl font-bold">{channel.title}</h1>
                <p className="mb-4 text-xl text-gray-500">{channel.handle}</p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {channel.topics.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topicLabels[topic] || topic}
                    </Badge>
                  ))}
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
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      Подписчики
                    </div>
                    <div className="text-2xl font-bold">
                      {channel.metrics.followers.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                      <Eye className="h-4 w-4" />
                      Ср. просмотры
                    </div>
                    <div className="text-2xl font-bold">
                      {channel.metrics.avg_views.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                      <TrendingUp className="h-4 w-4" />
                      ER
                    </div>
                    <div className="text-2xl font-bold">{channel.metrics.er}%</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="lg:w-80">
                <Card>
                  <CardHeader>
                    <div className="mb-2 text-sm text-gray-600">Цена от</div>
                    <CardTitle className="text-3xl">
                      ${Math.min(...channel.formats.map((f) => f.price.value))}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {channel.formats.length} формат(а) доступно
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full">Забронировать</Button>
                    <Button variant="outline" className="w-full">
                      Скачать медиакит
                    </Button>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {channel.rating.score}
                      </span>
                      <span>{channel.rating.reviews_count} отзывов</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>О канале</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{channel.description}</p>
                </CardContent>
              </Card>

              {/* Audience */}
              <Card>
                <CardHeader>
                  <CardTitle>Аудитория</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gender */}
                  <div>
                    <div className="mb-2 text-sm font-medium">Пол</div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between text-sm">
                          <span>Мужчины</span>
                          <span className="font-semibold">
                            {channel.audience.gender.male}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${channel.audience.gender.male}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between text-sm">
                          <span>Женщины</span>
                          <span className="font-semibold">
                            {channel.audience.gender.female}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-pink-500"
                            style={{ width: `${channel.audience.gender.female}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <div className="mb-2 text-sm font-medium">Возраст</div>
                    <div className="space-y-2">
                      {Object.entries(channel.audience.age).map(([range, percent]) => (
                        <div key={range}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span>{range}</span>
                            <span className="font-semibold">{percent}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100">
                            <div
                              className="h-2 rounded-full bg-black"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Geo */}
                  <div>
                    <div className="mb-3 text-sm font-medium">География</div>
                    <div className="space-y-2">
                      {channel.audience.geo.map(({ country, share }) => (
                        <div key={country} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {country}
                          </span>
                          <span className="font-semibold">{share}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formats & Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Форматы и цены</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 text-left text-sm text-gray-600">
                          <th className="pb-3 font-medium">Формат</th>
                          <th className="pb-3 font-medium">Цена</th>
                          <th className="pb-3 font-medium">Срок</th>
                          <th className="pb-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {channel.formats.map((format) => (
                          <tr key={format.id} className="border-b border-gray-50">
                            <td className="py-4">
                              <div className="font-medium">
                                {formatLabels[format.name] || format.name}
                              </div>
                              {format.duration_sec && (
                                <div className="text-sm text-gray-500">
                                  {format.duration_sec} сек
                                </div>
                              )}
                            </td>
                            <td className="py-4">
                              <div className="font-bold">
                                ${format.price.value}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format.price.model}
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                {format.sla_days} дней
                              </span>
                            </td>
                            <td className="py-4">
                              <Button size="sm">Выбрать</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brand Safety</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Верификация</span>
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Пройдена
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Последняя проверка</span>
                      <span className="font-medium">15 янв 2025</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Рейтинг</span>
                      <span className="font-medium">{channel.rating.score}/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Контакт</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Написать автору
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
