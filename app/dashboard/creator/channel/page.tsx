'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react'

interface ChannelFormData {
  channel_id?: string
  platform: string
  handle: string
  title: string
  description: string
  category: string
  followers_count: number
  avg_views: number
  engagement_rate: number
  formats: {
    story?: number
    post?: number
    video?: number
    short?: number
    integration?: number
    dedicated?: number
  }
}

const initialFormData: ChannelFormData = {
  platform: 'instagram',
  handle: '',
  title: '',
  description: '',
  category: 'lifestyle',
  followers_count: 0,
  avg_views: 0,
  engagement_rate: 0,
  formats: {},
}

export default function CreatorChannelPage() {
  const [formData, setFormData] = useState<ChannelFormData>(initialFormData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchChannel()
  }, [])

  const fetchChannel = async () => {
    try {
      const response = await fetch('/api/creator/channel')
      const data = await response.json()

      if (response.ok && data.channels && data.channels.length > 0) {
        const channel = data.channels[0]
        setFormData({
          channel_id: channel.id,
          platform: channel.platform || 'instagram',
          handle: channel.handle || '',
          title: channel.title || '',
          description: channel.description || '',
          category: channel.category || 'lifestyle',
          followers_count: channel.followers_count || 0,
          avg_views: channel.avg_views || 0,
          engagement_rate: channel.engagement_rate || 0,
          formats: channel.formats || {},
        })
      }
    } catch (error: any) {
      console.error('Error fetching channel:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const endpoint = '/api/creator/channel'
      const method = formData.channel_id ? 'PATCH' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save channel')
      }

      setSuccess(true)
      if (!formData.channel_id && data.channel) {
        setFormData((prev) => ({ ...prev, channel_id: data.channel.id }))
      }
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error saving channel:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof ChannelFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateFormatPrice = (format: string, price: number) => {
    setFormData((prev) => ({
      ...prev,
      formats: { ...prev.formats, [format]: price },
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/dashboard/creator"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться в дашборд
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мой канал</h1>
            <p className="text-gray-600">Управление профилем, ценами и форматами</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-semibold text-green-900">Изменения сохранены успешно!</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="font-semibold text-red-900">Ошибка: {error}</p>
            </div>
          </div>
        )}

        {/* Notice for new channels */}
        {!formData.channel_id && (
          <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-blue-900">
                  Добавьте свой канал в каталог
                </h3>
                <p className="text-sm text-blue-700">
                  Заполните информацию о канале, метрики и прайс. После проверки модератором
                  ваш канал появится в каталоге и рекламодатели смогут отправлять заявки.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Основная информация
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Платформа <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => updateField('platform', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 focus:border-purple-600 focus:outline-none"
                  required
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="telegram">Telegram</option>
                  <option value="vk">VK</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Handle / Username <span className="text-red-600">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.handle}
                  onChange={(e) => updateField('handle', e.target.value)}
                  placeholder="@your_channel"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Название канала <span className="text-red-600">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Название вашего канала"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Краткое описание вашего контента..."
                  className="min-h-[100px] w-full rounded-xl border border-gray-200 p-3 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Тематика <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 focus:border-purple-600 focus:outline-none"
                  required
                >
                  <option value="lifestyle">Lifestyle</option>
                  <option value="tech">Tech & Gadgets</option>
                  <option value="fashion">Fashion & Beauty</option>
                  <option value="food">Food & Cooking</option>
                  <option value="travel">Travel</option>
                  <option value="gaming">Gaming</option>
                  <option value="fitness">Fitness & Health</option>
                  <option value="business">Business & Finance</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Метрики и аудитория
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Подписчики <span className="text-red-600">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.followers_count}
                  onChange={(e) => updateField('followers_count', parseInt(e.target.value) || 0)}
                  placeholder="10000"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Средние просмотры
                </label>
                <Input
                  type="number"
                  value={formData.avg_views}
                  onChange={(e) => updateField('avg_views', parseInt(e.target.value) || 0)}
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  ER (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.engagement_rate}
                  onChange={(e) => updateField('engagement_rate', parseFloat(e.target.value) || 0)}
                  placeholder="3.5"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Прайс на размещения
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Укажите цены в рублях за каждый формат размещения
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  📸 Story / Stories (₽)
                </label>
                <Input
                  type="number"
                  value={formData.formats.story || ''}
                  onChange={(e) => updateFormatPrice('story', parseInt(e.target.value) || 0)}
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  📝 Пост (₽)
                </label>
                <Input
                  type="number"
                  value={formData.formats.post || ''}
                  onChange={(e) => updateFormatPrice('post', parseInt(e.target.value) || 0)}
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  🎥 Видео (₽)
                </label>
                <Input
                  type="number"
                  value={formData.formats.video || ''}
                  onChange={(e) => updateFormatPrice('video', parseInt(e.target.value) || 0)}
                  placeholder="15000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  ⚡ Short / Reels (₽)
                </label>
                <Input
                  type="number"
                  value={formData.formats.short || ''}
                  onChange={(e) => updateFormatPrice('short', parseInt(e.target.value) || 0)}
                  placeholder="8000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  🎬 Интеграция в видео (₽)
                </label>
                <Input
                  type="number"
                  value={formData.formats.integration || ''}
                  onChange={(e) => updateFormatPrice('integration', parseInt(e.target.value) || 0)}
                  placeholder="20000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  🎯 Отдельный ролик (₽)
                </label>
                <Input
                  type="number"
                  value={formData.formats.dedicated || ''}
                  onChange={(e) => updateFormatPrice('dedicated', parseInt(e.target.value) || 0)}
                  placeholder="30000"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {formData.channel_id ? 'Сохранить изменения' : 'Создать канал'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
