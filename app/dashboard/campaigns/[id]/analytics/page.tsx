'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  TrendingUp,
  Eye,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  Percent,
  Target,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

interface Analytics {
  overview: {
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    totalReach: number
    ctr: number
    conversionRate: number
    cpm: number
    cpc: number
    cpa: number
  }
  roi: {
    budget: number
    revenue: number
    profit: number
    roi: number
    avgOrderValue: number
  }
  daily: Array<{
    date: string
    impressions: number
    clicks: number
    conversions: number
    reach: number
  }>
  channelPerformance: Array<{
    placement_id: string
    channel_id: string
    channel_title: string
    platform: string
    followers: number
    engagement_rate: number
    budget: number
    impressions: number
    clicks: number
    conversions: number
    ctr: string
    cpa: string
    roi: string
    content_status: string
  }>
  campaign: {
    id: string
    title: string
    status: string
    start_date: string
    end_date: string
    total_budget: number
  }
}

export default function CampaignAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const [campaignId, setCampaignId] = useState<string>('')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => {
      setCampaignId(id)
      fetchAnalytics(id)
    })
  }, [])

  const fetchAnalytics = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}/analytics`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }

      setAnalytics(data.analytics)
    } catch (error: any) {
      console.error('Error fetching analytics:', error)
      setError(error.message || 'Ошибка загрузки аналитики')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="text-gray-600">Загрузка аналитики...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">{error || 'Аналитика не найдена'}</p>
          <Link href={`/dashboard/campaigns/${campaignId}`}>
            <Button className="mt-4">Вернуться к кампании</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link 
        href={`/dashboard/campaigns/${campaignId}`} 
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к кампании
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Аналитика кампании</h1>
        <p className="text-gray-600">{analytics.campaign.title}</p>
      </div>

      {/* Overview Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">Показы</div>
            <div className="rounded-full bg-blue-100 p-2">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatNumber(analytics.overview.totalImpressions)}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            CPM: {formatCurrency(analytics.overview.cpm)}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">Клики</div>
            <div className="rounded-full bg-purple-100 p-2">
              <MousePointerClick className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatNumber(analytics.overview.totalClicks)}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            CTR: {analytics.overview.ctr}% | CPC: {formatCurrency(analytics.overview.cpc)}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">Конверсии</div>
            <div className="rounded-full bg-green-100 p-2">
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatNumber(analytics.overview.totalConversions)}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            CR: {analytics.overview.conversionRate}% | CPA: {formatCurrency(analytics.overview.cpa)}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">Охват</div>
            <div className="rounded-full bg-orange-100 p-2">
              <Target className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatNumber(analytics.overview.totalReach)}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Уникальных пользователей
          </div>
        </div>
      </div>

      {/* ROI Card */}
      <div className="mb-8 rounded-2xl border border-gray-100 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Возврат инвестиций (ROI)</h2>
          <div className="rounded-full bg-white p-3 shadow-sm">
            <TrendingUp className={`h-6 w-6 ${analytics.roi.roi >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div>
            <div className="mb-1 text-sm text-gray-600">Бюджет</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(analytics.roi.budget)}
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-gray-600">Выручка</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.roi.revenue)}
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-gray-600">Прибыль</div>
            <div className={`text-2xl font-bold ${analytics.roi.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(analytics.roi.profit)}
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-gray-600">ROI</div>
            <div className={`text-2xl font-bold ${analytics.roi.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.roi.roi > 0 ? '+' : ''}{analytics.roi.roi}%
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-white/80 p-3">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Расчёт:</span> Средний чек {formatCurrency(analytics.roi.avgOrderValue)} × {formatNumber(analytics.overview.totalConversions)} конверсий = {formatCurrency(analytics.roi.revenue)} выручка
          </p>
        </div>
      </div>

      {/* Daily Performance Chart */}
      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Динамика показателей</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="impressions" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Показы"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="#7c3aed" 
              strokeWidth={2}
              name="Клики"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="conversions" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Конверсии"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Performance Table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Эффективность по каналам</h2>

        {analytics.channelPerformance.length === 0 ? (
          <div className="py-12 text-center text-gray-600">
            Нет данных по каналам
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Канал</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Платформа</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">Бюджет</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">Показы</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">Клики</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">Конверсии</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">CTR</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">CPA</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">ROI</th>
                </tr>
              </thead>
              <tbody>
                {analytics.channelPerformance.map((channel, index) => (
                  <tr 
                    key={channel.placement_id} 
                    className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="py-4 text-sm font-medium text-gray-900">
                      {channel.channel_title}
                      {channel.content_status === 'approved' && (
                        <span className="ml-2 text-xs text-green-600">✓</span>
                      )}
                    </td>
                    <td className="py-4 text-sm text-gray-600">{channel.platform}</td>
                    <td className="py-4 text-right text-sm text-gray-900">
                      {formatCurrency(channel.budget)}
                    </td>
                    <td className="py-4 text-right text-sm text-gray-900">
                      {formatNumber(channel.impressions)}
                    </td>
                    <td className="py-4 text-right text-sm text-gray-900">
                      {formatNumber(channel.clicks)}
                    </td>
                    <td className="py-4 text-right text-sm text-gray-900">
                      {formatNumber(channel.conversions)}
                    </td>
                    <td className="py-4 text-right text-sm text-gray-600">
                      {channel.ctr}%
                    </td>
                    <td className="py-4 text-right text-sm text-gray-600">
                      {formatCurrency(parseFloat(channel.cpa))}
                    </td>
                    <td className={`py-4 text-right text-sm font-semibold ${
                      parseFloat(channel.roi) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(channel.roi) > 0 ? '+' : ''}{channel.roi}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
