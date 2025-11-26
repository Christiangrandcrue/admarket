# Environment Variables для Vercel

## 🚀 Инструкция по deployment на Vercel

### Шаг 1: Import проекта

1. Откройте [vercel.com/new](https://vercel.com/new)
2. Import: `Christiangrandcrue/admarket`
3. Framework Preset: Next.js (определится автоматически)

---

### Шаг 2: Environment Variables

Добавьте следующие переменные окружения:

#### ✅ **Обязательные переменные:**

**Supabase (Database):**
```
NEXT_PUBLIC_SUPABASE_URL
https://visoxfhymssvunyazgsl.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpc294Zmh5bXNzdnVueWF6Z3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDg5NDIsImV4cCI6MjA3OTMyNDk0Mn0.9fykm5X3fLT7sQz366gQqwO9zu_BuhnKh-_WSeaRpzs

SUPABASE_SERVICE_ROLE_KEY
sb_secret_KPRw135ET2w1taWcQCBgRg_-pG6LQRD
```

---

#### 📧 **Email уведомления (Resend):**
```
RESEND_API_KEY
re_a4vKCZUr_CtvLUFSzkCd1CC4km2gzEMJr

RESEND_FROM_EMAIL
AdMarket <noreply@synthnova.me>
```

---

#### 💳 **Stripe платежи:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
pk_test_51SR61NFqMRSVCimKtWAl97mbT6T1qIwuRC3XNZ3rP8waRil66aHOG3MN0ELHBnIp2GRV2wg8VRG0kXacupeNJtKV00tfHlskSK

STRIPE_SECRET_KEY
sk_test_51SR61NFqMRSVCimKWWWAk29OoWAtZQ2zEyKv1bK4h8l6mLm8duB55NmEvPDLI3ak5olTieVJoct0pBGJDqzsWTwW00gnuSgPDk
```

---

### Шаг 3: Deploy

1. Нажмите **Deploy**
2. Дождитесь завершения (2-3 минуты)
3. Vercel автоматически даст URL: `https://admarket-xxx.vercel.app`

---

### Шаг 4: Добавьте Custom Domain

1. Откройте проект на Vercel
2. **Settings** → **Domains**
3. Добавьте: `ads.synthnova.me`
4. Vercel автоматически:
   - ✅ Найдёт DNS записи
   - ✅ Выдаст SSL сертификат
   - ✅ Настроит HTTPS редирект

**Время настройки SSL:** 5-10 минут

---

## 🔒 Security Notes

- ✅ Все переменные добавляются в Vercel Dashboard
- ✅ `.env.local` в `.gitignore` (не попадает в git)
- ✅ Production и Preview окружения можно разделить

---

## 🎯 После deployment

Ваш сайт будет доступен:
```
Production:  https://ads.synthnova.me
Vercel URL:  https://admarket.vercel.app
```

Со всеми функциями:
- ✅ Analytics Dashboard с графиками
- ✅ Reviews & Ratings
- ✅ Payments & Wallet  
- ✅ Email notifications
- ✅ Stripe payments
- ✅ SSL/HTTPS

---

## 🐛 Troubleshooting

**Build fails:**
```bash
# Проверьте что все переменные добавлены
# Проверьте логи в Vercel Dashboard
```

**500 Error на сайте:**
```bash
# Проверьте что Supabase ключи правильные
# Проверьте что база данных доступна
```

**Email не отправляются:**
```bash
# Проверьте RESEND_API_KEY
# Проверьте RESEND_FROM_EMAIL
```

---

## 📞 Поддержка

- GitHub: [Issues](https://github.com/Christiangrandcrue/admarket/issues)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)

---

**Последнее обновление:** 26 ноября 2025  
**Статус:** Ready for Production ✅
