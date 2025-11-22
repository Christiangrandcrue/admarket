'use client'

import { Button } from '@/components/ui/button'
import { MessageSquare, Rocket } from 'lucide-react'
import Link from 'next/link'
import type { Channel } from '@/types'

interface ChannelCTAProps {
  channel: Channel
}

export function ChannelCTA({ channel }: ChannelCTAProps) {
  return (
    <div className="sticky top-8 space-y-4">
      {/* Primary CTA */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white">
        <h3 className="mb-2 text-xl font-bold">Запустить кампанию</h3>
        <p className="mb-4 text-sm text-purple-100">
          Создайте рекламную кампанию с этим блогером за 5 минут
        </p>
        
        <Link href={`/campaign/create?channel=${channel.id}`}>
          <Button 
            className="w-full bg-white text-purple-600 hover:bg-gray-100"
            size="lg"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Создать кампанию
          </Button>
        </Link>
      </div>

      {/* Secondary CTA */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Есть вопросы?</h3>
        <p className="mb-4 text-sm text-gray-600">
          Свяжитесь с менеджером блогера для уточнения деталей
        </p>
        
        <Button variant="outline" className="w-full">
          <MessageSquare className="mr-2 h-4 w-4" />
          Написать менеджеру
        </Button>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Гарантии платформы</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Эскроу-счёт для безопасности оплаты</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Контроль выполнения обязательств</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Детальная аналитика кампании</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Поддержка 24/7</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
