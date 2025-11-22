// Database Types based on ТЗ schema

export type UserRole = 'advertiser' | 'creator' | 'admin'
export type KycStatus = 'pending' | 'verified' | 'rejected'

// Notification types
export type NotificationType = 
  | 'placement_accepted'
  | 'placement_rejected'
  | 'new_placement_request'
  | 'content_uploaded'
  | 'content_approved'
  | 'content_revision_requested'
  | 'campaign_completed'
  | 'payment_received'
  | 'payment_sent'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  campaign_id?: string
  placement_id?: string
  channel_id?: string
  action_url?: string
  is_read: boolean
  read_at?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  role: UserRole
  name: string
  email: string
  phone?: string
  company?: string
  kyc_status: KycStatus
  billing?: {
    country: string
    vat?: string
  }
  created_at: string
  updated_at: string
}

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'telegram' | 'vk'
export type Topic = 'fitness' | 'tech' | 'beauty' | 'gaming' | 'lifestyle' | 'business' | 'education' | 'travel' | 'food'

export interface ChannelMetrics {
  followers: number
  avg_views: number
  er: number
}

export interface Audience {
  gender: { male: number; female: number }
  age: {
    '13-17': number
    '18-24': number
    '25-34': number
    '35-44': number
    '45+': number
  }
  geo: Array<{ country: string; share: number }>
}

export type FormatName = 'story' | 'post' | 'short' | 'video' | 'telegram_post'
export type Rights = 'standard' | 'whitelist' | 'ad_allowlist'
export type PricingModel = 'fixed' | 'cpm' | 'cpa' | 'cpp'

export interface Format {
  id: string
  channel_id: string
  name: FormatName
  duration_sec?: number
  rights: Rights
  price: {
    value: number
    currency: string
    model: PricingModel
  }
  sla_days: number
}

export interface Channel {
  id: string
  owner_user_id: string
  platforms: Platform[]
  handle: string
  title: string
  description: string
  topics: Topic[]
  metrics: ChannelMetrics
  audience: Audience
  formats: Format[]
  brand_safety: {
    verified: boolean
    last_check_at: string
  }
  rating: {
    score: number
    reviews_count: number
  }
  created_at: string
  updated_at: string
}

export type CampaignGoal = 'sales' | 'installs' | 'awareness' | 'traffic'
export type CampaignStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'disputed'

export interface Campaign {
  id: string
  advertiser_id: string
  name: string
  goal: CampaignGoal
  geo: string[]
  audience: {
    gender: 'any' | 'male' | 'female'
    age: string[]
  }
  budget: {
    value: number
    currency: string
  }
  model: PricingModel
  utm: {
    source: string
    medium: string
    campaign: string
  }
  promo_codes: string[]
  status: CampaignStatus
  integrations: {
    ga4: boolean
    appsflyer: boolean
    shopify: boolean
  }
  created_at: string
  updated_at: string
}

export type PlacementStatus = 'proposal' | 'booked' | 'in_progress' | 'posted' | 'approved' | 'rejected'

export interface Placement {
  id: string
  campaign_id: string
  channel_id: string
  format_id: string
  unit_price: {
    value: number
    currency: string
    model: PricingModel
  }
  deadline_at: string
  post_link?: string
  assets: Array<{
    url: string
    type: 'script' | 'video' | 'image' | 'doc'
  }>
  status: PlacementStatus
  created_at: string
  updated_at: string
}

export type EscrowStatus = 'funded' | 'released' | 'refunded'

export interface Escrow {
  id: string
  deal_id: string
  amount: {
    value: number
    currency: string
  }
  commission_pct: number
  status: EscrowStatus
  docs: Array<{
    type: 'invoice' | 'act'
    url: string
  }>
  created_at: string
  updated_at: string
}

export type AnalyticsEventType = 'impression' | 'click' | 'view' | 'sale'

export interface AnalyticsEvent {
  id: string
  placement_id: string
  ts: string
  type: AnalyticsEventType
  value: number
  attributes: {
    utm_source?: string
    promo?: string
    revenue?: number
  }
}

export interface Case {
  id: string
  client: string
  objective: string
  placements: string[]
  results: {
    impr: number
    clicks: number
    sales: number
    cpa: number
    roi: number
  }
  assets: Array<{
    url: string
    type: 'img' | 'pdf' | 'link'
  }>
  created_at: string
}

// Filter types for catalog
export interface CatalogFilters {
  platforms?: Platform[]
  topics?: Topic[]
  languages?: string[]
  geo?: string[]
  er_min?: number
  er_max?: number
  avg_views_min?: number
  avg_views_max?: number
  followers_min?: number
  followers_max?: number
  price_min?: number
  price_max?: number
  pricing_model?: PricingModel[]
  gender?: 'male' | 'female' | 'any'
  age_ranges?: string[]
  brand_safety?: boolean
  verified?: boolean
}
