'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Video, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface VideoGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onVideoGenerated?: (videoUrl: string) => void
}

export function VideoGeneratorModal({ isOpen, onClose, onVideoGenerated }: VideoGeneratorModalProps) {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('cinematic')
  const [duration, setDuration] = useState('5')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [taskId, setTaskId] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Пожалуйста, введите тему видео')
      return
    }

    setGenerating(true)
    setStatus('generating')
    setProgress(0)
    setError(null)

    try {
      // Step 1: Authenticate with TurboBoost
      const authRes = await fetch('/api/turboboost/auth', { method: 'POST' })
      const authData = await authRes.json()

      if (!authData.success) {
        throw new Error(authData.error || 'Ошибка авторизации')
      }

      const token = authData.token

      // Step 2: Create video generation task
      const prompt = `Cinematic ${style} view of ${topic}, professional quality, ${duration} seconds`
      const brief = {
        topic,
        style,
        duration: parseInt(duration),
      }

      const generateRes = await fetch('/api/turboboost/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, prompt, brief }),
      })

      const generateData = await generateRes.json()

      if (!generateData.success) {
        throw new Error(generateData.error || 'Ошибка создания задачи')
      }

      const newTaskId = generateData.task_id
      setTaskId(newTaskId)
      setProgress(20)

      // Step 3: Poll for task completion
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/turboboost/tasks/${newTaskId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })

          const statusData = await statusRes.json()

          if (!statusData.success) {
            throw new Error(statusData.error || 'Ошибка проверки статуса')
          }

          const task = statusData.task

          // Update progress based on status
          if (task.status === 'generating') {
            setProgress((prev) => Math.min(prev + 10, 90))
          } else if (task.status === 'completed') {
            clearInterval(pollInterval)
            setProgress(100)
            setStatus('completed')
            setVideoUrl(task.video_url)
            setGenerating(false)

            if (onVideoGenerated && task.video_url) {
              onVideoGenerated(task.video_url)
            }
          } else if (task.status === 'failed') {
            clearInterval(pollInterval)
            setStatus('error')
            setError(task.error_message || 'Ошибка генерации видео')
            setGenerating(false)
          }
        } catch (err: any) {
          clearInterval(pollInterval)
          setStatus('error')
          setError(err.message)
          setGenerating(false)
        }
      }, 10000) // Poll every 10 seconds

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        if (generating) {
          setStatus('error')
          setError('Превышено время ожидания генерации')
          setGenerating(false)
        }
      }, 300000)
    } catch (err: any) {
      console.error('Video generation error:', err)
      setStatus('error')
      setError(err.message || 'Произошла ошибка')
      setGenerating(false)
    }
  }

  const handleClose = () => {
    if (!generating) {
      setTopic('')
      setStyle('cinematic')
      setDuration('5')
      setStatus('idle')
      setProgress(0)
      setTaskId(null)
      setVideoUrl(null)
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            AI Генерация видео
          </DialogTitle>
          <DialogDescription>
            Создайте профессиональное видео для TikTok/Reels за 2-4 минуты
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {status === 'idle' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="topic">Тема видео *</Label>
                <Input
                  id="topic"
                  placeholder="Например: горный пейзаж на закате"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={generating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Стиль</Label>
                <Select value={style} onValueChange={setStyle} disabled={generating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cinematic">Кинематографический</SelectItem>
                    <SelectItem value="dynamic">Динамичный</SelectItem>
                    <SelectItem value="minimal">Минималистичный</SelectItem>
                    <SelectItem value="vibrant">Яркий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Длительность (сек)</Label>
                <Select value={duration} onValueChange={setDuration} disabled={generating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 секунд</SelectItem>
                    <SelectItem value="10">10 секунд</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {status === 'generating' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Генерация видео...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Это займёт 2-4 минуты. Не закрывайте окно.
              </p>
            </div>
          )}

          {status === 'completed' && videoUrl && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-center text-green-600 font-medium">
                Видео успешно сгенерировано!
              </p>
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg"
              />
              <Button
                onClick={() => window.open(videoUrl, '_blank')}
                className="w-full"
              >
                Скачать видео
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <p className="text-center text-red-600 font-medium">
                {error || 'Произошла ошибка при генерации видео'}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {status === 'idle' && (
            <>
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleGenerate} disabled={generating} className="flex-1">
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  'Сгенерировать'
                )}
              </Button>
            </>
          )}

          {(status === 'completed' || status === 'error') && (
            <Button onClick={handleClose} className="w-full">
              Закрыть
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
