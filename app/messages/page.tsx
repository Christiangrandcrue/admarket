'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageCircle,
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  Building2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Conversation {
  id: string
  advertiser_id: string
  creator_id: string
  campaign_id?: string
  channel_id?: string
  subject?: string
  last_message_at?: string
  unread_count_advertiser: number
  unread_count_creator: number
  created_at: string
  campaign?: {
    id: string
    name: string
    brand: {
      id: string
      name: string
      logo_url?: string
    }
  }
  channel?: {
    id: string
    blogger_name: string
    platform: string
    avatar_url?: string
  }
  last_message?: {
    id: string
    content: string
    sender_type: string
    created_at: string
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const currentUserId = 'bf91c23b-7b52-4870-82f7-ba9ad852b49e'

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    // Filter conversations based on search query
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = conversations.filter((conv) => {
      const brandName = conv.campaign?.brand?.name?.toLowerCase() || ''
      const campaignName = conv.campaign?.name?.toLowerCase() || ''
      const bloggerName = conv.channel?.blogger_name?.toLowerCase() || ''
      const subject = conv.subject?.toLowerCase() || ''
      const lastMessage = conv.last_message?.content?.toLowerCase() || ''

      return (
        brandName.includes(query) ||
        campaignName.includes(query) ||
        bloggerName.includes(query) ||
        subject.includes(query) ||
        lastMessage.includes(query)
      )
    })

    setFilteredConversations(filtered)
  }, [searchQuery, conversations])

  const loadConversations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/conversations?user_id=${currentUserId}`)

      if (!response.ok) {
        throw new Error('Не удалось загрузить диалоги')
      }

      const result = await response.json()
      if (result.success) {
        setConversations(result.conversations)
        setFilteredConversations(result.conversations)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Today - show time
      return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } else if (diffDays === 1) {
      return 'Вчера'
    } else if (diffDays < 7) {
      // This week - show day name
      return new Intl.DateTimeFormat('ru-RU', {
        weekday: 'short',
      }).format(date)
    } else {
      // Older - show date
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
      }).format(date)
    }
  }

  const getUnreadCount = (conversation: Conversation) => {
    // Determine if current user is advertiser or creator
    const isAdvertiser = conversation.advertiser_id === currentUserId
    return isAdvertiser
      ? conversation.unread_count_advertiser
      : conversation.unread_count_creator
  }

  const getOtherPartyName = (conversation: Conversation) => {
    const isAdvertiser = conversation.advertiser_id === currentUserId
    if (isAdvertiser) {
      // User is advertiser, show creator/blogger name
      return conversation.channel?.blogger_name || 'Блогер'
    } else {
      // User is creator, show brand name
      return conversation.campaign?.brand?.name || 'Рекламодатель'
    }
  }

  const getOtherPartyAvatar = (conversation: Conversation) => {
    const isAdvertiser = conversation.advertiser_id === currentUserId
    if (isAdvertiser) {
      return conversation.channel?.avatar_url
    } else {
      return conversation.campaign?.brand?.logo_url
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadConversations}>Попробовать снова</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Сообщения</h1>
        <p className="text-gray-600">Ваши диалоги с брендами и блогерами</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск по диалогам, брендам, блогерам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Диалоги не найдены' : 'Нет диалогов'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Начните общение с блогерами из каталога'}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push('/catalog')}>
                  Перейти в каталог
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => {
            const unreadCount = getUnreadCount(conversation)
            const otherPartyName = getOtherPartyName(conversation)
            const otherPartyAvatar = getOtherPartyAvatar(conversation)
            const isAdvertiser = conversation.advertiser_id === currentUserId

            return (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  unreadCount > 0 ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => router.push(`/messages/${conversation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {otherPartyAvatar ? (
                        <img
                          src={otherPartyAvatar}
                          alt={otherPartyName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {otherPartyName[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold text-gray-900 truncate ${
                              unreadCount > 0 ? 'font-bold' : ''
                            }`}
                          >
                            {otherPartyName}
                          </h3>
                          {conversation.subject && (
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.subject}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {conversation.last_message_at && (
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTime(conversation.last_message_at)}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <Badge className="bg-blue-600 text-white">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Context Info */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {conversation.campaign && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">
                              {conversation.campaign.name}
                            </span>
                          </div>
                        )}
                        {conversation.channel && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <User className="h-3 w-3" />
                            <span className="truncate capitalize">
                              {conversation.channel.platform}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Last Message Preview */}
                      {conversation.last_message && (
                        <p
                          className={`text-sm text-gray-600 line-clamp-1 ${
                            unreadCount > 0 ? 'font-medium text-gray-900' : ''
                          }`}
                        >
                          {conversation.last_message.sender_type ===
                          (isAdvertiser ? 'advertiser' : 'creator')
                            ? 'Вы: '
                            : ''}
                          {conversation.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
