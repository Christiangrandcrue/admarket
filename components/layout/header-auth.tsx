'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function HeaderAuth() {
  const { user, loading, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-200"></div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">
            Войти
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button size="sm">
            Начать
          </Button>
        </Link>
      </div>
    )
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const userRole = user.user_metadata?.role || 'advertiser'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-semibold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="hidden text-sm font-medium text-gray-900 md:block">
          {displayName}
        </span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-100 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-4">
            <div className="mb-1 font-semibold text-gray-900">{displayName}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-900">
                {userRole === 'advertiser' ? '💼 Рекламодатель' : '🎬 Блогер'}
              </span>
            </div>
          </div>

          <div className="p-2">
            <Link
              href="/dashboard"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <LayoutDashboard className="h-4 w-4" />
              Дашборд
            </Link>
            <Link
              href="/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              Настройки
            </Link>
            <button
              onClick={() => {
                signOut()
                setDropdownOpen(false)
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
