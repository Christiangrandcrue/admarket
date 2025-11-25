/**
 * Admin Channels Moderation Page
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Channel {
  id: string
  name: string
  category: string
  subscribers: number
  moderation_status: string
}

export default function AdminChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/channels')
      .then(r => r.json())
      .then(d => {
        setChannels(d.channels || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

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
        <div className="mb-8">
          <Link href="/dashboard/admin" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Модерация каналов</h1>
          <p className="text-gray-600">Проверка и одобрение каналов</p>
        </div>

        <div className="space-y-4">
          {channels.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center">
              <p className="text-gray-600">Нет каналов для модерации</p>
            </div>
          ) : (
            channels.map((channel) => (
              <div key={channel.id} className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">{channel.name}</h3>
                <p className="text-sm text-gray-600">{channel.category}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Подписчики: {channel.subscribers?.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
