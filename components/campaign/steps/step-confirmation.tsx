'use client'

import { CampaignDraft, campaignGoalLabels, paymentModelLabels, formatLabels } from '@/types/campaign'
import { Badge } from '@/components/ui/badge'

interface StepConfirmationProps {
  draft: CampaignDraft
  updateDraft: (updates: Partial<CampaignDraft>) => void
}

export function StepConfirmation({ draft, updateDraft }: StepConfirmationProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Подтверждение</h2>
        <p className="text-gray-600">Проверьте данные перед созданием кампании</p>
      </div>

      {/* Summary */}
      <div className="space-y-6">
        <div className="rounded-xl bg-gray-50 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Основная информация</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Цель:</span>
              <span className="font-medium text-gray-900">{campaignGoalLabels[draft.goal]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Бюджет:</span>
              <span className="font-medium text-gray-900">{draft.totalBudget.toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Модель оплаты:</span>
              <span className="font-medium text-gray-900">{paymentModelLabels[draft.paymentModel]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Период:</span>
              <span className="font-medium text-gray-900">
                {draft.startDate} — {draft.endDate}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Каналы ({draft.selectedChannels.length})</h3>
          <div className="space-y-2">
            {draft.selectedChannels.map((channel) => (
              <div key={channel.channelId} className="text-sm text-gray-700">
                • {channel.channelTitle} ({channel.channelHandle})
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Форматы</h3>
          <div className="flex flex-wrap gap-2">
            {draft.defaultFormats.map((format) => (
              <Badge key={format} variant="secondary">
                {formatLabels[format]}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={draft.agreedToTerms}
            onChange={(e) => updateDraft({ agreedToTerms: e.target.checked })}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Я принимаю условия:</span>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Оплата через эскроу-счёт с задержкой до публикации</li>
              <li>Комиссия платформы 10% от суммы сделки</li>
              <li>Возврат средств возможен только до начала работы блогера</li>
              <li>Платформа выступает гарантом выполнения обязательств</li>
            </ul>
          </div>
        </label>
      </div>
    </div>
  )
}
