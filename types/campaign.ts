export type CampaignGoal = 'awareness' | 'traffic' | 'conversions' | 'sales'

export type PaymentModel = 'cpa' | 'cpp' | 'cpm' | 'fixed'

export type IntegrationFormat = 'story' | 'post' | 'video' | 'short' | 'integration' | 'dedicated'

export interface CampaignKPI {
  impressions?: number
  clicks?: number
  conversions?: number
  sales?: number
  ctr?: number
  cpc?: number
  cpa?: number
  roi?: number
}

export interface SelectedChannel {
  channelId: string
  channelTitle: string
  channelHandle: string
  formats: IntegrationFormat[]
  budget: number
  notes?: string
}

export interface CampaignDraft {
  // Step 1: Goals & KPI
  title: string
  goal: CampaignGoal
  kpis: CampaignKPI
  description: string

  // Step 2: Channels
  selectedChannels: SelectedChannel[]

  // Step 3: Formats (общие для всех каналов, если не переопределено)
  defaultFormats: IntegrationFormat[]

  // Step 4: Budget & Dates
  totalBudget: number
  paymentModel: PaymentModel
  startDate: string
  endDate: string

  // Step 5: Creative & Brief
  briefDescription: string
  contentRequirements: string[]
  restrictions: string[]
  utmCampaign: string
  promoCode?: string
  landingUrl: string

  // Step 6: Confirmation
  agreedToTerms: boolean
}

export const campaignGoalLabels: Record<CampaignGoal, string> = {
  awareness: 'Узнаваемость бренда',
  traffic: 'Трафик на сайт',
  conversions: 'Конверсии',
  sales: 'Продажи',
}

export const paymentModelLabels: Record<PaymentModel, string> = {
  cpa: 'CPA (за действие)',
  cpp: 'CPP (за публикацию)',
  cpm: 'CPM (за 1000 показов)',
  fixed: 'Fixed (фиксированная оплата)',
}

export const formatLabels: Record<IntegrationFormat, string> = {
  story: 'Stories',
  post: 'Пост',
  video: 'Видео',
  short: 'Shorts/Reels',
  integration: 'Интеграция',
  dedicated: 'Отдельный ролик',
}
