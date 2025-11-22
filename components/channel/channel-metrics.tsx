'use client'

import { Users, Eye, TrendingUp, Target, DollarSign, Zap } from 'lucide-react'
import type { Channel } from '@/types'

interface ChannelMetricsProps {
  channel: Channel
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

export function ChannelMetrics({ channel }: ChannelMetricsProps) {
  const metrics = channel.metrics || {}

  const metricsData = [
    {
      icon: Users,
      label: 'Подписчики',
      value: formatNumber(metrics.followers || 0),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Eye,
      label: 'Средние просмотры',
      value: formatNumber(metrics.avg_views || 0),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      label: 'Engagement Rate',
      value: `${metrics.er || 0}%`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Target,
      label: 'Охват',
      value: formatNumber(metrics.reach || metrics.avg_views || 0),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Zap,
      label: 'Вовлечённость',
      value: formatNumber(metrics.engagement || 0),
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      icon: DollarSign,
      label: 'Средняя цена',
      value: metrics.avg_price ? `${formatNumber(metrics.avg_price)} ₽` : 'По запросу',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Ключевые метрики</h2>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metricsData.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className={`rounded-lg ${metric.bgColor} p-2`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {metric.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
