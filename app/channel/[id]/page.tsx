import { notFound } from 'next/navigation'
import { ChannelHeader } from '@/components/channel/channel-header'
import { ChannelMetrics } from '@/components/channel/channel-metrics'
import { ChannelAbout } from '@/components/channel/channel-about'
import { ChannelAudience } from '@/components/channel/channel-audience'
import { ChannelPosts } from '@/components/channel/channel-posts'
import { ChannelPricing } from '@/components/channel/channel-pricing'
import { ChannelCTA } from '@/components/channel/channel-cta'
import type { Channel } from '@/types'

interface ChannelPageProps {
  params: Promise<{
    id: string
  }>
}

async function getChannel(id: string): Promise<Channel | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/channels/${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const result = await response.json()
    return result.success ? result.channel : null
  } catch (error) {
    console.error('Error loading channel:', error)
    return null
  }
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params
  const channel = await getChannel(id)

  if (!channel) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <ChannelHeader channel={channel} />

        {/* Main Content Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="space-y-6 lg:col-span-2">
            <ChannelMetrics channel={channel} />
            <ChannelAbout channel={channel} />
            <ChannelAudience channel={channel} />
            <ChannelPosts channel={channel} />
          </div>

          {/* Right Column - Pricing & CTA */}
          <div className="space-y-6">
            <ChannelPricing channel={channel} />
            <ChannelCTA channel={channel} />
          </div>
        </div>
      </div>
    </div>
  )
}
