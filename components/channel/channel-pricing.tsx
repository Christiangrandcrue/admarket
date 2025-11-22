'use client'

import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Channel } from '@/types'

interface ChannelPricingProps {
  channel: Channel
}

// Типы рекламных интеграций
const integrationTypes = [
  {
    id: 'mention',
    name: 'Упоминание',
    duration: '30 сек',
    price: 50000,
    features: ['В начале видео', 'Название бренда', 'Ссылка в описании'],
  },
  {
    id: 'integration',
    name: 'Интеграция',
    duration: '1-2 мин',
    price: 120000,
    features: ['Органичный сюжет', 'Демонстрация продукта', 'Промокод', 'Ссылка в описании'],
    popular: true,
  },
  {
    id: 'dedicated',
    name: 'Отдельный ролик',
    duration: '3-5 мин',
    price: 250000,
    features: ['Полноценный обзор', 'Детальное тестирование', 'Промокод', 'Закреп в комментариях'],
  },
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price)
}

export function ChannelPricing({ channel }: ChannelPricingProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Прайс</h2>

      <div className="space-y-4">
        {integrationTypes.map((type) => (
          <div
            key={type.id}
            className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
              type.popular
                ? 'border-purple-200 bg-purple-50'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  {type.popular && (
                    <Badge variant="default" className="bg-purple-600">
                      Популярно
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{type.duration}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(type.price)} ₽
              </div>
            </div>

            <ul className="space-y-2">
              {type.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          💡 <strong>Совет:</strong> Цены могут варьироваться в зависимости от сложности интеграции и требований к креативу.
        </p>
      </div>
    </div>
  )
}
