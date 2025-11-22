# In-App Notifications System

## Описание

Полноценная система внутренних уведомлений AdMarket для информирования пользователей о важных событиях в режиме реального времени.

## Архитектура

### 1. Database Schema (`/supabase/migrations/004_create_notifications_table.sql`)

**Таблица `notifications`:**
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN (
    'placement_accepted',
    'placement_rejected',
    'new_placement_request',
    'content_uploaded',
    'content_approved',
    'content_revision_requested',
    'campaign_completed',
    'payment_received',
    'payment_sent'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  placement_id UUID REFERENCES placements(id),
  channel_id UUID REFERENCES channels(id),
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Индексы:**
- `idx_notifications_user_id` — для быстрого получения уведомлений пользователя
- `idx_notifications_user_unread` — для счётчика непрочитанных
- `idx_notifications_type` — для фильтрации по типу
- `idx_notifications_user_type` — композитный индекс

**RLS Policies:**
- Пользователи видят только свои уведомления
- Пользователи могут обновлять (mark as read) только свои уведомления
- Создание уведомлений только через service role (helper function)

**Helper Function:**
```sql
CREATE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_campaign_id UUID DEFAULT NULL,
  p_placement_id UUID DEFAULT NULL,
  p_channel_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
) RETURNS UUID
```

### 2. TypeScript Types (`/types/index.ts`)

```typescript
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
```

### 3. API Endpoints

**GET /api/notifications**
- Query params: `limit`, `unread_only`, `type`
- Returns: `{ notifications, unread_count, total }`
- Auth: Required

**PATCH /api/notifications/[id]**
- Body: `{ is_read: boolean }`
- Updates `is_read` and `read_at`
- Auth: Required, RLS enforced

**PATCH /api/notifications/mark-all-read**
- Marks all unread notifications as read
- Returns: `{ success, message, count }`
- Auth: Required

### 4. Helper Function (`/lib/notifications/create-notification.ts`)

```typescript
interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  campaignId?: string
  placementId?: string
  channelId?: string
  actionUrl?: string
}

export async function createNotification(params): Promise<string | null>
```

**Usage:**
```typescript
import { createNotification } from '@/lib/notifications/create-notification'

await createNotification({
  userId: advertiser.id,
  type: 'placement_accepted',
  title: 'Заявка принята',
  message: `Блогер ${channel} принял вашу заявку`,
  campaignId: campaign.id,
  placementId: placement.id,
  actionUrl: `/dashboard/campaigns/${campaign.id}`,
})
```

### 5. UI Components

**NotificationBell (`/components/layout/notification-bell.tsx`)**
- Badge counter with unread count
- Dropdown with recent 10 notifications
- Click notification → navigate + mark as read
- "Mark all as read" action
- Auto-fetch on mount and dropdown open
- Click outside to close

**Integration in Header:**
```typescript
// components/layout/header-auth.tsx
import { NotificationBell } from './notification-bell'

<NotificationBell />
```

**Notifications Page (`/app/dashboard/notifications/page.tsx`)**
- Full page with all notifications
- All/Unread filters
- Mark all as read button
- Formatted relative timestamps
- Click-to-navigate
- Empty states

### 6. Notification Types & Config

```typescript
const notificationConfig: Record<NotificationType, {
  icon: string
  color: string
  bgColor: string
}> = {
  placement_accepted: { icon: '✅', color: 'text-green-700', bgColor: 'bg-green-50' },
  placement_rejected: { icon: '❌', color: 'text-red-700', bgColor: 'bg-red-50' },
  new_placement_request: { icon: '🎯', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  content_uploaded: { icon: '📤', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  content_approved: { icon: '✅', color: 'text-green-700', bgColor: 'bg-green-50' },
  content_revision_requested: { icon: '🔄', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  campaign_completed: { icon: '🎉', color: 'text-green-700', bgColor: 'bg-green-50' },
  payment_received: { icon: '💰', color: 'text-green-700', bgColor: 'bg-green-50' },
  payment_sent: { icon: '💸', color: 'text-blue-700', bgColor: 'bg-blue-50' },
}
```

## Integration Points

### 1. Placement Accepted/Rejected

**File:** `/app/api/creator/placements/[id]/route.ts`

```typescript
// After sending email
await createNotification({
  userId: campaignData.advertiser_id,
  type: action === 'accept' ? 'placement_accepted' : 'placement_rejected',
  title: action === 'accept' ? 'Заявка принята' : 'Заявка отклонена',
  message: `Блогер ${placement.channel_title} ${action === 'accept' ? 'принял' : 'отклонил'} вашу заявку по кампании "${campaignData.title}"`,
  campaignId: campaignData.id,
  placementId: id,
  actionUrl: `/dashboard/campaigns/${campaignData.id}`,
})
```

### 2. New Placement Request

**File:** `/app/api/campaigns/route.ts`

```typescript
// After creating placement
await createNotification({
  userId: creator.id,
  type: 'new_placement_request',
  title: 'Новая заявка на размещение',
  message: `Рекламодатель ${advertiserName} отправил вам заявку на размещение по кампании "${insertedCampaign.title}"`,
  campaignId: insertedCampaign.id,
  placementId: placement.id,
  actionUrl: `/dashboard/creator/requests`,
})
```

### 3. Content Uploaded

**File:** `/app/api/creator/placements/[id]/upload/route.ts`

```typescript
// After content upload
await createNotification({
  userId: campaign.advertiser_id,
  type: 'content_uploaded',
  title: 'Контент загружен',
  message: `Блогер ${placement.channel_title} загрузил контент для кампании "${campaign.title}". Ожидает вашей проверки.`,
  campaignId: campaign.id,
  placementId: id,
  actionUrl: `/dashboard/campaigns/${campaign.id}`,
})
```

### 4. Content Approved/Revision Requested

**File:** `/app/api/placements/[id]/review/route.ts`

```typescript
// After content review
await createNotification({
  userId: channel.owner_user_id,
  type: action === 'approve' ? 'content_approved' : 'content_revision_requested',
  title: action === 'approve' ? 'Контент одобрен' : 'Требуются изменения',
  message: action === 'approve'
    ? `Рекламодатель одобрил ваш контент для кампании "${campaign.title}"`
    : `Рекламодатель запросил изменения контента для кампании "${campaign.title}"`,
  campaignId: campaign.id,
  placementId: id,
  actionUrl: `/dashboard/creator/placements/${id}/upload`,
})
```

## User Experience

### Advertiser Notifications

1. **Placement Accepted (✅)** → Navigate to campaign details
2. **Placement Rejected (❌)** → Navigate to campaign details
3. **Content Uploaded (📤)** → Navigate to campaign details for review
4. **Payment Sent (💸)** → Navigate to payments page

### Creator Notifications

1. **New Placement Request (🎯)** → Navigate to requests page
2. **Content Approved (✅)** → Navigate to placement upload page
3. **Content Revision Requested (🔄)** → Navigate to placement upload page
4. **Payment Received (💰)** → Navigate to earnings page

## Date Formatting

Uses `date-fns` for relative time:
```typescript
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

formatDistanceToNow(new Date(notification.created_at), {
  addSuffix: true,
  locale: ru,
})
// Example: "5 минут назад", "2 часа назад", "вчера"
```

## Performance Considerations

1. **Indexes:** Multiple indexes for fast queries
2. **RLS:** Row-level security for data isolation
3. **Pagination:** Limit results to 10 in dropdown, 100 in page
4. **Auto-fetch:** Only when dropdown opens (not polling)
5. **Optimistic UI:** Local state updates before server confirmation

## Future Improvements

- [ ] Real-time notifications with Supabase Realtime subscriptions
- [ ] Push notifications via Web Push API
- [ ] Email digest for unread notifications
- [ ] Notification preferences (enable/disable types)
- [ ] Notification grouping (e.g., "3 new placement requests")
- [ ] Notification sound effects
- [ ] Desktop notifications permission
- [ ] Mark as read on page view (track visibility)
- [ ] Notification retention policy (auto-delete old)

## Testing

### Manual Testing

1. **Create campaign** → Check creator receives "new_placement_request"
2. **Accept placement** → Check advertiser receives "placement_accepted"
3. **Reject placement** → Check advertiser receives "placement_rejected"
4. **Upload content** → Check advertiser receives "content_uploaded"
5. **Approve content** → Check creator receives "content_approved"
6. **Request revision** → Check creator receives "content_revision_requested"

### Database Migration

```bash
# Apply migration locally (if using local Supabase)
supabase db reset

# Or via SQL Editor in Supabase Dashboard
# Run contents of /supabase/migrations/004_create_notifications_table.sql
```

## Dependencies

- **date-fns** (`^3.0.0`) - Relative time formatting
- **lucide-react** - Icons (Bell, CheckCheck, X, etc.)

## Monitoring

Check logs for notification creation:
```
✅ Notification created for advertiser
✅ Notification created for creator
```

Error handling:
```typescript
try {
  await createNotification(...)
  console.log(`✅ Notification created`)
} catch (error) {
  console.error('❌ Error creating notification:', error)
  // Don't fail the request if notification fails
}
```
