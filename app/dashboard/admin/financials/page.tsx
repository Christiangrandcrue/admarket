/**
 * Admin Financials Report Page
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FinancialStats {
  overview: {
    gmv: number
    revenue: number
    payouts: number
    pendingPayouts: number
    averageOrderValue: number
    platformFeeRate: number
  }
  growth: {
    gmvGrowth: number
    revenueGrowth: number
    campaignsGrowth: number
  }
  transactions: {
    totalTransactions: number
    successfulPayments: number
    failedPayments: number
    refunds: number
  }
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    status: string
    user_name: string
    created_at: string
  }>
}

export default function AdminFinancialsPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    fetchFinancials()
  }, [dateRange])

  async function fetchFinancials() {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/financials?days=${dateRange}`)

      if (!response.ok) {
        throw new Error('Failed to fetch financials')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching financials:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">Platform revenue and transaction analytics</p>
          </div>

          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">GMV</p>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.overview.gmv)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {stats.growth.gmvGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  stats.growth.gmvGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stats.growth.gmvGrowth > 0 ? '+' : ''}
                {stats.growth.gmvGrowth.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">vs prev period</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.overview.revenue)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {stats.growth.revenueGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  stats.growth.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stats.growth.revenueGrowth > 0 ? '+' : ''}
                {stats.growth.revenueGrowth.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">vs prev period</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Creator Payouts</p>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.overview.payouts)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Pending: {formatCurrency(stats.overview.pendingPayouts)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.overview.averageOrderValue)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Fee: {stats.overview.platformFeeRate}%
            </p>
          </div>
        </div>

        {/* Transaction Stats */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Transaction Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Transactions</span>
                <span className="text-xl font-bold text-gray-900">
                  {stats.transactions.totalTransactions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Successful Payments</span>
                <span className="text-lg font-semibold text-green-600">
                  {stats.transactions.successfulPayments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Failed Payments</span>
                <span className="text-lg font-semibold text-red-600">
                  {stats.transactions.failedPayments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Refunds</span>
                <span className="text-lg font-semibold text-orange-600">
                  {stats.transactions.refunds}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Revenue Breakdown
            </h2>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fees</span>
                  <span className="font-medium">
                    {formatCurrency(stats.overview.revenue)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-600"
                    style={{
                      width: `${(stats.overview.revenue / stats.overview.gmv) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600">Creator Payouts</span>
                  <span className="font-medium">
                    {formatCurrency(stats.overview.payouts)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{
                      width: `${(stats.overview.payouts / stats.overview.gmv) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {stats.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          tx.type === 'charge'
                            ? 'bg-blue-100 text-blue-700'
                            : tx.type === 'payout'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {tx.user_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          tx.status === 'succeeded'
                            ? 'bg-green-100 text-green-700'
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(tx.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
