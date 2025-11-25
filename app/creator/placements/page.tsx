'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  Upload,
  ExternalLink,
  TrendingUp,
  Users,
  Eye,
  MessageCircle,
  Heart,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Placement {
  id: string
  campaign_id: string
  channel_id: string
  format_id: string
  unit_price: {
    value: number
    currency: string
    model: string
  }
  deadline_at: string
  status: 'booked' | 'in_progress' | 'posted' | 'approved' | 'rejected'
  post_link?: string
  created_at: string
  campaign: {
    id: string
    name: string
    description: string
    advertiser_id: string
    brand: {
      id: string
      name: string
      logo_url?: string
    }
  }
  channel: {
    id: string
    platform: string
    blogger_name: string
    channel_url: string
    subscribers: number
    avg_views: number
    engagement_rate: number
  }
  format: {
    id: string
    name: string
    rights: string
    price: {
      value: number
      currency: string
      model: string
    }
    sla_days: number
  }
}

const STATUS_LABELS = {
  booked: {
    label: 'Забронировано',
    icon: Calendar,
    variant: 'default' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  in_progress: {
    label: 'В работе',
    icon: Loader2,
    variant: 'default' as const,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  posted: {
    label: 'Опубликовано',
    icon: CheckCircle,
    variant: 'success' as const,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  approved: {
    label: 'Одобрено',
    icon: CheckCircle2,
    variant: 'success' as const,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  rejected: {
    label: 'Отклонено',
    icon: AlertCircle,
    variant: 'destructive' as const,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
}

export default function CreatorPlacementsPage() {
  const router = useRouter()
  const creatorUserId = 'bf91c23b-7b52-4870-82f7-ba9ad852b49e'

  const [placements, setPlacements] = useState<Placement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null)
  const [postLink, setPostLink] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [linkError, setLinkError] = useState('')

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadPlacements()
  }, [])

  const loadPlacements = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get creator's channels
      const channelsResponse = await fetch(`/api/channels?owner_user_id=${creatorUserId}`)
      if (!channelsResponse.ok) {
        throw new Error('Не удалось загрузить каналы')
      }

      const channelsResult = await channelsResponse.json()
      if (!channelsResult.success || channelsResult.channels.length === 0) {
        setPlacements([])
        return
      }

      const channelIds = channelsResult.channels.map((c: any) => c.id)

      // Get active placements (booked, in_progress, posted, approved)
      const placementsResponse = await fetch(
        `/api/placements?channel_ids=${channelIds.join(',')}&status=in.(booked,in_progress,posted,approved)`
      )

      if (!placementsResponse.ok) {
        throw new Error('Не удалось загрузить размещения')
      }

      const placementsResult = await placementsResponse.json()
      if (placementsResult.success) {
        setPlacements(placementsResult.placements)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const openMarkPostedModal = (placement: Placement) => {
    setSelectedPlacement(placement)
    setPostLink('')
    setLinkError('')
    setIsModalOpen(true)
  }

  const handleStartWork = async (placementId: string) => {
    try {
      const response = await fetch(`/api/placements/${placementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      })

      if (!response.ok) {
        throw new Error('Не удалось обновить статус')
      }

      const result = await response.json()
      if (result.success) {
        // Update local state
        setPlacements((prev) =>
          prev.map((p) => (p.id === placementId ? { ...p, status: 'in_progress' } : p))
        )
        alert('Статус обновлён: В работе ⏳')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Произошла ошибка')
    }
  }

  const handleSubmitPost = async () => {
    if (!selectedPlacement) return

    // Validate URL
    if (!postLink.trim()) {
      setLinkError('Введите ссылку на публикацию')
      return
    }

    if (!validateUrl(postLink)) {
      setLinkError('Введите корректную ссылку (например, https://...)')
      return
    }

    setIsSubmitting(true)
    setLinkError('')

    try {
      const response = await fetch(`/api/placements/${selectedPlacement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'posted',
          post_link: postLink,
        }),
      })

      if (!response.ok) {
        throw new Error('Не удалось обновить статус')
      }

      const result = await response.json()
      if (result.success) {
        // Update local state
        setPlacements((prev) =>
          prev.map((p) =>
            p.id === selectedPlacement.id
              ? { ...p, status: 'posted', post_link: postLink }
              : p
          )
        )
        setIsModalOpen(false)
        alert('Публикация отмечена! Рекламодатель получил уведомление. ✅')
      }
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: { value: number; currency: string }) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price.value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const getDaysRemaining = (deadlineString: string) => {
    const deadline = new Date(deadlineString)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDeadlineStatus = (deadlineString: string) => {
    const daysRemaining = getDaysRemaining(deadlineString)
    if (daysRemaining < 0) {
      return { text: 'Просрочен', color: 'text-red-600', bgColor: 'bg-red-50' }
    } else if (daysRemaining === 0) {
      return { text: 'Сегодня', color: 'text-orange-600', bgColor: 'bg-orange-50' }
    } else if (daysRemaining === 1) {
      return { text: 'Завтра', color: 'text-orange-600', bgColor: 'bg-orange-50' }
    } else if (daysRemaining <= 3) {
      return { text: `${daysRemaining} дня`, color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    } else {
      return { text: `${daysRemaining} дней`, color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  // Filter placements
  const filteredPlacements = placements.filter((placement) => {
    if (statusFilter === 'all') return true
    return placement.status === statusFilter
  })

  // Group by status
  const groupedPlacements = {
    in_progress: filteredPlacements.filter((p) => p.status === 'in_progress'),
    booked: filteredPlacements.filter((p) => p.status === 'booked'),
    posted: filteredPlacements.filter((p) => p.status === 'posted'),
    approved: filteredPlacements.filter((p) => p.status === 'approved'),
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
          <Button onClick={loadPlacements}>Попробовать снова</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои размещения</h1>
        <p className="text-gray-600">
          Управляйте активными размещениями и отслеживайте прогресс выполнения
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">В работе</p>
                <p className="text-2xl font-bold text-orange-600">
                  {groupedPlacements.in_progress.length}
                </p>
              </div>
              <Loader2 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Забронировано</p>
                <p className="text-2xl font-bold text-blue-600">
                  {groupedPlacements.booked.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Опубликовано</p>
                <p className="text-2xl font-bold text-green-600">
                  {groupedPlacements.posted.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Одобрено</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {groupedPlacements.approved.length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          Все ({placements.length})
        </Button>
        <Button
          variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('in_progress')}
        >
          В работе ({groupedPlacements.in_progress.length})
        </Button>
        <Button
          variant={statusFilter === 'booked' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('booked')}
        >
          Забронировано ({groupedPlacements.booked.length})
        </Button>
        <Button
          variant={statusFilter === 'posted' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('posted')}
        >
          Опубликовано ({groupedPlacements.posted.length})
        </Button>
        <Button
          variant={statusFilter === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('approved')}
        >
          Одобрено ({groupedPlacements.approved.length})
        </Button>
      </div>

      {/* Placements List */}
      {filteredPlacements.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Нет активных размещений
              </h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === 'all'
                  ? 'У вас пока нет активных размещений'
                  : `Нет размещений со статусом "${STATUS_LABELS[statusFilter as keyof typeof STATUS_LABELS]?.label}"`}
              </p>
              <Button onClick={() => router.push('/creator/proposals')}>
                Посмотреть предложения
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPlacements.map((placement) => {
            const StatusIcon = STATUS_LABELS[placement.status]?.icon
            const deadlineStatus = getDeadlineStatus(placement.deadline_at)

            return (
              <Card key={placement.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Campaign Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          {placement.campaign.brand?.logo_url ? (
                            <img
                              src={placement.campaign.brand.logo_url}
                              alt={placement.campaign.brand.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {placement.campaign.brand?.name?.[0] || 'B'}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {placement.campaign.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {placement.campaign.brand?.name || 'Бренд'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={STATUS_LABELS[placement.status]?.variant}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {STATUS_LABELS[placement.status]?.label}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {placement.campaign.description}
                      </p>

                      {/* Channel & Format Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Канал</p>
                          <p className="text-sm font-medium text-gray-900">
                            {placement.channel.blogger_name}
                          </p>
                          <p className="text-xs text-gray-600 capitalize">
                            {placement.channel.platform}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Формат</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {placement.format.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            SLA: {placement.format.sla_days} дней
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {new Intl.NumberFormat('ru-RU').format(
                              placement.channel.subscribers
                            )}{' '}
                            подписчиков
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>
                            {new Intl.NumberFormat('ru-RU').format(
                              placement.channel.avg_views
                            )}{' '}
                            просмотров
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{placement.channel.engagement_rate.toFixed(2)}% ER</span>
                        </div>
                      </div>

                      {/* Deadline & Price */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg ${deadlineStatus.bgColor}`}
                        >
                          <Clock className={`h-4 w-4 ${deadlineStatus.color}`} />
                          <span className={`text-sm font-medium ${deadlineStatus.color}`}>
                            Дедлайн: {formatDate(placement.deadline_at)} (
                            {deadlineStatus.text})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-50">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            {formatPrice(placement.unit_price)}
                          </span>
                        </div>
                      </div>

                      {/* Post Link */}
                      {placement.post_link && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                          <ExternalLink className="h-4 w-4" />
                          <a
                            href={placement.post_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Ссылка на публикацию
                          </a>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {placement.status === 'booked' && (
                          <Button
                            onClick={() => handleStartWork(placement.id)}
                            className="flex-1"
                          >
                            <Loader2 className="mr-2 h-4 w-4" />
                            Начать работу
                          </Button>
                        )}

                        {placement.status === 'in_progress' && (
                          <Button
                            onClick={() => openMarkPostedModal(placement)}
                            className="flex-1"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Отметить как опубликовано
                          </Button>
                        )}

                        {placement.status === 'posted' && (
                          <div className="flex-1 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium text-center">
                            Ожидание одобрения рекламодателя
                          </div>
                        )}

                        {placement.status === 'approved' && (
                          <div className="flex-1 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Размещение завершено
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal for marking as posted */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Отметить как опубликовано</DialogTitle>
            <DialogDescription>
              Добавьте ссылку на опубликованный пост. Рекламодатель получит уведомление и
              сможет одобрить размещение.
            </DialogDescription>
          </DialogHeader>

          {selectedPlacement && (
            <div className="mb-4 p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {selectedPlacement.campaign.name}
              </p>
              <p className="text-xs text-gray-600">
                {selectedPlacement.channel.blogger_name} •{' '}
                {selectedPlacement.format.name}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="post_link">Ссылка на публикацию *</Label>
              <Input
                id="post_link"
                type="url"
                placeholder="https://..."
                value={postLink}
                onChange={(e) => {
                  setPostLink(e.target.value)
                  setLinkError('')
                }}
                className={linkError ? 'border-red-500' : ''}
              />
              {linkError && <p className="text-sm text-red-600 mt-1">{linkError}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Введите полную ссылку на опубликованный пост (например,
                https://youtube.com/watch?v=...)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button onClick={handleSubmitPost} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Подтвердить публикацию
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
