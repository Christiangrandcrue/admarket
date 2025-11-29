'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  MessageSquare,
  Users,
  Video,
  Zap,
  Inbox,
  PlayCircle,
  DollarSign,
  Settings,
  History
} from 'lucide-react'

export function DashboardSidebar() {
  const pathname = usePathname()
  const isCreator = pathname?.startsWith('/dashboard/creator')

  const advertiserLinks = [
    {
      href: '/catalog',
      label: 'Каталог блогеров',
      icon: Users,
      external: false
    },
    {
      href: '/dashboard/campaigns',
      label: 'Мои кампании',
      icon: Megaphone,
    },
    {
      href: '/dashboard/analytics',
      label: 'Аналитика',
      icon: BarChart3,
    },
    {
      href: '/messages',
      label: 'Сообщения',
      icon: MessageSquare,
      external: false
    },
  ]

  const creatorLinks = [
    {
      href: '/dashboard/creator',
      label: 'Обзор',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/creator/content-factory',
      label: 'Комбайн контента',
      icon: Zap,
      badge: 'New'
    },
    {
      href: '/dashboard/creator/videos',
      label: 'Мои видео',
      icon: History,
    },
    {
      href: '/dashboard/creator/channel',
      label: 'Мой канал',
      icon: Video,
    },
    {
      href: '/dashboard/creator/requests',
      label: 'Входящие заявки',
      icon: Inbox,
    },
    {
      href: '/dashboard/creator/active',
      label: 'Активные',
      icon: PlayCircle,
    },
    {
      href: '/dashboard/creator/earnings',
      label: 'Заработок',
      icon: DollarSign,
    },
  ]

  const links = isCreator ? creatorLinks : advertiserLinks

  return (
    <div className="hidden border-r border-gray-200 bg-white md:block md:w-64">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <span className="text-lg font-bold text-gray-900">
            {isCreator ? 'Кабинет блогера' : 'Кабинет рекламодателя'}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-4">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                      isActive
                        ? 'text-purple-700'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  <span className="flex-1">{link.label}</span>
                  {link.badge && (
                    <span className="ml-auto inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="border-t border-gray-200 p-4">
          <Link
            href="/settings"
            className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Настройки
          </Link>
        </div>
      </div>
    </div>
  )
}
