'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CampaignProgress } from '@/components/campaign/campaign-progress'
import { StepGoals } from '@/components/campaign/steps/step-goals'
import { StepChannels } from '@/components/campaign/steps/step-channels'
import { StepFormats } from '@/components/campaign/steps/step-formats'
import { StepBudget } from '@/components/campaign/steps/step-budget'
import { StepCreative } from '@/components/campaign/steps/step-creative'
import { StepConfirmation } from '@/components/campaign/steps/step-confirmation'
import { CampaignDraft } from '@/types/campaign'
import { ArrowLeft, ArrowRight, Save } from 'lucide-react'
import Link from 'next/link'

const initialDraft: CampaignDraft = {
  goal: 'conversions',
  kpis: {},
  description: '',
  selectedChannels: [],
  defaultFormats: [],
  totalBudget: 0,
  paymentModel: 'cpp',
  startDate: '',
  endDate: '',
  briefDescription: '',
  contentRequirements: [],
  restrictions: [],
  utmCampaign: '',
  landingUrl: '',
  agreedToTerms: false,
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedChannelId = searchParams.get('channel')

  const [currentStep, setCurrentStep] = useState(1)
  const [draft, setDraft] = useState<CampaignDraft>(initialDraft)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateDraft = (updates: Partial<CampaignDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/campaigns/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save draft')
      }

      // Show success message (could be a toast notification)
      console.log('Draft saved successfully:', data.campaign)
      alert('Черновик сохранён успешно!')
    } catch (error: any) {
      console.error('Error saving draft:', error)
      setError(error.message)
      alert(`Ошибка при сохранении: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign')
      }

      console.log('Campaign created successfully:', data.campaign)
      
      // Redirect to campaigns list or success page
      router.push('/dashboard/campaigns?success=true')
    } catch (error: any) {
      console.error('Error creating campaign:', error)
      setError(error.message)
      alert(`Ошибка при создании кампании: ${error.message}`)
      setSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return draft.description.length > 0
      case 2:
        return draft.selectedChannels.length > 0
      case 3:
        return draft.defaultFormats.length > 0
      case 4:
        return draft.totalBudget > 0 && draft.startDate && draft.endDate
      case 5:
        return draft.briefDescription.length > 0 && draft.landingUrl.length > 0
      case 6:
        return draft.agreedToTerms
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться в дашборд
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Создание кампании
              </h1>
              <p className="text-gray-600">
                Заполните информацию в 6 простых шагов
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Сохранение...' : 'Сохранить черновик'}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <CampaignProgress currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            {currentStep === 1 && (
              <StepGoals draft={draft} updateDraft={updateDraft} />
            )}
            {currentStep === 2 && (
              <StepChannels 
                draft={draft} 
                updateDraft={updateDraft}
                preselectedChannelId={preselectedChannelId}
              />
            )}
            {currentStep === 3 && (
              <StepFormats draft={draft} updateDraft={updateDraft} />
            )}
            {currentStep === 4 && (
              <StepBudget draft={draft} updateDraft={updateDraft} />
            )}
            {currentStep === 5 && (
              <StepCreative draft={draft} updateDraft={updateDraft} />
            )}
            {currentStep === 6 && (
              <StepConfirmation draft={draft} updateDraft={updateDraft} />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>

            {currentStep < 6 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Далее
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="gap-2"
              >
                {submitting ? 'Создание...' : 'Запустить кампанию'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
