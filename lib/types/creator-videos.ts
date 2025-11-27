// Types for creator_videos table

export type VideoStatus = 'generating' | 'ready' | 'failed' | 'published'

export type PublishedPlatform = {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'vk'
  channel_id: string
  post_url?: string
  published_at: string
}

export interface CreatorVideo {
  id: string
  creator_id: string
  
  // Video metadata
  title: string
  description?: string
  prompt: string
  style?: string
  duration?: number
  
  // TurboBoost info
  task_id?: string
  turboboost_video_url?: string
  
  // Local storage
  local_video_url?: string
  thumbnail_url?: string
  
  // Video stats
  file_size?: number
  resolution?: string
  format?: string
  
  // Status
  status: VideoStatus
  error_message?: string
  
  // Publishing
  published_to: PublishedPlatform[]
  scheduled_publish_at?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  generated_at?: string
  
  // Metadata
  tags?: string[]
  is_favorite: boolean
  views: number
  
  // Soft delete
  deleted_at?: string
}

export interface CreateVideoInput {
  creator_id: string
  title: string
  description?: string
  prompt: string
  style?: string
  duration?: number
  task_id?: string
  status?: VideoStatus
}

export interface UpdateVideoInput {
  title?: string
  description?: string
  turboboost_video_url?: string
  local_video_url?: string
  thumbnail_url?: string
  file_size?: number
  resolution?: string
  status?: VideoStatus
  error_message?: string
  generated_at?: string
  tags?: string[]
  is_favorite?: boolean
}

export interface PublishVideoInput {
  platform: PublishedPlatform['platform']
  channel_id: string
  post_url?: string
}

// Filters for video list
export interface VideoFilters {
  status?: VideoStatus
  tags?: string[]
  is_favorite?: boolean
  search?: string // Search in title/description
  date_from?: string
  date_to?: string
}

// Stats for dashboard
export interface VideoStats {
  total: number
  generating: number
  ready: number
  failed: number
  published: number
}
