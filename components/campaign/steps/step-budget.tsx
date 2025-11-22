'use client'

import { Input } from '@/components/ui/input'
import { CampaignDraft, PaymentModel, paymentModelLabels } from '@/types/campaign'

interface StepBudgetProps {
  draft: CampaignDraft
  updateDraft: (updates: Partial<CampaignDraft>) => void
}

const paymentModels: PaymentModel[] = ['cpp', 'cpa', 'cpm', 'fixed']

export function StepBudget({ draft, updateDraft }: StepBudgetProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Бюджет и сроки</h2>
        <p className="text-gray-600">Укажите бюджет и период проведения кампании</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Общий бюджет <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <Input
            type="number"
            value={draft.totalBudget || ''}
            onChange={(e) => updateDraft({ totalBudget: Number(e.target.value) })}
            placeholder="100000"
            className="pr-12"
            required
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">₽</span>
        </div>
      </div>

      <div>
        <label className="mb-4 block text-sm font-semibold text-gray-900">
          Модель оплаты
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          {paymentModels.map((model) => (
            <button
              key={model}
              onClick={() => updateDraft({ paymentModel: model })}
              className={`rounded-xl border-2 p-4 text-left ${
                draft.paymentModel === model
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{paymentModelLabels[model]}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Дата начала <span className="text-red-600">*</span>
          </label>
          <Input
            type="date"
            value={draft.startDate}
            onChange={(e) => updateDraft({ startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Дата окончания <span className="text-red-600">*</span>
          </label>
          <Input
            type="date"
            value={draft.endDate}
            onChange={(e) => updateDraft({ endDate: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  )
}
