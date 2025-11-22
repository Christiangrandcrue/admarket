'use client'

import { Input } from '@/components/ui/input'
import { CampaignDraft } from '@/types/campaign'

interface StepCreativeProps {
  draft: CampaignDraft
  updateDraft: (updates: Partial<CampaignDraft>) => void
}

export function StepCreative({ draft, updateDraft }: StepCreativeProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Креатив и бриф</h2>
        <p className="text-gray-600">Опишите требования к контенту и настройте отслеживание</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Бриф для блогеров <span className="text-red-600">*</span>
        </label>
        <textarea
          value={draft.briefDescription}
          onChange={(e) => updateDraft({ briefDescription: e.target.value })}
          placeholder="Опишите, как должна быть представлена ваша реклама, какие моменты обязательно осветить, tone of voice..."
          className="min-h-[120px] w-full rounded-xl border border-gray-200 p-4 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Landing URL <span className="text-red-600">*</span>
        </label>
        <Input
          type="url"
          value={draft.landingUrl}
          onChange={(e) => updateDraft({ landingUrl: e.target.value })}
          placeholder="https://yoursite.com/product"
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            UTM-кампания
          </label>
          <Input
            value={draft.utmCampaign}
            onChange={(e) => updateDraft({ utmCampaign: e.target.value })}
            placeholder="summer_promo_2025"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Промокод (опционально)
          </label>
          <Input
            value={draft.promoCode || ''}
            onChange={(e) => updateDraft({ promoCode: e.target.value })}
            placeholder="PROMO20"
          />
        </div>
      </div>
    </div>
  )
}
