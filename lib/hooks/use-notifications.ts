'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types'
import { useAuth } from '@/lib/auth/auth-context'

interface UseNotificationsOptions {
  limit?: number
  unreadOnly?: boolean
  autoFetch?: boolean
  enableRealtime?: boolean
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    limit = 50,
    unreadOnly = false,
    autoFetch = true,
    enableRealtime = true,
  } = options

  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(unreadOnly && { unread_only: 'true' }),
      })

      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      } else {
        throw new Error(data.error || 'Failed to fetch notifications')
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, limit, unreadOnly])

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
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
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
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
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    if (autoFetch && user) {
      fetchNotifications()
    }
  }, [autoFetch, user, fetchNotifications])

  // Setup Realtime subscription
  useEffect(() => {
    if (!enableRealtime || !user) return

    const supabase = createClient()

    // Subscribe to INSERT events for current user
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 New notification received:', payload)
          
          const newNotification = payload.new as Notification

          // Add to notifications list (prepend)
          setNotifications((prev) => [newNotification, ...prev].slice(0, limit))

          // Increment unread count
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1)
          }

          // Optional: Play sound or show toast
          // This will be handled by the component using this hook
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Notification updated:', payload)
          
          const updatedNotification = payload.new as Notification

          // Update in notifications list
          setNotifications((prev) =>
            prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
          )

          // Update unread count if read status changed
          const oldNotification = payload.old as Notification
          if (oldNotification.is_read !== updatedNotification.is_read) {
            setUnreadCount((prev) =>
              updatedNotification.is_read ? Math.max(0, prev - 1) : prev + 1
            )
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
      })

    // Cleanup
    return () => {
      console.log('🔌 Unsubscribing from realtime notifications')
      supabase.removeChannel(channel)
    }
  }, [enableRealtime, user, limit])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
