'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Play, Image as ImageIcon, UploadCloud } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AvatarGeneratorPage() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [motionIntensity, setMotionIntensity] = useState(127)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'starting' | 'processing' | 'succeeded' | 'failed'>('idle')
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      // Cleanup handled in the poll function logic usually, 
      // but if component unmounts, we stop caring.
    }
  }, [])

  const handleGenerate = async () => {
    if (!sourceUrl) return
    
    setIsGenerating(true)
    setStatus('starting')
    setError(null)
    setResultVideoUrl(null)
    setJobId(null)

    try {
      const res = await fetch('/api/factory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl: sourceUrl, 
          settings: { motionIntensity } 
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to start generation')

      if (data.jobId) {
        setJobId(data.jobId)
        pollStatus(data.jobId)
      } else {
        throw new Error('No Job ID returned')
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message)
      setIsGenerating(false)
      setStatus('failed')
    }
  }

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/factory/status/${id}`)
        const data = await res.json()

        if (data.status) {
          setStatus(data.status)
        }

        if (data.status === 'succeeded') {
          setResultVideoUrl(data.output)
          setIsGenerating(false)
          clearInterval(interval)
        } else if (data.status === 'failed' || data.status === 'canceled') {
          setIsGenerating(false)
          setError(data.error || 'Generation failed on server')
          clearInterval(interval)
        }
      } catch (err) {
        console.error('Polling error:', err)
        // Don't stop polling immediately on network glitch, but maybe limit retries in real app
      }
    }, 3000) // Poll every 3 seconds
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Оживление аватаров (Face Swap & Motion)</h1>
        <p className="text-gray-500">Загрузите фото, и AI оживит его, добавив движение.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <UploadCloud className="w-5 h-5 mr-2 text-purple-600" /> 
              1. Исходное изображение
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">Ссылка на изображение</Label>
                <Input 
                  id="image-url" 
                  placeholder="https://example.com/photo.jpg" 
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">
                  * В будущем здесь будет загрузка файлов напрямую. Пока используйте прямую ссылку.
                </p>
              </div>

              {sourceUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={sourceUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2 text-purple-600" /> 
              2. Настройки
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Интенсивность движения (Motion Bucket)</Label>
                  <span className="text-sm font-medium text-gray-700">{motionIntensity}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="255" 
                  value={motionIntensity}
                  onChange={(e) => setMotionIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Меньше (Статично)</span>
                  <span>Больше (Динамично)</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={!sourceUrl || isGenerating}
            className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Магия происходит...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Оживить аватар
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Result */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-purple-600" /> 
            Результат
          </h2>

          <div className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden">
            {resultVideoUrl ? (
              <video 
                src={resultVideoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-contain bg-black" 
              />
            ) : isGenerating ? (
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Генерация видео</h3>
                <p className="text-sm text-gray-500 mb-4">Это обычно занимает около 30-60 секунд.</p>
                <div className="flex justify-center gap-2">
                   <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 capitalize">
                     {status === 'starting' ? 'Запуск...' : 'Обработка...'}
                   </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Play className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Здесь появится ваше видео</p>
              </div>
            )}
          </div>
          
          {resultVideoUrl && (
             <div className="mt-4 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => window.open(resultVideoUrl, '_blank')}>
                  Открыть в новой вкладке
                </Button>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
