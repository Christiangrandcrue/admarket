import { Suspense } from 'react'
import { TelegramConnect } from '@/components/settings/telegram-connect'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Настройки - AdMarket',
  description: 'Настройки профиля и уведомлений',
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
        <p className="mt-2 text-gray-600">
          Управляйте настройками профиля и уведомлениями
        </p>
      </div>

      <div className="space-y-6">
        {/* Telegram Integration */}
        <Suspense
          fallback={
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
            </div>
          }
        >
          <TelegramConnect />
        </Suspense>

        {/* Future settings sections can be added here */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold">Email уведомления</h3>
          <p className="mt-1 text-sm text-gray-600">
            Настройте, какие уведомления вы хотите получать по email
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Coming soon...
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold">Профиль</h3>
          <p className="mt-1 text-sm text-gray-600">
            Обновите информацию о себе и контактные данные
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}
