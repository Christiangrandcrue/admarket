/**
 * Admin Dashboard - Main Overview Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Building2,
  Megaphone,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Flag,
} from 'lucide-react'

interface DashboardStats {
  users: {
    total: number
    advertisers: number
    creators: number
    admins: number
    active: number
    suspended: number
  }
  channels: {
    total: number
    pending: number
    approved: number
    rejected: number
    flagged: number
  }
  campaigns: {
    total: number
    active: number
    pending: number
    completed: number
  }
  financials: {
    gmv: number
    revenue: number
    payouts: number
    pendingPayouts: number
  }
  flags: {
    total: number
    pending: number
    resolved: number
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  async function fetchDashboardStats() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard')

      if (response.status === 403) {
        setError('Access denied. Admin role required.')
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
          <p className="mt-4 text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and moderation tools</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Users */}
          <Link
            href="/dashboard/admin/users"
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
            <p className="mt-2 text-sm text-gray-600">Users</p>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span>{stats.users.advertisers} Advertisers</span>
              <span>{stats.users.creators} Creators</span>
            </div>
          </Link>

          {/* Channels */}
          <Link
            href="/dashboard/admin/channels"
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                {stats.channels.pending} Pending
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.channels.total}</p>
            <p className="mt-2 text-sm text-gray-600">Channels</p>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span>✅ {stats.channels.approved}</span>
              <span>❌ {stats.channels.rejected}</span>
            </div>
          </Link>

          {/* Campaigns */}
          <Link
            href="/dashboard/admin/campaigns"
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Megaphone className="h-6 w-6 text-purple-600" />
              </div>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                {stats.campaigns.active} Active
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.campaigns.total}</p>
            <p className="mt-2 text-sm text-gray-600">Campaigns</p>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span>⏳ {stats.campaigns.pending}</span>
              <span>✅ {stats.campaigns.completed}</span>
            </div>
          </Link>

          {/* Financials */}
          <Link
            href="/dashboard/admin/financials"
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
              }).format(stats.financials.revenue)}
            </p>
            <p className="mt-2 text-sm text-gray-600">Platform Revenue</p>
            <div className="mt-4 text-xs text-gray-500">
              GMV: {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
              }).format(stats.financials.gmv)}
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Reviews */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Pending Reviews
            </h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/admin/channels?status=pending"
                className="flex items-center justify-between rounded-lg bg-yellow-50 p-4 transition hover:bg-yellow-100"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">Channel Verifications</p>
                    <p className="text-sm text-gray-600">
                      {stats.channels.pending} channels waiting
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {stats.channels.pending}
                </span>
              </Link>

              <Link
                href="/dashboard/admin/campaigns?status=pending"
                className="flex items-center justify-between rounded-lg bg-blue-50 p-4 transition hover:bg-blue-100"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Campaign Approvals</p>
                    <p className="text-sm text-gray-600">
                      {stats.campaigns.pending} campaigns waiting
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.campaigns.pending}
                </span>
              </Link>

              <Link
                href="/dashboard/admin/flags?status=pending"
                className="flex items-center justify-between rounded-lg bg-red-50 p-4 transition hover:bg-red-100"
              >
                <div className="flex items-center gap-3">
                  <Flag className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Flagged Content</p>
                    <p className="text-sm text-gray-600">
                      {stats.flags.pending} reports pending
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {stats.flags.pending}
                </span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Quick Links
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/admin/users"
                className="rounded-lg border border-gray-200 p-4 text-center transition hover:border-purple-300 hover:bg-purple-50"
              >
                <Users className="mx-auto h-6 w-6 text-gray-600" />
                <p className="mt-2 text-sm font-medium text-gray-900">Users</p>
              </Link>

              <Link
                href="/dashboard/admin/channels"
                className="rounded-lg border border-gray-200 p-4 text-center transition hover:border-purple-300 hover:bg-purple-50"
              >
                <Building2 className="mx-auto h-6 w-6 text-gray-600" />
                <p className="mt-2 text-sm font-medium text-gray-900">Channels</p>
              </Link>

              <Link
                href="/dashboard/admin/campaigns"
                className="rounded-lg border border-gray-200 p-4 text-center transition hover:border-purple-300 hover:bg-purple-50"
              >
                <Megaphone className="mx-auto h-6 w-6 text-gray-600" />
                <p className="mt-2 text-sm font-medium text-gray-900">Campaigns</p>
              </Link>

              <Link
                href="/dashboard/admin/settings"
                className="rounded-lg border border-gray-200 p-4 text-center transition hover:border-purple-300 hover:bg-purple-50"
              >
                <CheckCircle className="mx-auto h-6 w-6 text-gray-600" />
                <p className="mt-2 text-sm font-medium text-gray-900">Settings</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
