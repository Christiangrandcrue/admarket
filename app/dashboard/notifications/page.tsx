'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Filter } from 'lucide-react'
import { Notification, NotificationType } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

// Notification type icons and colors (same as NotificationBell)
const notificationConfig: Record<
  NotificationType,
  { icon: string; color: string; bgColor: string }
> = {
  placement_accepted: { icon: '✅', color: 'text-green-700', bgColor: 'bg-green-50' },
  placement_rejected: { icon: '❌', color: 'text-red-700', bgColor: 'bg-red-50' },
  new_placement_request: { icon: '🎯', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  content_uploaded: { icon: '📤', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  content_approved: { icon: '✅', color: 'text-green-700', bgColor: 'bg-green-50' },
  content_revision_requested: { icon: '🔄', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  campaign_completed: { icon: '🎉', color: 'text-green-700', bgColor: 'bg-green-50' },
  payment_received: { icon: '💰', color: 'text-green-700', bgColor: 'bg-green-50' },
  payment_sent: { icon: '💸', color: 'text-blue-700', bgColor: 'bg-blue-50' },
}

type FilterType = 'all' | 'unread'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const url = filter === 'unread' 
        ? '/api/notifications?unread_only=true&limit=100'
        : '/api/notifications?limit=100'
      
      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }

  // Fetch on mount and when filter changes
  useEffect(() => {
    fetchNotifications()
  }, [filter])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Уведомления</h1>
              <p className="mt-1 text-gray-600">
                {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все уведомления прочитаны'}
              </p>
            </div>

            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" className="gap-2">
                <CheckCheck className="h-4 w-4" />
                Отметить все как прочитанные
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Все ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Непрочитанные ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <div className="text-gray-500">Загрузка уведомлений...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <Bell className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filter === 'unread' ? 'Нет непрочитанных уведомлений' : 'Нет уведомлений'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === 'unread'
                ? 'Все уведомления прочитаны'
                : 'Уведомления о новых заявках, контенте и платежах будут появляться здесь'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const config = notificationConfig[notification.type]
              const NotificationContent = (
                <div
                  className={`flex gap-4 rounded-lg border p-6 transition-all ${
                    notification.is_read
                      ? 'border-gray-200 bg-white hover:border-gray-300'
                      : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                  } cursor-pointer`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 rounded-full ${config.bgColor} p-3`}>
                    <span className="text-2xl">{config.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )

              // Wrap in Link if action_url exists
              return notification.action_url ? (
                <Link key={notification.id} href={notification.action_url}>
                  {NotificationContent}
                </Link>
              ) : (
                <div key={notification.id}>{NotificationContent}</div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
