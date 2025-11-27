'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Send,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Building2,
  User,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'advertiser' | 'creator'
  content: string
  attachments: any[]
  is_read: boolean
  read_at?: string
  created_at: string
}

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
    owner_user_id: string
  }
}

interface ChatPageProps {
  params: { id: string }
}

export default function ChatPage({ params }: ChatPageProps) {
  const router = useRouter()
  const { id: conversationId } = params
  const currentUserId = 'bf91c23b-7b52-4870-82f7-ba9ad852b49e'

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadConversation()
    loadMessages()
    markAsRead()
  }, [conversationId])

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)

      if (!response.ok) {
        throw new Error('Не удалось загрузить диалог')
      }

      const result = await response.json()
      if (result.success) {
        setConversation(result.conversation)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    }
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/conversations/${conversationId}/messages`)

      if (!response.ok) {
        throw new Error('Не удалось загрузить сообщения')
      }

      const result = await response.json()
      if (result.success) {
        setMessages(result.messages)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    try {
      await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUserId,
          mark_as_read: true,
        }),
      })
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) {
      console.log('Empty message, skipping')
      return
    }

    if (sending) {
      console.log('Already sending, skipping')
      return
    }

    if (!conversation) {
      console.log('No conversation loaded')
      alert('Диалог не загружен. Пожалуйста, обновите страницу.')
      return
    }

    console.log('Sending message...', { conversationId, currentUserId })
    setSending(true)

    try {
      // Determine sender type
      const isAdvertiser = conversation.advertiser_id === currentUserId
      const senderType = isAdvertiser ? 'advertiser' : 'creator'

      const payload = {
        sender_id: currentUserId,
        sender_type: senderType,
        content: newMessage.trim(),
      }

      console.log('Payload:', payload)

      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Не удалось отправить сообщение')
      }

      const result = await response.json()
      console.log('Result:', result)

      if (result.success) {
        // Add message to list
        setMessages((prev) => [...prev, result.message])
        setNewMessage('')
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
        
        console.log('Message sent successfully!')
      }
    } catch (err) {
      console.error('Send message error:', err)
      alert(err instanceof Error ? err.message : 'Произошла ошибка при отправке сообщения')
    } finally {
      setSending(false)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера'
    } else {
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      }).format(date)
    }
  }

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      const date = new Date(message.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return Object.entries(groups).map(([date, msgs]) => ({
      date: new Date(date),
      messages: msgs,
    }))
  }

  const getOtherPartyName = () => {
    if (!conversation) return ''
    const isAdvertiser = conversation.advertiser_id === currentUserId
    if (isAdvertiser) {
      return conversation.channel?.blogger_name || 'Блогер'
    } else {
      return conversation.campaign?.brand?.name || 'Рекламодатель'
    }
  }

  const getOtherPartyAvatar = () => {
    if (!conversation) return null
    const isAdvertiser = conversation.advertiser_id === currentUserId
    if (isAdvertiser) {
      return conversation.channel?.avatar_url
    } else {
      return conversation.campaign?.brand?.logo_url
    }
  }

  if (loading && !conversation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error && !conversation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/messages')}>Назад к диалогам</Button>
        </div>
      </div>
    )
  }

  const isAdvertiser = conversation?.advertiser_id === currentUserId
  const otherPartyName = getOtherPartyName()
  const otherPartyAvatar = getOtherPartyAvatar()
  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/messages')}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>

            {/* Other party info */}
            <div className="flex items-center gap-3 flex-1">
              {otherPartyAvatar ? (
                <img
                  src={otherPartyAvatar}
                  alt={otherPartyName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold">{otherPartyName[0]}</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{otherPartyName}</h2>
                {conversation?.subject && (
                  <p className="text-sm text-gray-600 truncate">{conversation.subject}</p>
                )}
              </div>
            </div>

            {/* Context badges */}
            <div className="flex gap-2 flex-shrink-0">
              {conversation?.campaign && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/campaigns/${conversation.campaign_id}`)}
                  className="hidden sm:flex"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {conversation.campaign.name}
                </Button>
              )}
              {conversation?.channel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/channels/${conversation.channel_id}`)}
                  className="hidden sm:flex"
                >
                  <User className="h-4 w-4 mr-2 capitalize" />
                  {conversation.channel.platform}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="mb-4">
        <CardContent className="p-0">
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Send className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Начните диалог</p>
                <p className="text-sm text-gray-500">Отправьте первое сообщение</p>
              </div>
            ) : (
              <>
                {groupedMessages.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-100 px-3 py-1 rounded-full">
                        <span className="text-xs font-medium text-gray-600">
                          {formatMessageDate(group.date.toISOString())}
                        </span>
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {group.messages.map((message) => {
                      const isMine =
                        message.sender_type === (isAdvertiser ? 'advertiser' : 'creator')

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              isMine
                                ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg'
                                : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                            } px-4 py-2`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                isMine ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <span
                                className={`text-xs ${
                                  isMine ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatMessageTime(message.created_at)}
                              </span>
                              {isMine && message.is_read && (
                                <span className="text-xs text-blue-100">✓✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Введите сообщение... (Enter для отправки, Shift+Enter для новой строки)"
              className="flex-1 min-h-[60px] max-h-[200px] resize-none"
              disabled={sending}
            />
            <Button type="submit" disabled={!newMessage.trim() || sending} size="lg">
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Enter для отправки, Shift+Enter для новой строки
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
