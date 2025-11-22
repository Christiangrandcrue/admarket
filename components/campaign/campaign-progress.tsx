'use client'

import { Check } from 'lucide-react'

interface StepConfig {
  number: number
  title: string
  description: string
}

interface CampaignProgressProps {
  currentStep: number
  totalSteps?: number
}

const steps: StepConfig[] = [
  { number: 1, title: 'Цели', description: 'Цели и KPI' },
  { number: 2, title: 'Каналы', description: 'Выбор блогеров' },
  { number: 3, title: 'Форматы', description: 'Типы интеграций' },
  { number: 4, title: 'Бюджет', description: 'Бюджет и даты' },
  { number: 5, title: 'Креатив', description: 'Бриф и контент' },
  { number: 6, title: 'Подтверждение', description: 'Итоговая сводка' },
]

export function CampaignProgress({ currentStep, totalSteps = 6 }: CampaignProgressProps) {
  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number
            const isCurrent = currentStep === step.number
            const isUpcoming = currentStep < step.number

            return (
              <div key={step.number} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? 'border-green-600 bg-green-600 text-white'
                        : isCurrent
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-lg font-bold">{step.number}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <div
                      className={`text-sm font-semibold ${
                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="mx-4 flex-1">
                    <div
                      className={`h-0.5 transition-all ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="lg:hidden">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900">
            Шаг {currentStep} из {totalSteps}
          </span>
          <span className="text-gray-600">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-purple-600 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
