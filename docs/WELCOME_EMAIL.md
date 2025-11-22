# Welcome Email System

## Описание

Система автоматической отправки приветственных писем новым пользователям AdMarket при регистрации.

## Компоненты

### 1. Email Templates (`/lib/email/templates.ts`)

**welcomeAdvertiserEmail()**
- **Props**: userName, userEmail, dashboardUrl
- **Subject**: 🎉 Добро пожаловать в AdMarket, {userName}!
- **Badge**: 🎉 (yellow background #fef3c7)
- **Content**:
  - Приветствие и роль (рекламодатель)
  - Email подтверждение
  - 🚀 Как начать работу (5 шагов)
  - CTA: "Создать первую кампанию"
  - 💡 Преимущества AdMarket
- **Design**: Purple gradient header, responsive 600px, HTML + plain text

**welcomeCreatorEmail()**
- **Props**: userName, userEmail, dashboardUrl
- **Subject**: 👋 Добро пожаловать в AdMarket, {userName}!
- **Badge**: 👋 (light blue background #e0e7ff)
- **Content**:
  - Приветствие и роль (блогер/креатор)
  - Email подтверждение
  - 🎬 Как начать зарабатывать (5 шагов)
  - CTA: "Добавить первый канал"
  - 💰 Преимущества AdMarket
- **Design**: Purple gradient header, responsive 600px, HTML + plain text

### 2. API Endpoint (`/app/api/auth/welcome/route.ts`)

**POST /api/auth/welcome**
- **Auth**: Required (Supabase Auth)
- **Logic**:
  1. Get current user from Supabase
  2. Get user profile with role
  3. Prepare email data (userName, userEmail, dashboardUrl)
  4. Select template based on role (advertiser/creator)
  5. Send email via `sendEmail()` from `/lib/email/resend.ts`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Welcome email sent successfully",
    "provider": "console" | "resend",
    "emailId": "..."
  }
  ```

### 3. Integration (`/app/auth/register/page.tsx`)

**Registration Flow**:
1. User fills registration form (email, password, fullName, role)
2. Supabase Auth signup
3. Create user profile in `users` table
4. **Fire-and-forget welcome email**:
   ```typescript
   try {
     await fetch('/api/auth/welcome', { method: 'POST' })
   } catch {
     console.warn('Welcome email failed (non-blocking)')
   }
   ```
5. Redirect to `/auth/verify-email`

**Important**: Welcome email не блокирует регистрацию - отправка асинхронная.

## Graceful Fallback

Если `RESEND_API_KEY` не настроен:
- Email логируется в console: `📧 Email notification (RESEND_API_KEY not set)`
- Приложение продолжает работать
- Provider: `console` вместо `resend`

## Environment Variables

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=AdMarket <noreply@yourdomain.com>
```

## Тестирование

### Локально (без API key)
1. Оставить `RESEND_API_KEY` пустым
2. Зарегистрировать пользователя
3. Проверить консоль сервера:
   ```
   📧 Email notification (RESEND_API_KEY not set):
   to: user@example.com
   subject: 🎉 Добро пожаловать в AdMarket, John Doe!
   preview: Добро пожаловать в AdMarket, John Doe!...
   ```

### С Resend API
1. Настроить `RESEND_API_KEY` в `.env.local`
2. Зарегистрировать пользователя
3. Проверить email в почте
4. Проверить Dashboard Resend: https://resend.com/logs

## Design System

### Color Palette
- **Purple Gradient**: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)
- **Advertiser Badge**: #fef3c7 (yellow)
- **Creator Badge**: #e0e7ff (light blue)
- **Success**: #f0fdf4 (green) for advertiser, #fef3c7 (yellow) for creator
- **Benefits**: #eff6ff (blue) for advertiser, #f0fdf4 (green) for creator

### Layout
- **Width**: 600px (max-width for emails)
- **Border Radius**: 12px (main container), 8px (inner blocks)
- **Padding**: 40px (container), 24px (content blocks)
- **Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### Components
- **Header**: Purple gradient with logo
- **Badge**: 80px circular badge with emoji (centered)
- **CTA Button**: Purple background #7c3aed, 14px padding vertical, 32px horizontal
- **Info Blocks**: Colored backgrounds with lists and icons
- **Footer**: Gray background #f9fafb with support email

## Future Improvements

- [ ] Localization (i18n) для multi-language support
- [ ] Email preferences (opt-out from welcome emails)
- [ ] A/B testing different CTA текстов
- [ ] Track email open rates via Resend webhooks
- [ ] Персонализация контента на основе UTM source
