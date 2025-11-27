'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Users,
  Star,
  MessageCircle,
  Target,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  Calendar,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlacementsTimelineChart } from '@/components/charts/placements-timeline-chart'
import { PlacementsStatusChart } from '@/components/charts/placements-status-chart'
import { RevenueExpenseChart } from '@/components/charts/revenue-expense-chart'

interface ChartData {
  placementsTimeline: Array<{
    date: string
    created: number
    approved: number
    completed: number
  }>
  placementsStatus: Array<{
    name: string
    value: number
    color: string
  }>
  revenueExpense: Array<{
    month: string
    revenue: number
    expense: number
  }>
}

interface Analytics {
  campaigns?: {
    total: number
    active: number
    paused: number
    completed: number
    draft: number
    totalBudget: number
  }
  placements: {
    total: number
    proposal: number
    booked: number
    in_progress: number
    posted: number
    approved: number
    rejected: number
    totalSpent?: number
    totalEarned?: number
    avgPrice?: number
    avgEarnings?: number
    conversionRate?: number
    completionRate?: number
  }
  reviews: {
    given?: {
      total: number
      avgRating: number
    }
    received: {
      total: number
      avgRating: number
    }
  }
  messages: {
    totalConversations: number
    unreadCount: number
    activeConversations: number
  }
  charts?: ChartData
}

export default function AnalyticsPage() {
  const currentUserId = 'bf91c23b-7b52-4870-82f7-ba9ad852b49e'
  const currentUserType = 'advertiser' // TODO: Get from auth context

  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Load from API when ready
      // For now, use mock data
      const mockAnalytics: Analytics = {
        campaigns: {
          total: 12,
          active: 5,
          paused: 2,
          completed: 4,
          draft: 1,
        },
        placements: {
          total: 45,
          pending: 8,
          approved: 12,
          inProgress: 15,
          completed: 10,
        },
        revenue: {
          total: 450000,
          thisMonth: 125000,
          lastMonth: 98000,
          growth: 27.5,
        },
        conversions: {
          total: 1250,
          thisMonth: 380,
          lastMonth: 310,
          growth: 22.6,
        },
        topCampaigns: [
          {
            id: '1',
            name: 'Весенняя распродажа',
            spent: 85000,
            conversions: 420,
            roi: 180,
          },
          {
            id: '2',
            name: 'Запуск нового продукта',
            spent: 120000,
            conversions: 580,
            roi: 165,
          },
        ],
        topChannels: [
          {
            id: '1',
            name: 'TechReview',
            category: 'Технологии',
            placements: 8,
            conversions: 245,
            revenue: 95000,
          },
        ],
        reviews: {
          received: {
            total: 24,
            avgRating: 4.7,
          },
          given: {
            total: 18,
            avgRating: 4.5,
          },
        },
        messages: {
          totalConversations: 15,
          unreadCount: 3,
          activeConversations: 8,
        },
        charts: {
          placementsTimeline: [
            { date: '01.11', created: 5, approved: 3, completed: 2 },
            { date: '08.11', created: 8, approved: 6, completed: 4 },
            { date: '15.11', created: 12, approved: 10, completed: 7 },
            { date: '22.11', created: 10, approved: 9, completed: 8 },
          ],
          placementsStatus: [
            { name: 'Ожидает', value: 8, color: '#fbbf24' },
            { name: 'Одобрено', value: 12, color: '#10b981' },
            { name: 'В работе', value: 15, color: '#3b82f6' },
            { name: 'Завершено', value: 10, color: '#8b5cf6' },
          ],
          revenueExpense: [
            { month: 'Авг', revenue: 75000, expense: 65000 },
            { month: 'Сен', revenue: 98000, expense: 82000 },
            { month: 'Окт', revenue: 125000, expense: 105000 },
            { month: 'Ноя', revenue: 152000, expense: 128000 },
          ],
        },
      }

      setAnalytics(mockAnalytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Аналитика</h1>
        <p className="text-gray-600">
          {currentUserType === 'advertiser'
            ? 'Статистика ваших кампаний и размещений'
            : 'Статистика ваших размещений и доходов'}
        </p>
      </div>

      {/* Campaigns Stats (Advertiser only) */}
      {currentUserType === 'advertiser' && analytics.campaigns && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Кампании</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Всего кампаний</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.campaigns.total}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Активных</p>
                    <p className="text-3xl font-bold text-green-600">
                      {analytics.campaigns.active}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Завершённых</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {analytics.campaigns.completed}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Общий бюджет</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(analytics.campaigns.totalBudget)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Placements Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Размещения</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Всего</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.placements.total}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">В работе</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {analytics.placements.in_progress}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Завершено</p>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics.placements.approved}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {currentUserType === 'advertiser' ? 'Потрачено' : 'Заработано'}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(
                      currentUserType === 'advertiser'
                        ? analytics.placements.totalSpent || 0
                        : analytics.placements.totalEarned || 0
                    )}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placements Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Предложения</p>
                <p className="text-2xl font-bold text-gray-700">
                  {analytics.placements.proposal}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Забронировано</p>
                <p className="text-2xl font-bold text-blue-700">
                  {analytics.placements.booked}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">В работе</p>
                <p className="text-2xl font-bold text-orange-700">
                  {analytics.placements.in_progress}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Опубликовано</p>
                <p className="text-2xl font-bold text-green-700">
                  {analytics.placements.posted}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Одобрено</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {analytics.placements.approved}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Отклонено</p>
                <p className="text-2xl font-bold text-red-700">
                  {analytics.placements.rejected}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {currentUserType === 'advertiser'
                    ? 'Средняя стоимость'
                    : 'Средний заработок'}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(
                    currentUserType === 'advertiser'
                      ? analytics.placements.avgPrice || 0
                      : analytics.placements.avgEarnings || 0
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {currentUserType === 'advertiser'
                    ? 'Конверсия'
                    : 'Завершаемость'}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {(
                    currentUserType === 'advertiser'
                      ? analytics.placements.conversionRate || 0
                      : analytics.placements.completionRate || 0
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Успешность</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.placements.total > 0
                    ? (
                        (analytics.placements.approved /
                          (analytics.placements.total - analytics.placements.proposal)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {analytics.charts && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Визуализация данных</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlacementsTimelineChart 
                data={analytics.charts.placementsTimeline}
              />
              <PlacementsStatusChart 
                data={analytics.charts.placementsStatus}
              />
            </div>

            <div className="mt-6">
              <RevenueExpenseChart
                data={analytics.charts.revenueExpense}
                userType={currentUserType}
              />
            </div>
          </div>
        )}
      </div>

      {/* Reviews Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Отзывы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Получено отзывов</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.reviews.received.total}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              {analytics.reviews.received.total > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Средний рейтинг</p>
                  <div className="flex items-center gap-2">
                    <div className="text-4xl font-bold text-yellow-500">
                      {analytics.reviews.received.avgRating.toFixed(1)}
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(analytics.reviews.received.avgRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {analytics.reviews.given && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Оставлено отзывов</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.reviews.given.total}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-blue-500" />
                </div>
                {analytics.reviews.given.total > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Средняя оценка</p>
                    <div className="flex items-center gap-2">
                      <div className="text-4xl font-bold text-blue-500">
                        {analytics.reviews.given.avgRating.toFixed(1)}
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.round(analytics.reviews.given.avgRating)
                                ? 'fill-blue-400 text-blue-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Messages Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Сообщения</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Всего диалогов</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.messages.totalConversations}
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Активных</p>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics.messages.activeConversations}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Непрочитанных</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {analytics.messages.unreadCount}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
