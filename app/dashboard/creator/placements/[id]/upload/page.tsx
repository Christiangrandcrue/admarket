'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Upload, 
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Placement {
  id: string
  channel_title: string
  formats: string[]
  budget: number
  status: string
  content_url: string | null
  content_description: string | null
  content_status: string | null
  campaign: {
    id: string
    title: string
    brief: string
    landing_url: string
  }
}

export default function UploadContentPage({ params }: { params: Promise<{ id: string }> }) {
  const [placementId, setPlacementId] = useState<string>('')
  const [placement, setPlacement] = useState<Placement | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [contentUrl, setContentUrl] = useState('')
  const [contentDescription, setContentDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => {
      setPlacementId(id)
      fetchPlacement(id)
    })
  }, [])

  const fetchPlacement = async (id: string) => {
    try {
      const response = await fetch(`/api/creator/placements/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch placement')
      }

      setPlacement(data.placement)
      
      // Pre-fill if content already exists
      if (data.placement.content_url) {
        setContentUrl(data.placement.content_url)
        setContentDescription(data.placement.content_description || '')
      }
    } catch (error: any) {
      console.error('Error fetching placement:', error)
      setError(error.message || 'Ошибка загрузки размещения')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate URL
    if (!contentUrl.trim()) {
      setError('Пожалуйста, укажите ссылку на контент')
      return
    }

    try {
      new URL(contentUrl)
    } catch {
      setError('Неверный формат URL. Пожалуйста, введите корректную ссылку')
      return
    }

    setUploading(true)

    try {
      const response = await fetch(`/api/creator/placements/${placementId}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_url: contentUrl,
          content_description: contentDescription,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload content')
      }

      setSuccess(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/creator/active')
      }, 2000)
    } catch (error: any) {
      console.error('Error uploading content:', error)
      setError(error.message || 'Ошибка загрузки контента')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!placement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Размещение не найдено</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/dashboard/creator/active" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Назад к активным размещениям
      </Link>

      <div className="mx-auto max-w-3xl">
        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Контент успешно загружен!</p>
                <p className="text-sm text-green-700">
                  Рекламодатель получил уведомление и скоро проверит ваш контент.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Ошибка</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Загрузка контента</h1>
          <p className="text-gray-600">
            Загрузите готовый контент для кампании "{placement.campaign.title}"
          </p>
        </div>

        {/* Campaign Info */}
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Информация о кампании</h2>
          
          <div className="space-y-4">
            <div>
              <div className="mb-1 text-sm font-medium text-gray-600">Название кампании</div>
              <div className="text-base text-gray-900">{placement.campaign.title}</div>
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-gray-600">Канал</div>
              <div className="text-base text-gray-900">{placement.channel_title}</div>
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-gray-600">Форматы</div>
              <div className="flex flex-wrap gap-2">
                {placement.formats.map((format) => (
                  <span
                    key={format}
                    className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-gray-600">Техническое задание</div>
              <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                {placement.campaign.brief}
              </div>
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-gray-600">Landing URL</div>
              <a
                href={placement.campaign.landing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                {placement.campaign.landing_url}
                <LinkIcon className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Загрузить контент</h2>

          <div className="space-y-6">
            {/* Content URL */}
            <div>
              <label htmlFor="contentUrl" className="mb-2 block text-sm font-medium text-gray-900">
                Ссылка на контент <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="contentUrl"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... или https://drive.google.com/..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={uploading || success}
              />
              <p className="mt-2 text-sm text-gray-600">
                Загрузите видео на YouTube, Google Drive или другой сервис и вставьте ссылку
              </p>
            </div>

            {/* Content Description */}
            <div>
              <label htmlFor="contentDescription" className="mb-2 block text-sm font-medium text-gray-900">
                Описание контента (опционально)
              </label>
              <textarea
                id="contentDescription"
                value={contentDescription}
                onChange={(e) => setContentDescription(e.target.value)}
                rows={4}
                placeholder="Добавьте любые комментарии или заметки о контенте для рекламодателя..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={uploading || success}
              />
            </div>

            {/* Info Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-blue-900">
                  <p className="mb-2 font-semibold">Важно:</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Убедитесь, что контент соответствует техническому заданию</li>
                    <li>Ссылка должна быть публично доступна для просмотра</li>
                    <li>Рекламодатель может запросить изменения</li>
                    <li>После одобрения можно будет опубликовать контент</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={uploading || success}
              >
                {uploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    Загрузка...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Загружено
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Загрузить контент
                  </>
                )}
              </Button>
              
              <Link href="/dashboard/creator/active">
                <Button type="button" variant="outline" disabled={uploading}>
                  Отмена
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
