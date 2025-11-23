# 🚀 Deployment Guide — AdMarket

## ⚠️ Текущая ситуация

**Sandbox environment не подходит для Next.js 16 dev mode:**
- RAM: 987 MB (требуется 1.5-2 GB)
- Available: 20-50 MB (критично мало)
- Результат: Freezing, белая страница, navigation не работает

**Решение: Deploy на production платформу с достаточными ресурсами**

---

## 🎯 Рекомендованный путь: Vercel (самый простой)

### Вариант A: Deploy через Vercel CLI (если GitHub настроен)

**Требования:**
- GitHub repository должен быть создан
- Код должен быть pushed

**Шаги:**

1. **Setup GitHub** (если не настроен):
   - Перейдите в #github tab
   - Авторизуйте GitHub App
   - Выберите существующий репозиторий или создайте новый

2. **Push код на GitHub**:
   ```bash
   cd /home/user/webapp
   
   # Если remote не настроен
   git remote add origin https://github.com/YOUR_USERNAME/admarket.git
   
   # Push
   git push -u origin main
   ```

3. **Deploy на Vercel**:
   - Откройте https://vercel.com/new
   - Подключите GitHub репозиторий
   - Vercel автоматически определит Next.js
   - Нажмите "Deploy"
   - Готово за 2-3 минуты! ✅

**Environment Variables для Vercel:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key (optional)
```

---

### Вариант B: Deploy через Vercel CLI (без GitHub)

**Требования:**
- Только Vercel аккаунт

**Шаги:**

1. **Установить Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd /home/user/webapp
   vercel --prod
   ```

4. **Добавить environment variables** через Vercel dashboard

---

## 🌐 Альтернатива: Cloudflare Pages

### Требования:
- Cloudflare API Token
- Настроен через Deploy tab в sandbox

### Шаги:

1. **Настроить Cloudflare API Token**:
   - Перейдите в Deploy tab
   - Следуйте инструкциям для создания API token
   - Сохраните token

2. **Build проект** (требуется достаточно памяти):
   ```bash
   cd /home/user/webapp
   
   # Увеличить Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=800" npm run build
   ```

3. **Deploy на Cloudflare Pages**:
   ```bash
   # Создать проект
   npx wrangler pages project create admarket \
     --production-branch main \
     --compatibility-date 2024-01-01
   
   # Deploy
   npx wrangler pages deploy .next/standalone \
     --project-name admarket
   ```

4. **Настроить Environment Variables** через Cloudflare dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`

---

## 📋 После деплоя

### 1. Применить Supabase Realtime Migration

**Откройте Supabase SQL Editor:**
https://supabase.com/dashboard/project/YOUR_PROJECT/sql

**Выполните SQL:**
```sql
-- Enable realtime publication for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Grant SELECT permission
GRANT SELECT ON public.notifications TO authenticated;

-- Comment
COMMENT ON TABLE public.notifications IS 'In-app notifications with Realtime subscriptions enabled';
```

### 2. Проверка Real-time Notifications

**Откройте два браузера/вкладки:**

1. **Вкладка 1**: Войдите как **Advertiser**
2. **Вкладка 2**: Войдите как **Creator**
3. В Вкладке 2: Accept placement request
4. В Вкладке 1: Уведомление появится **мгновенно** ⚡

**Console должен показать:**
```
📡 Realtime subscription status: SUBSCRIBED
🔔 New notification received: {...}
```

---

## 🎊 Expected Results

После успешного деплоя:

### ✅ Что будет работать:

- **Homepage** — Hero, Social Proof, Features
- **Catalog** — Фильтры, поиск, карточки каналов
- **Campaign Wizard** — 6-шаговый мастер создания кампании
- **Creator Dashboard** — Входящие заявки, активные размещения
- **Advertiser Dashboard** — Список кампаний, аналитика
- **Notifications** — Badge counter, dropdown, полная страница
- **Real-time Updates** — Мгновенные уведомления (после миграции)
- **Email Notifications** — Welcome emails, placement updates

### 📊 Performance на Production:

| Metric | Sandbox (Dev) | Production (Vercel) |
|--------|---------------|---------------------|
| Load Time | 5-10s (freeze) | < 1s |
| Memory | 22 MB available | 1+ GB |
| Navigation | ❌ Не работает | ✅ Instant |
| Real-time | ⚠️ Код есть | ✅ Full support |

---

## 🔧 Troubleshooting

### Build fails due to memory

**Проблема**: `JavaScript heap out of memory`

**Решение**:
```bash
# Увеличить memory limit
NODE_OPTIONS="--max-old-space-size=1024" npm run build

# Или использовать swap (Linux)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Environment variables not working

**Проблема**: API calls fail with 401/403

**Решение**:
1. Проверьте Vercel/Cloudflare dashboard → Settings → Environment Variables
2. Убедитесь, что все переменные добавлены:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY` (optional)
3. Redeploy после добавления переменных

### Real-time notifications not working

**Проблема**: Новые уведомления не появляются мгновенно

**Решение**:
1. Проверьте, что миграция 005 применена в Supabase
2. Проверьте Console: должен быть `SUBSCRIBED` status
3. Убедитесь, что WebSocket не блокируется firewall

---

## 📞 Next Steps

**Выберите путь:**

1. ✅ **Vercel** (recommended) — самый простой, 5 минут
2. ⚙️ **Cloudflare Pages** — требует больше настроек
3. 📱 **GitHub + Vercel UI** — deploy через веб-интерфейс

**Нужна помощь?**
- Vercel docs: https://vercel.com/docs
- Cloudflare Pages docs: https://developers.cloudflare.com/pages
- Next.js deployment: https://nextjs.org/docs/deployment

---

**Версия**: 1.0.0  
**Дата**: 23 ноября 2025  
**Статус**: Ready to deploy 🚀
