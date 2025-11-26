# Deployment Guide — AdMarket

Руководство по развёртыванию проекта AdMarket на различных платформах.

## 📋 Содержание

1. [Требования](#требования)
2. [Настройка окружения](#настройка-окружения)
3. [Deployment на Vercel](#deployment-на-vercel)
4. [Deployment на Netlify](#deployment-на-netlify)
5. [Deployment на Railway](#deployment-на-railway)
6. [Настройка Supabase](#настройка-supabase)
7. [Настройка Email (Resend)](#настройка-email-resend)
8. [CI/CD Pipeline](#cicd-pipeline)

---

## 🔧 Требования

- Node.js 20+
- npm или pnpm
- Git
- Аккаунт на платформе развёртывания (Vercel/Netlify/Railway)
- Supabase проект
- (Опционально) Resend API key для email уведомлений

---

## ⚙️ Настройка окружения

### 1. Переменные окружения

Создайте файл `.env.local` (для локальной разработки) или настройте переменные в dashboard платформы:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Email Notifications (Resend)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=AdMarket <noreply@yourdomain.com>

# Stripe (если используется)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. База данных (Supabase)

**Применить SQL миграции:**

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите проект
3. Перейдите в **SQL Editor**
4. Выполните по порядку:
   - `supabase/schema.sql` — основная схема
   - `supabase_schema_reviews.sql` — система отзывов
   - `supabase_schema_payments.sql` — платежи и кошелёк
   - Все миграции из `supabase/migrations/`

**Настроить Row Level Security (RLS):**

Все политики уже включены в SQL файлы. Проверьте что RLS активен для всех таблиц.

---

## 🚀 Deployment на Vercel

**Рекомендуется для Next.js проектов**

### Метод 1: Через Vercel Dashboard

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите **New Project**
3. Импортируйте GitHub репозиторий: `Christiangrandcrue/admarket`
4. **Framework Preset**: Next.js (автоматически определится)
5. **Build Command**: `npm run build` (по умолчанию)
6. **Output Directory**: `.next` (по умолчанию)
7. Добавьте **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
8. Нажмите **Deploy**

### Метод 2: Через Vercel CLI

```bash
# Установить Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

**Добавить переменные окружения:**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add RESEND_API_KEY production
```

**Custom Domain:**

```bash
vercel domains add yourdomain.com
```

---

## 🌐 Deployment на Netlify

### Через Netlify Dashboard

1. Перейдите на [netlify.com](https://netlify.com)
2. Нажмите **Add new site** → **Import an existing project**
3. Выберите GitHub и репозиторий `Christiangrandcrue/admarket`
4. **Build command**: `npm run build`
5. **Publish directory**: `.next`
6. Добавьте **Environment variables**
7. Нажмите **Deploy site**

### Netlify CLI

```bash
npm i -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**⚠️ Важно для Next.js на Netlify:**

Добавьте `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 🚂 Deployment на Railway

**Подходит если нужна база данных и backend в одном месте**

### Через Railway Dashboard

1. Перейдите на [railway.app](https://railway.app)
2. Нажмите **New Project** → **Deploy from GitHub repo**
3. Выберите `Christiangrandcrue/admarket`
4. Railway автоматически определит Next.js
5. Добавьте **Variables** в Settings
6. Deploy произойдёт автоматически

### Railway CLI

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

---

## 🗄️ Настройка Supabase

### 1. Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Выберите регион (ближайший к пользователям)
4. Запомните Database Password

### 2. Применение схемы

В **SQL Editor** выполните:

```sql
-- 1. Основная схема
-- Скопируйте содержимое supabase/schema.sql и выполните

-- 2. Система отзывов
-- Скопируйте содержимое supabase_schema_reviews.sql и выполните

-- 3. Платежи и кошелёк
-- Скопируйте содержимое supabase_schema_payments.sql и выполните

-- 4. Миграции
-- Выполните все файлы из supabase/migrations/ по порядку
```

### 3. Настройка аутентификации

**Email Auth:**
- Authentication → Providers → Email → Enable

**Google OAuth (опционально):**
- Создайте OAuth credentials в [Google Cloud Console](https://console.cloud.google.com)
- Authentication → Providers → Google → Enable
- Добавьте Client ID и Client Secret

### 4. Storage (опционально)

Если планируете хранить файлы:

```sql
-- Создать bucket для загрузок контента
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-uploads', 'content-uploads', false);
```

### 5. Получение API ключей

Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key

---

## 📧 Настройка Email (Resend)

### 1. Регистрация

1. Перейдите на [resend.com](https://resend.com)
2. Создайте аккаунт
3. Верифицируйте email

### 2. Добавление домена

**Для production:**
1. API Keys → Domains → Add Domain
2. Добавьте DNS записи (MX, TXT, CNAME)
3. Дождитесь верификации

**Для разработки:**
- Используйте `onboarding@resend.dev` (без верификации)

### 3. Создание API Key

1. API Keys → Create API Key
2. Скопируйте ключ (показывается один раз)
3. Добавьте в переменные окружения:
   ```
   RESEND_API_KEY=re_your_key_here
   RESEND_FROM_EMAIL=AdMarket <noreply@yourdomain.com>
   ```

### 4. Тестирование

```bash
# В локальной разработке
npm run dev

# Зарегистрируйтесь на сайте
# Проверьте почту — должен прийти welcome email
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests (если есть)
      run: npm test
    
    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

**Настройка secrets в GitHub:**
1. Repository → Settings → Secrets and variables → Actions
2. Добавьте:
   - `VERCEL_TOKEN` — из Vercel Settings → Tokens
   - `VERCEL_ORG_ID` — из Vercel project settings
   - `VERCEL_PROJECT_ID` — из Vercel project settings
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🐛 Troubleshooting

### Build fails с "Module not found"

```bash
# Очистить кеш и переустановить зависимости
rm -rf node_modules .next
npm install
npm run build
```

### Supabase connection errors

- Проверьте что URL и ключи правильные
- Убедитесь что RLS политики настроены
- Проверьте что таблицы созданы

### Email не отправляются

- Проверьте `RESEND_API_KEY` в переменных окружения
- Верифицируйте домен в Resend dashboard
- Для development используйте `onboarding@resend.dev`

### 404 на страницах после deploy

- Убедитесь что `.next` директория включена в build
- Проверьте что `next.config.js` не содержит ошибок
- Проверьте логи deployment

---

## 📊 Мониторинг

### Vercel Analytics

Автоматически включён для всех Vercel проектов. Просматривайте в dashboard.

### Supabase Logs

Database → Logs:
- API logs
- Database logs
- Auth logs

### Error Tracking (опционально)

Добавьте Sentry:

```bash
npm install @sentry/nextjs
```

---

## 🔐 Security Checklist

- [ ] Все API ключи в переменных окружения
- [ ] RLS policies активированы в Supabase
- [ ] CORS настроен правильно
- [ ] Rate limiting настроен (через Vercel Edge Config)
- [ ] SSL сертификаты настроены (автоматически на Vercel)
- [ ] Environment variables не в git
- [ ] `.env.local` в `.gitignore`

---

## 📚 Полезные ссылки

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**Последнее обновление**: 26 ноября 2025  
**Статус**: Production Ready ✅

Для вопросов и поддержки: [GitHub Issues](https://github.com/Christiangrandcrue/admarket/issues)
