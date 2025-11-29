'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CreatorVideo, VideoStats } from '@/lib/types/creator-videos'
import { Download, Share2, Clock, Loader2, PlayCircle, CheckCircle2 } from 'lucide-react'

export default function CreatorVideosPage() {
  const [videos, setVideos] = useState<CreatorVideo[]>([])
  const [loading, setLoading] = useState(true)
  
  // Mock data for visual testing if no videos exist
  // Remove this in production or keep for empty state demo
  const mockVideos = [
    { id: '1', title: 'Futuristic Dubai City акулы', status: 'generating', progress: 80, created_at: new Date().toISOString() },
    { id: '2', title: 'Горные лыжи и бобслей', status: 'generating', progress: 45, created_at: new Date().toISOString() },
    { id: '3', title: 'Mountain landscape', status: 'ready', created_at: new Date().toISOString() },
  ]

  useEffect(() => {
    fetchVideos()
    // Poll for updates every 5 seconds if there are generating videos
    const interval = setInterval(fetchVideos, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch(`/api/creator/videos`)
      const data = await response.json()
      if (data.videos && data.videos.length > 0) {
        setVideos(data.videos)
      } else {
        // Fallback to mock data so the page isn't empty for the demo
        // This matches the "Active Processes" shown on the previous dashboard page
        setVideos(mockVideos as any) 
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper to calculate "fake" progress based on time if real progress isn't available
  // In a real app, we'd store start_time and estimate progress
  const getProgress = (video: any) => {
    if (video.status === 'ready') return 100
    if (video.status === 'failed') return 0
    // Random progress for demo visualization if not provided
    return 65 
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-purple-600">≡</span> Мои задачи
            </h1>
            <p className="text-gray-500 text-sm mt-1">Отслеживайте статус генерации ваших видео</p>
          </div>
          <a 
            href="/dashboard/creator"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-200 flex items-center gap-2"
          >
            ⚡ Отправить на генерацию
          </a>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {videos.length === 0 && loading ? (
            // Skeletons
            [1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-48 animate-pulse"></div>
            ))
          ) : videos.length === 0 ? (
            <div className="col-span-2 text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900">Список задач пуст</h3>
              <p className="text-gray-500 mb-6">Создайте свое первое видео прямо сейчас</p>
            </div>
          ) : (
            videos.map((video) => {
              const isReady = video.status === 'ready'
              const isGenerating = video.status === 'generating'
              const progress = getProgress(video)
              
              return (
                <div 
                  key={video.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md w-fit">
                        {isGenerating && <Loader2 className="w-3 h-3 animate-spin" />}
                        {isReady && <CheckCircle2 className="w-3 h-3" />}
                        {isGenerating ? 'Генерация видео' : 'Готово'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {new Date(video.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="mb-6">
                    {isGenerating ? (
                      // Progress Bar UI (Like Screenshot 1)
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-semibold text-gray-500">
                          <span>Процесс создания</span>
                          <span className="text-purple-600">{progress}%</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-1000 relative"
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Осталось: Завершается...</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            Создаем видео
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Ready UI with Preview
                      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden group-hover:ring-2 ring-purple-500/20 transition-all">
                        {video.turboboost_video_url ? (
                          <video 
                            src={video.turboboost_video_url} 
                            className="w-full h-full object-cover"
                            controls
                            poster={video.thumbnail_url}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-white">
                            <PlayCircle className="w-12 h-12 opacity-80" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  {isReady && (
                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                      <a 
                        href={video.turboboost_video_url || '#'}
                        download
                        target="_blank"
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Скачать
                      </a>
                      <button 
                        className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        onClick={() => alert('Публикация скоро будет доступна!')}
                      >
                        <Share2 className="w-4 h-4" />
                        Опубликовать
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
