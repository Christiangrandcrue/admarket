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
  CheckCheck
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// Types
interface Message {
  id: string
  content: string
  senderId: string
  createdAt: Date
  isRead: boolean
}

interface Chat {
  id: string
  partnerName: string
  partnerAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
}

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>('1')
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock Data
  const chats: Chat[] = [
    {
      id: '1',
      partnerName: 'Samsung Electronics',
      partnerAvatar: 'Sa',
      lastMessage: 'Отлично, ждем черновик видео завтра!',
      lastMessageTime: '10:42',
      unreadCount: 0,
      isOnline: true
    },
    {
      id: '2',
      partnerName: 'Nike Russia',
      partnerAvatar: 'Ni',
      lastMessage: 'Можем обсудить бюджет?',
      lastMessageTime: 'Вчера',
      unreadCount: 2,
      isOnline: false
    },
    {
      id: '3',
      partnerName: 'ZenApp',
      partnerAvatar: 'Ze',
      lastMessage: 'Оплата прошла успешно',
      lastMessageTime: 'Пн',
      unreadCount: 0,
      isOnline: false
    }
  ]

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: 'partner', content: 'Здравствуйте! Нам понравился ваш профиль.', createdAt: new Date(), isRead: true },
    { id: '2', senderId: 'me', content: 'Добрый день! Спасибо, готов обсудить сотрудничество.', createdAt: new Date(), isRead: true },
    { id: '3', senderId: 'partner', content: 'Супер. Нам нужно видео на 30 секунд для YouTube Shorts.', createdAt: new Date(), isRead: true },
    { id: '4', senderId: 'me', content: 'Понял. Есть конкретное ТЗ или референсы?', createdAt: new Date(), isRead: true },
    { id: '5', senderId: 'partner', content: 'Отлично, ждем черновик видео завтра!', createdAt: new Date(), isRead: true },
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: messageInput,
      createdAt: new Date(),
      isRead: false
    }

    setMessages([...messages, newMessage])
    setMessageInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      {/* Left Sidebar: Chat List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Поиск сообщений..." 
              className="pl-9 bg-gray-50 border-transparent focus:bg-white transition-colors" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
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
                    "text-white font-bold",
                    chat.id === '1' ? 'bg-blue-500' : chat.id === '2' ? 'bg-black' : 'bg-green-500'
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
          ))}
        </div>
      </div>

      {/* Right Area: Chat Window */}
      <div className="flex-1 flex flex-col bg-[#F3F4F6]">
        {selectedChatId ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-500 text-white font-bold">Sa</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-gray-900">Samsung Electronics</h2>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Онлайн
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
              <div className="text-center text-xs text-gray-400 my-4">
                <span>Сегодня</span>
              </div>
              
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex w-full",
                    msg.senderId === 'me' ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "max-w-[70%] px-4 py-3 rounded-2xl shadow-sm relative group",
                      msg.senderId === 'me' 
                        ? "bg-purple-600 text-white rounded-br-none" 
                        : "bg-white text-gray-900 rounded-bl-none border border-gray-100"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className={cn(
                      "text-[10px] mt-1 flex items-center justify-end gap-1",
                      msg.senderId === 'me' ? "text-purple-200" : "text-gray-400"
                    )}>
                      {msg.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {msg.senderId === 'me' && (
                        msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
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
