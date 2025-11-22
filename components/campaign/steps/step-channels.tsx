'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CampaignDraft, SelectedChannel } from '@/types/campaign'
import { Search, Plus, Trash2, ExternalLink } from 'lucide-react'

interface StepChannelsProps {
  draft: CampaignDraft
  updateDraft: (updates: Partial<CampaignDraft>) => void
  preselectedChannelId?: string | null
}

export function StepChannels({ draft, updateDraft, preselectedChannelId }: StepChannelsProps) {
  const [channels, setChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load channels from API
    fetch('/api/channels')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setChannels(data.channels)
          
          // Preselect channel if provided
          if (preselectedChannelId) {
            const channel = data.channels.find((c: any) => c.id === preselectedChannelId)
            if (channel && !draft.selectedChannels.find(sc => sc.channelId === channel.id)) {
              addChannel(channel)
            }
          }
        }
        setLoading(false)
      })
  }, [preselectedChannelId])

  const addChannel = (channel: any) => {
    const selected: SelectedChannel = {
      channelId: channel.id,
      channelTitle: channel.title,
      channelHandle: channel.handle,
      formats: [],
      budget: 0,
    }
    updateDraft({
      selectedChannels: [...draft.selectedChannels, selected],
    })
  }

  const removeChannel = (channelId: string) => {
    updateDraft({
      selectedChannels: draft.selectedChannels.filter((c) => c.channelId !== channelId),
    })
  }

  const isSelected = (channelId: string) => {
    return draft.selectedChannels.some((c) => c.channelId === channelId)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Выбор блогеров
        </h2>
        <p className="text-gray-600">
          Выберите каналы для размещения рекламы
        </p>
      </div>

      {/* Selected Channels */}
      {draft.selectedChannels.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Выбранные каналы ({draft.selectedChannels.length})
          </h3>
          <div className="space-y-3">
            {draft.selectedChannels.map((channel) => (
              <div
                key={channel.channelId}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white">
                    {channel.channelTitle.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{channel.channelTitle}</div>
                    <div className="text-sm text-gray-600">{channel.channelHandle}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChannel(channel.channelId)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse Catalog */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Доступные каналы
          </h3>
          <Link href="/catalog" target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Открыть каталог
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">
            Загрузка каналов...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {channels.slice(0, 6).map((channel) => (
              <div
                key={channel.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{channel.title}</div>
                    <div className="text-sm text-gray-600">{channel.handle}</div>
                  </div>
                  {channel.brand_safety?.verified && (
                    <Badge variant="success" className="text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <div className="mb-3 flex gap-4 text-sm text-gray-600">
                  <span>{channel.metrics?.followers ? `${(channel.metrics.followers / 1000).toFixed(0)}K` : 'N/A'} подп.</span>
                  <span>{channel.metrics?.er || 0}% ER</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => isSelected(channel.id) ? removeChannel(channel.id) : addChannel(channel)}
                  className={`w-full ${isSelected(channel.id) ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {isSelected(channel.id) ? 'Выбран' : 'Выбрать'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
