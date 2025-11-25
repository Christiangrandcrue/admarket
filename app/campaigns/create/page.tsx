'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

type CampaignGoal = 'sales' | 'installs' | 'awareness' | 'traffic'
type PricingModel = 'fixed' | 'cpm' | 'cpa' | 'cpp'

interface CampaignFormData {
  name: string
  goal: CampaignGoal
  description: string
  budget: {
    value: number
    currency: string
  }
  model: PricingModel
  geo: string[]
  audience: {
    gender: 'any' | 'male' | 'female'
    age: string[]
  }
  utm: {
    source: string
    medium: string
    campaign: string
  }
  promo_codes: string[]
  integrations: {
    ga4: boolean
    appsflyer: boolean
    shopify: boolean
  }
}

const GOALS: { value: CampaignGoal; label: string; description: string }[] = [
  { value: 'sales', label: 'Продажи', description: 'Прямые продажи продукта/услуги' },
  { value: 'installs', label: 'Установки', description: 'Установки мобильного приложения' },
  { value: 'awareness', label: 'Узнаваемость', description: 'Повышение узнаваемости бренда' },
  { value: 'traffic', label: 'Трафик', description: 'Привлечение трафика на сайт' },
]

const PRICING_MODELS: { value: PricingModel; label: string; description: string }[] = [
  { value: 'fixed', label: 'Фиксированная', description: 'Фиксированная цена за размещение' },
  { value: 'cpm', label: 'CPM', description: 'Цена за 1000 показов' },
  { value: 'cpa', label: 'CPA', description: 'Цена за действие (конверсию)' },
  { value: 'cpp', label: 'CPP', description: 'Цена за публикацию' },
]

const COUNTRIES = [
  { value: 'RU', label: 'Россия' },
  { value: 'BY', label: 'Беларусь' },
  { value: 'KZ', label: 'Казахстан' },
  { value: 'UA', label: 'Украина' },
  { value: 'US', label: 'США' },
  { value: 'DE', label: 'Германия' },
  { value: 'GB', label: 'Великобритания' },
]

const AGE_RANGES = ['18-24', '25-34', '35-44', '45+']

export default function CreateCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    goal: 'sales',
    description: '',
    budget: {
      value: 50000,
      currency: 'RUB',
    },
    model: 'fixed',
    geo: ['RU'],
    audience: {
      gender: 'any',
      age: ['25-34', '35-44'],
    },
    utm: {
      source: 'admarket',
      medium: 'influencer',
      campaign: '',
    },
    promo_codes: [],
    integrations: {
      ga4: false,
      appsflyer: false,
      shopify: false,
    },
  })

  const [promoCodeInput, setPromoCodeInput] = useState('')

  const handleAddPromoCode = () => {
    if (promoCodeInput.trim() && !formData.promo_codes.includes(promoCodeInput.trim())) {
      setFormData({
        ...formData,
        promo_codes: [...formData.promo_codes, promoCodeInput.trim()],
      })
      setPromoCodeInput('')
    }
  }

  const handleRemovePromoCode = (code: string) => {
    setFormData({
      ...formData,
      promo_codes: formData.promo_codes.filter((c) => c !== code),
    })
  }

  const handleToggleGeo = (country: string) => {
    setFormData({
      ...formData,
      geo: formData.geo.includes(country)
        ? formData.geo.filter((c) => c !== country)
        : [...formData.geo, country],
    })
  }

  const handleToggleAge = (age: string) => {
    setFormData({
      ...formData,
      audience: {
        ...formData.audience,
        age: formData.audience.age.includes(age)
          ? formData.audience.age.filter((a) => a !== age)
          : [...formData.audience.age, age],
      },
    })
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Auto-generate campaign name for UTM if empty
      const campaignData = {
        ...formData,
        utm: {
          ...formData.utm,
          campaign: formData.utm.campaign || formData.name.toLowerCase().replace(/\s+/g, '_'),
        },
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      const result = await response.json()
      
      if (result.success && result.campaign) {
        // Redirect to campaign details or select channels
        router.push(`/campaigns/${result.campaign.id}`)
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Ошибка создания кампании')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '' && formData.budget.value > 0
      case 2:
        return formData.geo.length > 0 && formData.audience.age.length > 0
      case 3:
        return formData.utm.source.trim() !== '' && formData.utm.medium.trim() !== ''
      default:
        return true
    }
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Создание кампании</h1>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    step === currentStep
                      ? 'bg-black text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? <Check className="h-5 w-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 w-20 ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            {currentStep === 1 && 'Основная информация'}
            {currentStep === 2 && 'Аудитория и география'}
            {currentStep === 3 && 'Трекинг и промокоды'}
            {currentStep === 4 && 'Выбор блогеров'}
          </div>
        </div>

        {/* Form Content */}
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Название кампании *</Label>
                <Input
                  id="name"
                  placeholder="Например: Запуск нового продукта"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Цель кампании *</Label>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, goal: goal.value })}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${
                        formData.goal === goal.value
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="mb-1 font-semibold text-gray-900">{goal.label}</div>
                      <div className="text-sm text-gray-600">{goal.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Описание кампании</Label>
                <Textarea
                  id="description"
                  placeholder="Расскажите о вашей кампании..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="budget">Бюджет *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.budget.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: { ...formData.budget, value: Number(e.target.value) },
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Валюта</Label>
                  <Select
                    value={formData.budget.currency}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        budget: { ...formData.budget, currency: value },
                      })
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUB">₽ RUB</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Модель оплаты</Label>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {PRICING_MODELS.map((model) => (
                    <button
                      key={model.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, model: model.value })}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${
                        formData.model === model.value
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="mb-1 font-semibold text-gray-900">{model.label}</div>
                      <div className="text-sm text-gray-600">{model.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Audience & Geo */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label>География *</Label>
                <p className="mb-3 text-sm text-gray-600">
                  Выберите страны для показа рекламы
                </p>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.value}
                      type="button"
                      onClick={() => handleToggleGeo(country.value)}
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                        formData.geo.includes(country.value)
                          ? 'border-black bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {country.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Пол аудитории</Label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(['any', 'male', 'female'] as const).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          audience: { ...formData.audience, gender },
                        })
                      }
                      className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                        formData.audience.gender === gender
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {gender === 'any' && 'Любой'}
                      {gender === 'male' && 'Мужской'}
                      {gender === 'female' && 'Женский'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Возраст аудитории *</Label>
                <p className="mb-3 text-sm text-gray-600">Выберите одну или несколько групп</p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => handleToggleAge(age)}
                      className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                        formData.audience.age.includes(age)
                          ? 'border-black bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tracking */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">UTM метки</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="utm_source">utm_source *</Label>
                    <Input
                      id="utm_source"
                      placeholder="admarket"
                      value={formData.utm.source}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          utm: { ...formData.utm, source: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="utm_medium">utm_medium *</Label>
                    <Input
                      id="utm_medium"
                      placeholder="influencer"
                      value={formData.utm.medium}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          utm: { ...formData.utm, medium: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="utm_campaign">utm_campaign</Label>
                    <Input
                      id="utm_campaign"
                      placeholder="Автоматически из названия кампании"
                      value={formData.utm.campaign}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          utm: { ...formData.utm, campaign: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Промокоды</h3>
                <div className="mb-3 flex gap-2">
                  <Input
                    placeholder="Введите промокод"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddPromoCode()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddPromoCode} variant="outline">
                    Добавить
                  </Button>
                </div>
                {formData.promo_codes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.promo_codes.map((code) => (
                      <Badge
                        key={code}
                        variant="secondary"
                        className="cursor-pointer gap-2"
                        onClick={() => handleRemovePromoCode(code)}
                      >
                        {code}
                        <span className="text-xs">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Интеграции</h3>
                <div className="space-y-3">
                  {[
                    { key: 'ga4', label: 'Google Analytics 4', description: 'Отслеживание конверсий' },
                    { key: 'appsflyer', label: 'AppsFlyer', description: 'Трекинг установок приложений' },
                    { key: 'shopify', label: 'Shopify', description: 'Отслеживание продаж' },
                  ].map((integration) => (
                    <label
                      key={integration.key}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={formData.integrations[integration.key as keyof typeof formData.integrations]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            integrations: {
                              ...formData.integrations,
                              [integration.key]: e.target.checked,
                            },
                          })
                        }
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{integration.label}</div>
                        <div className="text-sm text-gray-600">{integration.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Select Channels (Placeholder) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Выбор блогеров для размещения
                </h3>
                <p className="mb-6 text-gray-600">
                  Кампания будет создана. Вы сможете выбрать блогеров из каталога на следующем шаге.
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-gray-50 p-6">
                <h4 className="mb-4 font-semibold text-gray-900">Сводка кампании</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Название:</span>
                    <span className="font-medium text-gray-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Цель:</span>
                    <span className="font-medium text-gray-900">
                      {GOALS.find((g) => g.value === formData.goal)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Бюджет:</span>
                    <span className="font-medium text-gray-900">
                      {formData.budget.value.toLocaleString()} {formData.budget.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">География:</span>
                    <span className="font-medium text-gray-900">
                      {formData.geo.map((g) => COUNTRIES.find((c) => c.value === g)?.label).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Возраст:</span>
                    <span className="font-medium text-gray-900">{formData.audience.age.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={!isStepValid()}>
                Далее
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  'Создание...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Создать кампанию
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
