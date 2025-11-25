export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { ChannelDetailClient } from '@/components/channel/channel-detail-client'

interface ChannelPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params
  return <ChannelDetailClient channelId={id} />
}
