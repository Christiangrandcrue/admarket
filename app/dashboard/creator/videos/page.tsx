'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CreatorVideo, VideoStats } from '@/lib/types/creator-videos'

export default function CreatorVideosPage() {
  const [videos, setVideos] = useState<CreatorVideo[]>([])
  const [stats, setStats] = useState<VideoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'generating' | 'ready' | 'failed' | 'published'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [filter, searchTerm])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/creator/videos?${params}`)
      const data = await response.json()

      if (data.videos) {
        setVideos(data.videos)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generating': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'published': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'generating': return 'Генерируется'
      case 'ready': return 'Готово'
      case 'failed': return 'Ошибка'
      case 'published': return 'Опубликовано'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎬 Мои видео
          </h1>
          <p className="text-gray-600">
            История сгенерированных видео
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Всего</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-6">
              <div className="text-sm text-blue-600 mb-1">Генерируется</div>
              <div className="text-2xl font-bold text-blue-900">{stats.generating}</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-6">
              <div className="text-sm text-green-600 mb-1">Готово</div>
              <div className="text-2xl font-bold text-green-900">{stats.ready}</div>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-6">
              <div className="text-sm text-red-600 mb-1">Ошибки</div>
              <div className="text-2xl font-bold text-red-900">{stats.failed}</div>
            </div>
            <div className="bg-purple-50 rounded-lg shadow p-6">
              <div className="text-sm text-purple-600 mb-1">Опубликовано</div>
              <div className="text-2xl font-bold text-purple-900">{stats.published}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'generating', 'ready', 'failed', 'published'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'Все' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка видео...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Пока нет видео
            </h3>
            <p className="text-gray-600 mb-6">
              Создайте своё первое видео с помощью AI генератора
            </p>
            <a
              href="/dashboard/creator"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Сгенерировать видео
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Video Preview */}
                <div className="relative bg-gray-900 aspect-video">
                  {video.turboboost_video_url || video.local_video_url ? (
                    <video
                      src={video.turboboost_video_url || video.local_video_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎥</div>
                        <div className="text-sm">Превью недоступно</div>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
                      {getStatusLabel(video.status)}
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {video.title}
                  </h3>
                  
                  {video.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {video.style && (
                      <span className="flex items-center gap-1">
                        🎨 {video.style}
                      </span>
                    )}
                    {video.duration && (
                      <span className="flex items-center gap-1">
                        ⏱️ {video.duration}s
                      </span>
                    )}
                    {video.views > 0 && (
                      <span className="flex items-center gap-1">
                        👁️ {video.views}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-xs text-gray-500 mb-3">
                    {new Date(video.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {video.status === 'ready' && (video.turboboost_video_url || video.local_video_url) && (
                      <>
                        <a
                          href={video.turboboost_video_url || video.local_video_url}
                          download
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                        >
                          📥 Скачать
                        </a>
                        <button
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          onClick={() => alert('Функция публикации будет добавлена!')}
                        >
                          📤 Опубликовать
                        </button>
                      </>
                    )}
                    {video.status === 'generating' && (
                      <div className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                          Генерируется...
                        </div>
                      </div>
                    )}
                    {video.status === 'failed' && (
                      <div className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium text-center">
                        ❌ Ошибка генерации
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
