'use client'

import { use } from 'react'
import { ChannelDetailClient } from '@/components/channel/channel-detail-client'

interface ChannelPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const { id } = use(params)
  return <ChannelDetailClient channelId={id} />
}
