/**
 * Admin Channels Moderation Page
 */

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Flag,
  Search,
  Filter,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Channel {
  id: string
  title: string
  handle: string
  platforms: string[]
  topics: string[]
  metrics: {
    followers: number
    avg_views: number
    er: number
  }
  brand_safety: {
    verified: boolean
  }
  moderation_status: string
  moderation_notes: string | null
  creator: {
    name: string
    email: string
  }
  created_at: string
}

function AdminChannelsContent() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') || 'all'

  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(statusFilter)

  useEffect(() => {
    fetchChannels()
  }, [])

  async function fetchChannels() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/channels')

      if (!response.ok) {
        throw new Error('Failed to fetch channels')
      }

      const data = await response.json()
      setChannels(data.channels || [])
    } catch (error) {
      console.error('Error fetching channels:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleModerate(channelId: string, action: 'approve' | 'reject', notes?: string) {
    try {
      const response = await fetch(`/api/admin/channels/${channelId}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      })

      if (!response.ok) {
        throw new Error('Failed to moderate channel')
      }

      // Refresh channels list
      await fetchChannels()
    } catch (error) {
      console.error('Error moderating channel:', error)
      alert('Ошибка модерации канала')
    }
  }

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch =
      channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.creator.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      selectedStatus === 'all' || channel.moderation_status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: channels.length,
    pending: channels.filter((c) => c.moderation_status === 'pending').length,
    approved: channels.filter((c) => c.moderation_status === 'approved').length,
    rejected: channels.filter((c) => c.moderation_status === 'rejected').length,
    flagged: channels.filter((c) => c.moderation_status === 'flagged').length,
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
          <h1 className="text-3xl font-bold text-gray-900">Channel Moderation</h1>
          <p className="text-gray-600">Review and verify creator channels</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected', 'flagged'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {/* Channels List */}
        <div className="space-y-4">
          {filteredChannels.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center">
              <p className="text-gray-600">No channels found</p>
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <div
                key={channel.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  {/* Channel Info */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{channel.title}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          channel.moderation_status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : channel.moderation_status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : channel.moderation_status === 'flagged'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {channel.moderation_status}
                      </span>
                    </div>

                    <p className="mb-3 text-sm text-gray-600">
                      @{channel.handle} • {channel.creator.name} ({channel.creator.email})
                    </p>

                    <div className="mb-3 flex flex-wrap gap-2">
                      {channel.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                        >
                          {platform}
                        </span>
                      ))}
                      {channel.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Followers</p>
                        <p className="font-semibold text-gray-900">
                          {channel.metrics.followers.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Views</p>
                        <p className="font-semibold text-gray-900">
                          {channel.metrics.avg_views.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">ER</p>
                        <p className="font-semibold text-gray-900">{channel.metrics.er}%</p>
                      </div>
                    </div>

                    {channel.moderation_notes && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {channel.moderation_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-6 flex flex-col gap-2">
                    <Link
                      href={`/channel/${channel.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      View <ExternalLink className="h-4 w-4" />
                    </Link>

                    {channel.moderation_status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleModerate(channel.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            const notes = prompt('Rejection reason (optional):')
                            handleModerate(channel.id, 'reject', notes || undefined)
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

                    {channel.moderation_status === 'approved' && (
                      <Button
                        onClick={() => {
                          const notes = prompt('Reason for flagging:')
                          if (notes) {
                            handleModerate(channel.id, 'reject', notes)
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

export default function AdminChannelsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>
      </div>
    }>
      <AdminChannelsContent />
    </Suspense>
  )
}
