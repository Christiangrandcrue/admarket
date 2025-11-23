# Admin Panel - Complete Guide

## Overview

Полная система модерации и управления платформой AdMarket.

## Access

**URL**: `/dashboard/admin`

**Requirements**:
- User role must be `'admin'`
- Account status must be `'active'`

## Features

### 1. Dashboard (`/dashboard/admin`)

**Overview Cards**:
- 👥 Users (total, advertisers, creators, admins, active, suspended)
- 🏢 Channels (total, pending, approved, rejected, flagged)
- 📢 Campaigns (total, active, pending, completed)
- 💰 Platform Revenue (GMV, platform fees)

**Pending Reviews**:
- Channel verifications count
- Campaign approvals count
- Flagged content count

**Quick Links**:
- Navigate to all admin sections

---

### 2. Channel Moderation (`/dashboard/admin/channels`)

**Features**:
- ✅ List all channels with creator info
- 🔍 Search by channel name, handle, creator
- 🎯 Filter by status: pending/approved/rejected/flagged
- 📊 View metrics: followers, avg views, ER
- ⚡ Actions:
  - **Approve** - Verify channel, make visible in catalog
  - **Reject** - Decline channel with reason
  - **Flag** - Mark for review

**Workflow**:
1. Creator submits channel → status = `pending`
2. Admin reviews metrics, content quality
3. Admin approves or rejects with notes
4. Creator receives notification

---

### 3. Campaign Moderation (`/dashboard/admin/campaigns`)

**Features**:
- 📋 List all campaigns with advertiser info
- 🔍 Search by title, description, advertiser
- 🎯 Filter by moderation status
- 💰 View budget, dates, payment status
- ⚡ Actions:
  - **Approve** - Allow campaign to go live
  - **Reject** - Block campaign with reason
  - **Flag** - Mark for further review

**Use Cases**:
- Review campaign briefs for policy violations
- Check for inappropriate content requirements
- Verify budget legitimacy
- Flag suspicious campaigns

---

### 4. User Management (`/dashboard/admin/users`)

**Features**:
- 👥 List all users (advertisers, creators, admins)
- 🔍 Search by name or email
- 🎯 Filter by role (advertiser/creator/admin)
- 🎯 Filter by status (active/suspended/banned)
- ✅ View email verification & KYC status
- ⚡ Actions:
  - **Suspend** (30 days) - Temporary restriction with reason
  - **Ban** (permanent) - Block user with reason
  - **Activate** - Restore suspended/banned user

**Suspension vs Ban**:
- **Suspend**: Temporary (30 days), reversible, for minor violations
- **Ban**: Permanent, for serious violations (fraud, harassment)

**Workflow**:
1. Detect policy violation
2. Admin suspends/bans with detailed reason
3. User cannot login/access platform
4. Admin can activate later if resolved

---

### 5. Financial Reports (`/dashboard/admin/financials`)

**Metrics**:
- 💵 **GMV** (Gross Merchandise Value) - Total campaign budgets
- 💰 **Platform Revenue** - 10% commission earned
- 💸 **Creator Payouts** - Total paid to creators
- ⏳ **Pending Payouts** - Awaiting release
- 📊 **Average Order Value** - Per campaign
- 📈 **Growth** - vs previous period (%)

**Transaction Stats**:
- Total transactions
- Successful payments
- Failed payments
- Refunds

**Recent Transactions**:
- Last 20 transactions with details
- Type: charge/payout/refund
- Status: succeeded/pending/failed
- User, amount, date

**Date Ranges**:
- Last 7 days
- Last 30 days (default)
- Last 90 days
- Last year

**Export** (placeholder):
- CSV/PDF export planned

---

### 6. Flags & Reports (`/dashboard/admin/flags`)

**Purpose**: User-generated content reports

**Report Types** (from schema):
- `inappropriate_content`
- `spam`
- `fraud`
- `copyright`
- `harassment`
- `misinformation`
- `other`

**Status Flow**:
- `pending` → New report
- `reviewing` → Under investigation
- `resolved` → Action taken
- `dismissed` → No action needed

**Currently**: Placeholder (no reports yet)

**Future**:
- List all flags
- Filter by entity type (channel/campaign/user/content)
- Assign to admin for review
- Mark resolved with resolution notes

---

### 7. Audit Log (`/dashboard/admin/audit`)

**Purpose**: Complete history of admin actions

**Logged Actions**:
- `moderate_channel_approve/reject/flag`
- `moderate_campaign_approve/reject/flag`
- `user_suspend/ban/activate`
- `update_setting`

**Data Captured**:
- Action type
- Entity type (channel/campaign/user/settings)
- Entity ID
- Admin who performed action
- Old values
- New values
- Notes/reason
- Timestamp

**Features**:
- 🔍 Search by action, admin, entity
- 📅 Sorted by date (most recent first)
- 📊 Shows last 100 entries
- 🔒 Admin-only access (RLS enforced)

---

## Database Schema

### Tables Added (Migration 008)

**`flags`**:
```sql
- id UUID
- entity_type TEXT (channel/campaign/placement/user/content)
- entity_id UUID
- reporter_id UUID → users
- reason TEXT (inappropriate_content/spam/fraud/...)
- description TEXT
- status TEXT (pending/reviewing/resolved/dismissed)
- resolved_by UUID → users
- resolved_at TIMESTAMPTZ
- resolution_notes TEXT
```

**`audit_logs`**:
```sql
- id UUID
- admin_id UUID → users
- action TEXT (e.g., 'moderate_channel_approve')
- entity_type TEXT
- entity_id UUID
- old_values JSONB
- new_values JSONB
- notes TEXT
- ip_address TEXT
- user_agent TEXT
- created_at TIMESTAMPTZ
```

**`platform_settings`**:
```sql
- id UUID
- key TEXT UNIQUE (e.g., 'platform_fee_percentage')
- value JSONB
- description TEXT
- updated_by UUID → users
- updated_at TIMESTAMPTZ
```

### Fields Added to Existing Tables

**`channels`**:
```sql
+ moderation_status TEXT (pending/approved/rejected/flagged)
+ moderation_notes TEXT
+ moderated_by UUID → users
+ moderated_at TIMESTAMPTZ
+ is_featured BOOLEAN
+ featured_at TIMESTAMPTZ
```

**`campaigns`**:
```sql
+ moderation_status TEXT (pending/approved/rejected/flagged)
+ moderation_notes TEXT
+ moderated_by UUID → users
+ moderated_at TIMESTAMPTZ
+ is_premium BOOLEAN
```

**`users`**:
```sql
+ status TEXT (active/suspended/banned/deleted)
+ suspended_until TIMESTAMPTZ
+ suspension_reason TEXT
+ banned_at TIMESTAMPTZ
+ ban_reason TEXT
+ banned_by UUID → users
+ email_verified BOOLEAN
+ last_login_at TIMESTAMPTZ
```

---

## API Routes

### Dashboard
```
GET /api/admin/dashboard
```
Returns: platform statistics (users, channels, campaigns, financials, flags)

### Channels
```
GET /api/admin/channels
```
Returns: all channels with creator info

```
PATCH /api/admin/channels/[id]/moderate
Body: { action: 'approve' | 'reject' | 'flag', notes?: string }
```
Returns: updated channel

### Campaigns
```
GET /api/admin/campaigns
```
Returns: all campaigns with advertiser info

```
PATCH /api/admin/campaigns/[id]/moderate
Body: { action: 'approve' | 'reject' | 'flag', notes?: string }
```
Returns: updated campaign

### Users
```
GET /api/admin/users
```
Returns: all users

```
PATCH /api/admin/users/[id]/action
Body: { action: 'suspend' | 'ban' | 'activate', reason?: string }
```
Returns: updated user

### Financials
```
GET /api/admin/financials?days=30
```
Query params:
- `days` - Number of days to analyze (default: 30)

Returns: GMV, revenue, payouts, growth metrics, transactions

### Audit Log
```
GET /api/admin/audit
```
Returns: last 100 audit log entries

---

## Security

### Role-Based Access Control

**Middleware**: `requireAdmin()`
```typescript
// Checks:
1. User is authenticated
2. User.role === 'admin'
3. User.status === 'active'

// Returns:
- null (no error, proceed)
- NextResponse with 401/403 error
```

### Row Level Security (RLS)

**Flags**:
- Users can create flags (reports)
- Users can view own flags
- Admins can view all flags
- Admins can update flags

**Audit Logs**:
- Only admins can view

**Platform Settings**:
- Anyone can view
- Only admins can update

### Audit Logging

**All admin actions are logged**:
```typescript
await logAdminAction({
  action: 'moderate_channel_approve',
  entityType: 'channel',
  entityId: '...',
  oldValues: { moderation_status: 'pending' },
  newValues: { moderation_status: 'approved' },
  notes: 'Verified metrics and content quality',
})
```

**Logged automatically**:
- Who performed action (admin_id)
- What was changed (old/new values)
- Why (notes/reason)
- When (timestamp)

---

## Setup Instructions

### 1. Apply Migration 008

```bash
# In Supabase Dashboard → SQL Editor
# Execute: supabase/migrations/008_add_admin_features.sql
```

### 2. Create Admin User

**In Supabase Dashboard**:
```sql
-- Update existing user to admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

**Or create new admin**:
```sql
-- First create auth user in Supabase Auth UI
-- Then update role:
UPDATE public.users 
SET role = 'admin' 
WHERE id = 'user-id-from-auth';
```

### 3. Access Admin Panel

Navigate to: `https://yourdomain.com/dashboard/admin`

**If not admin**:
- 403 Forbidden error
- Redirected to regular dashboard

---

## Usage Examples

### Example 1: Approve Channel

1. Go to `/dashboard/admin/channels`
2. Find channel with status "pending"
3. Review:
   - Creator info
   - Channel metrics (followers, ER)
   - Content topics
   - Platform
4. Click "Approve"
5. Channel becomes visible in catalog
6. Creator receives notification
7. Action logged in audit log

### Example 2: Suspend User

1. Go to `/dashboard/admin/users`
2. Search for user by name/email
3. Click "Suspend" icon
4. Enter reason: "Spam campaigns detected"
5. User status → `suspended` for 30 days
6. User cannot login
7. Can be activated early if issue resolved

### Example 3: Review Financials

1. Go to `/dashboard/admin/financials`
2. Select date range: "Last 30 days"
3. View:
   - GMV: ₽5,250,000
   - Revenue: ₽525,000 (10%)
   - Growth: +15.3% vs prev period
4. Scroll to recent transactions
5. Export report (CSV) - planned feature

---

## Best Practices

### Channel Moderation

✅ **DO**:
- Verify follower counts against public profiles
- Check for spam/bot followers
- Review content quality and brand safety
- Provide clear rejection reasons

❌ **DON'T**:
- Auto-approve without review
- Reject without explanation
- Approve fake/bot accounts

### Campaign Moderation

✅ **DO**:
- Review campaign briefs for policy violations
- Check for adult/illegal content
- Verify budget amounts are realistic
- Flag suspicious patterns

❌ **DON'T**:
- Approve campaigns with inappropriate content
- Allow extremely low budgets (spam)
- Ignore red flags

### User Management

✅ **DO**:
- Document suspension/ban reasons clearly
- Give warnings before bans
- Review appeals fairly
- Check audit log before action

❌ **DON'T**:
- Ban without investigation
- Suspend without reason
- Ignore repeated violations

---

## Troubleshooting

### Can't access admin panel

**Error**: 403 Forbidden

**Solution**:
1. Check user role in Supabase:
   ```sql
   SELECT id, email, role, status 
   FROM public.users 
   WHERE email = 'your-email';
   ```
2. Ensure role = 'admin'
3. Ensure status = 'active'

### Actions not logged

**Issue**: Audit log empty after actions

**Solution**:
1. Check migration 008 applied
2. Verify `log_admin_action()` function exists
3. Check browser console for errors

### Stats not showing

**Issue**: Dashboard shows 0 for all metrics

**Solution**:
1. Check migration 008 added required fields
2. Verify data exists in tables
3. Check API route `/api/admin/dashboard`

---

## Future Enhancements

**Planned Features**:
- [ ] Bulk actions (approve multiple channels)
- [ ] Advanced filters (date range, custom queries)
- [ ] Export functionality (CSV, PDF)
- [ ] Email notifications for admins
- [ ] Two-factor authentication for admin access
- [ ] IP whitelist for admin panel
- [ ] Activity heatmaps
- [ ] Custom moderation rules
- [ ] Automated moderation (AI-assisted)
- [ ] Role delegation (moderator role)

---

**Version**: 1.0  
**Date**: 2025-11-23  
**Status**: ✅ Production Ready
