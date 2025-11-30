'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const [currentUserType, setCurrentUserType] = useState<'advertiser' | 'creator'>('advertiser')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Пользователь не авторизован')

      // 1. Get Profile Role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      const role = profile?.role || 'advertiser'
      setCurrentUserType(role)

      // 2. Fetch Data based on Role
      let campaignsStats = { total: 0, active: 0, paused: 0, completed: 0, draft: 0, totalBudget: 0 }
      let placementsStats = { total: 0, proposal: 0, booked: 0, in_progress: 0, posted: 0, approved: 0, rejected: 0, totalSpent: 0, totalEarned: 0 }
      
      if (role === 'advertiser') {
        // Fetch Campaigns
        const { data: campaigns } = await supabase
            .from('campaigns')
            .select('id, status, budget')
            .eq('advertiser_id', user.id)
        
        if (campaigns) {
            campaignsStats.total = campaigns.length
            campaignsStats.active = campaigns.filter(c => c.status === 'active').length
            campaignsStats.completed = campaigns.filter(c => c.status === 'closed').length // map closed to completed
            campaignsStats.totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
        }

        // Fetch Applications (as Placements) for my campaigns
        // We need to join, but Supabase JS client doesn't do deep joins easily on counts.
        // Let's fetch applications where campaign_id is in my campaigns list
        if (campaigns && campaigns.length > 0) {
            const campaignIds = campaigns.map(c => c.id)
            const { data: applications } = await supabase
                .from('applications')
                .select('status, bid_amount')
                .in('campaign_id', campaignIds)
            
            if (applications) {
                placementsStats.total = applications.length
                placementsStats.proposal = applications.filter(a => a.status === 'pending').length
                placementsStats.approved = applications.filter(a => a.status === 'accepted').length
                placementsStats.rejected = applications.filter(a => a.status === 'rejected').length
                // Assuming 'accepted' means spent for now
                placementsStats.totalSpent = applications
                    .filter(a => a.status === 'accepted')
                    .reduce((sum, a) => sum + (a.bid_amount || 0), 0)
            }
        }

      } else {
        // CREATOR Logic
        const { data: applications } = await supabase
            .from('applications')
            .select('status, bid_amount')
            .eq('creator_id', user.id)
        
        if (applications) {
            placementsStats.total = applications.length
            placementsStats.proposal = applications.filter(a => a.status === 'pending').length
            placementsStats.approved = applications.filter(a => a.status === 'accepted').length
            placementsStats.rejected = applications.filter(a => a.status === 'rejected').length
            placementsStats.totalEarned = applications
                .filter(a => a.status === 'accepted')
                .reduce((sum, a) => sum + (a.bid_amount || 0), 0)
        }
      }

      // 3. Construct Analytics Object
      const realAnalytics: Analytics = {
        campaigns: campaignsStats,
        placements: {
            ...placementsStats,
            avgPrice: placementsStats.approved > 0 ? (placementsStats.totalSpent / placementsStats.approved) : 0,
            avgEarnings: placementsStats.approved > 0 ? (placementsStats.totalEarned / placementsStats.approved) : 0,
            completionRate: 95, // Mock
            conversionRate: 3.5, // Mock
        },
        revenue: { // Mocked for chart
          total: role === 'advertiser' ? placementsStats.totalSpent : placementsStats.totalEarned,
          thisMonth: role === 'advertiser' ? placementsStats.totalSpent * 0.3 : placementsStats.totalEarned * 0.3,
          lastMonth: role === 'advertiser' ? placementsStats.totalSpent * 0.2 : placementsStats.totalEarned * 0.2,
          growth: 15,
        },
        // ... other mocks ...
        reviews: {
          received: { total: 12, avgRating: 4.8 },
          given: { total: 8, avgRating: 4.9 },
        },
        messages: {
          totalConversations: 5,
          unreadCount: 0,
          activeConversations: 2,
        },
        charts: {
          placementsTimeline: [
            { date: '01.11', created: 2, approved: 1, completed: 0 },
            { date: '08.11', created: 5, approved: 3, completed: 1 },
            { date: '15.11', created: 8, approved: 5, completed: 4 },
            { date: '22.11', created: 4, approved: 6, completed: 5 },
          ],
          placementsStatus: [
            { name: 'Ожидает', value: placementsStats.proposal, color: '#fbbf24' },
            { name: 'Одобрено', value: placementsStats.approved, color: '#10b981' },
            { name: 'Отклонено', value: placementsStats.rejected, color: '#ef4444' },
          ],
          revenueExpense: [
            { month: 'Сен', revenue: 50000, expense: 40000 },
            { month: 'Окт', revenue: 75000, expense: 60000 },
            { month: 'Ноя', revenue: 100000, expense: 80000 },
          ],
        },
      }

      setAnalytics(realAnalytics)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Произошла ошибка загрузки аналитики')
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
