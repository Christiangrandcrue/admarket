'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  MessageSquare
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

// Types
interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
}

interface Chat {
  id: string
  partnerId: string
  partnerName: string
  partnerAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
}

interface UserProfile {
  id: string
  full_name?: string
  email?: string
  role?: string
}

export default function MessagesPage() {
  const [supabase] = useState(() => createClient())
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Init: Get User
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      if (user) {
        fetchChats(user.id)
      }
    }
    getUser()
  }, [])

  // 2. Fetch Chats
  const fetchChats = async (userId: string) => {
    try {
      // Fetch conversations where user is a participant
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [userId])
        .order('updated_at', { ascending: false })

      if (error) throw error

      if (!conversations || conversations.length === 0) {
        setChats([])
        setLoading(false)
        return
      }

      // Get partner IDs
      const partnerIds = new Set<string>()
      conversations.forEach(c => {
        const pid = c.participant_ids.find((id: string) => id !== userId)
        if (pid) partnerIds.add(pid)
      })

      // Fetch partner profiles
      const { data: profiles } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', Array.from(partnerIds))

      const profilesMap = new Map(profiles?.map(p => [p.id, p]))

      // Format chats
      const formattedChats: Chat[] = await Promise.all(conversations.map(async (c) => {
        const partnerId = c.participant_ids.find((id: string) => id !== userId)
        const partner = profilesMap.get(partnerId)
        
        // Fetch last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at, is_read, sender_id')
          .eq('conversation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          id: c.id,
          partnerId: partnerId || '',
          partnerName: partner?.full_name || partner?.email || 'Unknown User',
          partnerAvatar: (partner?.full_name?.[0] || partner?.email?.[0] || '?').toUpperCase(),
          lastMessage: lastMsg?.content || 'Нет сообщений',
          lastMessageTime: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
          unreadCount: (lastMsg && !lastMsg.is_read && lastMsg.sender_id !== userId) ? 1 : 0, // Simplified
          isOnline: false // TODO: Implement presence
        }
      }))

      setChats(formattedChats)
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }

  // 3. Fetch Messages for Selected Chat
  useEffect(() => {
    if (!selectedChatId) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedChatId)
        .order('created_at', { ascending: true })
      
      if (data) {
        setMessages(data)
        // Mark as read
        if (currentUser) {
           // Ideally we mark unread messages from partner as read here
        }
      }
    }

    fetchMessages()

    // Realtime Subscription
    const channel = supabase
      .channel(`chat:${selectedChatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedChatId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChatId, currentUser])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId || !currentUser) return

    const text = messageInput
    setMessageInput('') // Optimistic clear

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedChatId,
          sender_id: currentUser.id,
          content: text
        })

      if (error) throw error
      
      // Update last message in chat list locally (optional, or wait for refetch)
      // fetchChats(currentUser.id) // Refresh list to update last message
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Ошибка отправки')
      setMessageInput(text) // Restore on fail
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectedChat = chats.find(c => c.id === selectedChatId)

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      {/* Left Sidebar: Chat List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Поиск..." 
              className="pl-9 bg-gray-50 border-transparent focus:bg-white transition-colors" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-sm">Загрузка чатов...</div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">У вас пока нет чатов</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={cn(
                  "p-4 flex gap-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-white",
                  selectedChatId === chat.id ? "bg-white border-l-4 border-l-purple-600 shadow-sm" : "border-l-4 border-l-transparent"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className={cn(
                      "text-white font-bold bg-gradient-to-br from-purple-400 to-blue-500"
                    )}>
                      {chat.partnerAvatar}
                    </AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900 truncate">{chat.partnerName}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate pr-2">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Area: Chat Window */}
      <div className="flex-1 flex flex-col bg-[#F3F4F6]">
        {selectedChatId && selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white font-bold">
                    {selectedChat.partnerAvatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-gray-900">{selectedChat.partnerName}</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                     На связи
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <Phone className="w-5 h-5 cursor-pointer hover:text-purple-600 transition-colors" />
                <Video className="w-5 h-5 cursor-pointer hover:text-purple-600 transition-colors" />
                <div className="w-px h-6 bg-gray-200"></div>
                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-600" />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex w-full",
                    msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "max-w-[70%] px-4 py-3 rounded-2xl shadow-sm relative group",
                      msg.sender_id === currentUser?.id 
                        ? "bg-purple-600 text-white rounded-br-none" 
                        : "bg-white text-gray-900 rounded-bl-none border border-gray-100"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className={cn(
                      "text-[10px] mt-1 flex items-center justify-end gap-1",
                      msg.sender_id === currentUser?.id ? "text-purple-200" : "text-gray-400"
                    )}>
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {msg.sender_id === currentUser?.id && (
                        msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-purple-300 focus-within:bg-white transition-all shadow-sm">
                <div className="flex gap-1 pb-2 pl-2">
                  <Paperclip className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                  <ImageIcon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Напишите сообщение..."
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] py-2 px-2 text-sm text-gray-900 placeholder:text-gray-400"
                  rows={1}
                />
                <div className="pb-1 pr-1">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    size="icon" 
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      messageInput.trim() ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-300 hover:bg-gray-300"
                    )}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Выберите чат для начала общения</p>
          </div>
        )}
      </div>
    </div>
  )
}
