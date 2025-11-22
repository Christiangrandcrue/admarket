'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Users,
  Settings,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export default function CreatorChannelPage() {
  const [channel, setChannel] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch user's channel from API
    // For now, placeholder
    setLoading(false)
  }, [])

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

        {/* Channel Setup Notice */}
        <div className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-orange-900">
                Настройка канала
              </h3>
              <p className="mb-4 text-sm text-orange-700">
                Для получения заявок от рекламодателей необходимо добавить свой канал в каталог. 
                Укажите метрики, аудиторию, прайс на размещения и пройдите верификацию.
              </p>
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Добавить канал в каталог
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Статус канала</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Settings className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">Не настроен</p>
            <p className="mt-2 text-sm text-gray-600">Требуется заполнение данных</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Верификация</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <CheckCircle2 className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">Не пройдена</p>
            <p className="mt-2 text-sm text-gray-600">Подтвердите владение</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Прайс</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">Не указан</p>
            <p className="mt-2 text-sm text-gray-600">Установите цены</p>
          </div>
        </div>

        {/* Setup Sections */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Основная информация
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Платформа
                </label>
                <p className="text-sm text-gray-600">
                  Выберите платформу: TikTok, YouTube, Instagram, Telegram, VK
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Название канала / Handle
                </label>
                <p className="text-sm text-gray-600">
                  Например: @your_channel
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Тематика
                </label>
                <p className="text-sm text-gray-600">
                  Tech, Fashion, Food, Gaming, и т.д.
                </p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Метрики и аудитория
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Количество подписчиков
                </label>
                <p className="text-sm text-gray-600">
                  Текущее количество подписчиков
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Средние просмотры
                </label>
                <p className="text-sm text-gray-600">
                  Среднее количество просмотров на публикацию
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Engagement Rate (ER)
                </label>
                <p className="text-sm text-gray-600">
                  Процент вовлечённости аудитории
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Прайс на размещения
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    📸 Story / Stories (₽)
                  </label>
                  <p className="text-sm text-gray-600">Цена за сторис</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    📝 Пост (₽)
                  </label>
                  <p className="text-sm text-gray-600">Цена за пост</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    🎥 Видео (₽)
                  </label>
                  <p className="text-sm text-gray-600">Цена за видео</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    ⚡ Short / Reels (₽)
                  </label>
                  <p className="text-sm text-gray-600">Цена за короткое видео</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <Button size="lg" className="w-full md:w-auto">
            Сохранить изменения
          </Button>
        </div>
      </div>
    </div>
  )
}
