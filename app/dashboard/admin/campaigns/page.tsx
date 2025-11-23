/**
 * Admin Campaign Moderation Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Flag,
  Search,
  ExternalLink,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Campaign {
  id: string
  title: string
  description: string
  goal: string
  status: string
  total_budget: number
  payment_status: string
  start_date: string
  end_date: string
  moderation_status: string
  moderation_notes: string | null
  advertiser: {
    name: string
    email: string
  }
  selected_channels: any[]
  created_at: string
}

export default function AdminCampaignsPage() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') || 'all'

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(statusFilter)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/campaigns')

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }

      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleModerate(
    campaignId: string,
    action: 'approve' | 'reject' | 'flag',
    notes?: string
  ) {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      })

      if (!response.ok) {
        throw new Error('Failed to moderate campaign')
      }

      await fetchCampaigns()
    } catch (error) {
      console.error('Error moderating campaign:', error)
      alert('Ошибка модерации кампании')
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.advertiser.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      selectedStatus === 'all' || campaign.moderation_status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: campaigns.length,
    pending: campaigns.filter((c) => c.moderation_status === 'pending').length,
    approved: campaigns.filter((c) => c.moderation_status === 'approved').length,
    rejected: campaigns.filter((c) => c.moderation_status === 'rejected').length,
    flagged: campaigns.filter((c) => c.moderation_status === 'flagged').length,
  }

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Moderation</h1>
          <p className="text-gray-600">Review and approve advertising campaigns</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {(['all', 'pending', 'approved', 'rejected', 'flagged'] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedStatus === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} (
                  {statusCounts[status]})
                </button>
              )
            )}
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center">
              <p className="text-gray-600">No campaigns found</p>
            </div>
          ) : (
            filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  {/* Campaign Info */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.title}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          campaign.moderation_status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : campaign.moderation_status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : campaign.moderation_status === 'flagged'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {campaign.moderation_status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          campaign.payment_status === 'succeeded'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {campaign.payment_status}
                      </span>
                    </div>

                    <p className="mb-3 text-sm text-gray-600">
                      By {campaign.advertiser.name} ({campaign.advertiser.email})
                    </p>

                    <p className="mb-4 text-sm text-gray-700 line-clamp-2">
                      {campaign.description}
                    </p>

                    <div className="mb-3 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {formatBudget(campaign.total_budget)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">
                          {formatDate(campaign.start_date)} -{' '}
                          {formatDate(campaign.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">
                          🎯 {campaign.goal}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">
                          📢 {campaign.selected_channels?.length || 0} channels
                        </span>
                      </div>
                    </div>

                    {campaign.moderation_notes && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {campaign.moderation_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-6 flex flex-col gap-2">
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      View <ExternalLink className="h-4 w-4" />
                    </Link>

                    {campaign.moderation_status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleModerate(campaign.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            const notes = prompt('Rejection reason:')
                            if (notes) {
                              handleModerate(campaign.id, 'reject', notes)
                            }
                          }}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}

                    {campaign.moderation_status === 'approved' && (
                      <Button
                        onClick={() => {
                          const notes = prompt('Reason for flagging:')
                          if (notes) {
                            handleModerate(campaign.id, 'flag', notes)
                          }
                        }}
                        variant="outline"
                        className="border-orange-600 text-orange-600 hover:bg-orange-50"
                        size="sm"
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Flag
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
