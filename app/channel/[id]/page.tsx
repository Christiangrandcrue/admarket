export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { ChannelDetailClient } from '@/components/channel/channel-detail-client'

interface ChannelPageProps {
  params: {
    id: string
  }
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  return <ChannelDetailClient channelId={params.id} />
}
