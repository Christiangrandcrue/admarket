'use client'

import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react'
import type { Channel } from '@/types'

interface ChannelPostsProps {
  channel: Channel
}

// Моковые данные постов (в будущем загружать из БД)
const mockPosts = [
  {
    id: '1',
    thumbnail: '🎬',
    title: 'Обзор нового гаджета',
    date: '2 дня назад',
    views: 125000,
    likes: 8500,
    comments: 340,
    shares: 120,
  },
  {
    id: '2',
    thumbnail: '📱',
    title: 'Топ-5 приложений месяца',
    date: '5 дней назад',
    views: 98000,
    likes: 6200,
    comments: 280,
    shares: 95,
  },
  {
    id: '3',
    thumbnail: '💻',
    title: 'Сравнение ноутбуков 2024',
    date: '1 неделю назад',
    views: 156000,
    likes: 10500,
    comments: 420,
    shares: 180,
  },
]

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

export function ChannelPosts({ channel }: ChannelPostsProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Последние публикации</h2>

      <div className="space-y-4">
        {mockPosts.map((post) => (
          <div
            key={post.id}
            className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 hover:shadow-sm"
          >
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-3xl">
                {post.thumbnail}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-gray-900">{post.title}</h3>
                <p className="mb-3 text-sm text-gray-600">{post.date}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatNumber(post.views)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{formatNumber(post.likes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{formatNumber(post.comments)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    <span>{formatNumber(post.shares)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
