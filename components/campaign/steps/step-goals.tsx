'use client'

import { Input } from '@/components/ui/input'
import { CampaignDraft, CampaignGoal, campaignGoalLabels } from '@/types/campaign'
import { Target, TrendingUp, MousePointerClick, DollarSign } from 'lucide-react'

interface StepGoalsProps {
  draft: CampaignDraft
  updateDraft: (updates: Partial<CampaignDraft>) => void
}

const goalIcons = {
  awareness: Target,
  traffic: MousePointerClick,
  conversions: TrendingUp,
  sales: DollarSign,
}

const goalDescriptions: Record<CampaignGoal, string> = {
  awareness: 'Повышение узнаваемости бренда, охват новой аудитории',
  traffic: 'Привлечение трафика на сайт, социальные сети или приложение',
  conversions: 'Увеличение количества целевых действий (регистрации, подписки)',
  sales: 'Рост продаж и выручки через прямую атрибуцию',
}

export function StepGoals({ draft, updateDraft }: StepGoalsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Цели кампании
        </h2>
        <p className="text-gray-600">
          Выберите главную цель и опишите, чего хотите достичь
        </p>
      </div>

      {/* Goal Selection */}
      <div>
        <label className="mb-4 block text-sm font-semibold text-gray-900">
          Главная цель
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(goalIcons) as CampaignGoal[]).map((goal) => {
            const Icon = goalIcons[goal]
            const isSelected = draft.goal === goal

            return (
              <button
                key={goal}
                onClick={() => updateDraft({ goal })}
                className={`flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 font-semibold text-gray-900">
                    {campaignGoalLabels[goal]}
                  </div>
                  <div className="text-sm text-gray-600">
                    {goalDescriptions[goal]}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-semibold text-gray-900"
        >
          Описание кампании
          <span className="ml-1 text-red-600">*</span>
        </label>
        <textarea
          id="description"
          value={draft.description}
          onChange={(e) => updateDraft({ description: e.target.value })}
          placeholder="Опишите вашу кампанию, продукт/услугу, целевую аудиторию и ожидаемые результаты..."
          className="min-h-[120px] w-full rounded-xl border border-gray-200 p-4 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        />
        <p className="mt-2 text-sm text-gray-500">
          Минимум 50 символов. Чем подробнее, тем лучше блогеры поймут ваши задачи.
        </p>
      </div>

      {/* KPIs */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Целевые показатели (KPI)
          </h3>
          <p className="text-sm text-gray-600">
            Укажите желаемые значения метрик (опционально)
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="kpi-impressions" className="mb-2 block text-sm font-medium text-gray-900">
              Показы (Impressions)
            </label>
            <Input
              id="kpi-impressions"
              type="number"
              placeholder="100000"
              value={draft.kpis.impressions || ''}
              onChange={(e) =>
                updateDraft({
                  kpis: { ...draft.kpis, impressions: Number(e.target.value) },
                })
              }
            />
          </div>

          <div>
            <label htmlFor="kpi-clicks" className="mb-2 block text-sm font-medium text-gray-900">
              Клики
            </label>
            <Input
              id="kpi-clicks"
              type="number"
              placeholder="5000"
              value={draft.kpis.clicks || ''}
              onChange={(e) =>
                updateDraft({
                  kpis: { ...draft.kpis, clicks: Number(e.target.value) },
                })
              }
            />
          </div>

          <div>
            <label htmlFor="kpi-conversions" className="mb-2 block text-sm font-medium text-gray-900">
              Конверсии
            </label>
            <Input
              id="kpi-conversions"
              type="number"
              placeholder="500"
              value={draft.kpis.conversions || ''}
              onChange={(e) =>
                updateDraft({
                  kpis: { ...draft.kpis, conversions: Number(e.target.value) },
                })
              }
            />
          </div>

          <div>
            <label htmlFor="kpi-sales" className="mb-2 block text-sm font-medium text-gray-900">
              Продажи
            </label>
            <Input
              id="kpi-sales"
              type="number"
              placeholder="100"
              value={draft.kpis.sales || ''}
              onChange={(e) =>
                updateDraft({
                  kpis: { ...draft.kpis, sales: Number(e.target.value) },
                })
              }
            />
          </div>

          <div>
            <label htmlFor="kpi-ctr" className="mb-2 block text-sm font-medium text-gray-900">
              CTR (%)
            </label>
            <Input
              id="kpi-ctr"
              type="number"
              step="0.1"
              placeholder="5.0"
              value={draft.kpis.ctr || ''}
              onChange={(e) =>
                updateDraft({
                  kpis: { ...draft.kpis, ctr: Number(e.target.value) },
                })
              }
            />
          </div>

          <div>
            <label htmlFor="kpi-roi" className="mb-2 block text-sm font-medium text-gray-900">
              ROI (%)
            </label>
            <Input
              id="kpi-roi"
              type="number"
              step="1"
              placeholder="200"
              value={draft.kpis.roi || ''}
              onChange={(e) =>
                updateDraft({
                  kpis: { ...draft.kpis, roi: Number(e.target.value) },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
