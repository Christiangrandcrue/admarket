'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VideoGeneratorModal } from '@/components/turboboost/video-generator-modal'
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  Play,
  Users,
  BarChart3,
  Video,
} from 'lucide-react'

interface PlacementStats {
  total: number
  pending: number
  accepted: number
  rejected: number
  completed: number
}

export default function CreatorDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<PlacementStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showVideoGenerator, setShowVideoGenerator] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/creator/placements')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats')
      }

      setStats(data.stats || {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        completed: 0,
      })
    } catch (error: any) {
      console.error('Error fetching stats:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
              <p className="mt-4 text-gray-600">Загрузка...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                👋 Добро пожаловать, Креатор!
              </h1>
              <p className="text-gray-600">
                Управляйте вашими размещениями и заработком
              </p>
            </div>
            <Button
              onClick={() => setShowVideoGenerator(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Video className="mr-2 h-4 w-4" />
              🎬 AI Генерация видео
            </Button>
          </div>
        </div>

        {/* Video Generator Modal */}
        <VideoGeneratorModal
          isOpen={showVideoGenerator}
          onClose={() => setShowVideoGenerator(false)}
          onVideoGenerated={(url) => {
            console.log('Video generated:', url)
            // TODO: Add to video library or auto-publish
          }}
        />

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Ошибка загрузки</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Новые заявки</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Inbox className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            <p className="mt-2 text-sm text-gray-600">
              {stats.pending > 0 ? 'Требуют ответа' : 'Нет новых'}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Активные</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Play className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.accepted}</p>
            <p className="mt-2 text-sm text-gray-600">Принятые размещения</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Завершённые</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            <p className="mt-2 text-sm text-gray-600">Успешно выполнено</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Всего заявок</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="mt-2 text-sm text-gray-600">За всё время</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Быстрые действия</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/creator/requests">
              <div className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-purple-200 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200">
                  <Inbox className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Входящие заявки</h3>
                <p className="text-sm text-gray-600">
                  Просмотреть и ответить на предложения
                </p>
                {stats.pending > 0 && (
                  <Badge className="mt-3" variant="default">
                    {stats.pending} новых
                  </Badge>
                )}
              </div>
            </Link>

            <Link href="/dashboard/creator/active">
              <div className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-purple-200 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Активные размещения</h3>
                <p className="text-sm text-gray-600">
                  Управление текущими кампаниями
                </p>
              </div>
            </Link>

            <Link href="/dashboard/creator/earnings">
              <div className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-purple-200 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Заработок</h3>
                <p className="text-sm text-gray-600">
                  Финансы и история выплат
                </p>
              </div>
            </Link>

            <Link href="/dashboard/creator/channel">
              <div className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-purple-200 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Мой канал</h3>
                <p className="text-sm text-gray-600">
                  Профиль, цены и форматы
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Empty State for New Users */}
        {stats.total === 0 && !error && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
              <Inbox className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              У вас пока нет заявок
            </h2>
            <p className="mb-6 text-gray-600">
              Заявки от рекламодателей будут появляться здесь. Убедитесь, что ваш канал добавлен в каталог.
            </p>
            <Link href="/dashboard/creator/channel">
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Настроить профиль канала
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
