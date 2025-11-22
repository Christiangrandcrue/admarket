'use client'

import { CampaignDraft, IntegrationFormat, formatLabels } from '@/types/campaign'
import { Check } from 'lucide-react'

interface StepFormatsProps {
  draft: CampaignDraft
  updateDraft: (updates: Partial<CampaignDraft>) => void
}

const formats: IntegrationFormat[] = ['story', 'post', 'video', 'short', 'integration', 'dedicated']

export function StepFormats({ draft, updateDraft }: StepFormatsProps) {
  const toggleFormat = (format: IntegrationFormat) => {
    const selected = draft.defaultFormats.includes(format)
    updateDraft({
      defaultFormats: selected
        ? draft.defaultFormats.filter((f) => f !== format)
        : [...draft.defaultFormats, format],
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Форматы интеграций</h2>
        <p className="text-gray-600">
          Выберите типы рекламных размещений
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {formats.map((format) => {
          const isSelected = draft.defaultFormats.includes(format)
          return (
            <button
              key={format}
              onClick={() => toggleFormat(format)}
              className={`rounded-xl border-2 p-6 text-center transition-all ${
                isSelected
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {isSelected && (
                <div className="mb-2 flex justify-end">
                  <Check className="h-5 w-5 text-purple-600" />
                </div>
              )}
              <div className="text-3xl mb-3">
                {format === 'story' && '📱'}
                {format === 'post' && '📷'}
                {format === 'video' && '🎥'}
                {format === 'short' && '⚡'}
                {format === 'integration' && '🎬'}
                {format === 'dedicated' && '🎯'}
              </div>
              <div className="font-semibold text-gray-900">{formatLabels[format]}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
