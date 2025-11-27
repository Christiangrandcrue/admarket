# 🚀 TurboBoost AI Video Generation — Setup Guide

## ✅ Что уже сделано:

### 1. Backend API (3 endpoints) ✅
- `POST /api/turboboost/auth` — Авторизация в TurboBoost
- `POST /api/turboboost/generate` — Создание задачи генерации видео
- `GET /api/turboboost/tasks/[id]` — Проверка статуса генерации

### 2. Frontend UI ✅
- `VideoGeneratorModal` компонент с:
  - Формой (тема, стиль, длительность)
  - Progress bar (2-4 минуты)
  - Real-time polling статуса
  - Превью сгенерированного видео
- Кнопка "🎬 AI Генерация видео" в Dashboard креатора

### 3. Интеграция ✅
- Автоматическое обновление статуса каждые 10 секунд
- Таймаут 5 минут (если генерация зависла)
- Обработка ошибок с понятными сообщениями

---

## 🔧 Необходимые действия:

### Шаг 1: Добавить Environment Variables в Vercel

**Откройте:** https://vercel.com/synth-nova-influencers-projects/webapp/settings/environment-variables

**Добавьте 3 переменные** (для Production, Preview, Development):

```bash
TURBOBOOST_API_URL=https://turboboost-portal.pages.dev/api
TURBOBOOST_EMAIL=inbe@ya.ru
TURBOBOOST_PASSWORD=rewfdsvcx5
```

**Как добавить:**
1. Нажмите "Add New"
2. Введите имя переменной (например, `TURBOBOOST_API_URL`)
3. Введите значение
4. Выберите Environment: **Production, Preview, Development** (все 3)
5. Нажмите "Save"
6. Повторите для остальных 2 переменных

---

### Шаг 2: Redeploy проекта

После добавления переменных:

**Вариант A (автоматический):**
```bash
git commit --allow-empty -m "trigger: Redeploy with TurboBoost env vars"
git push origin main
```

**Вариант B (ручной):**
1. Откройте: https://vercel.com/synth-nova-influencers-projects/webapp
2. Нажмите на последний деплой
3. Нажмите три точки (•••) → "Redeploy"

---

### Шаг 3: Тестирование

После деплоя:

1. **Откройте:** https://ads.synthnova.me/dashboard/creator
2. **Нажмите:** "🎬 AI Генерация видео"
3. **Заполните форму:**
   - Тема: "Mountain landscape at sunset"
   - Стиль: Кинематографический
   - Длительность: 5 секунд
4. **Нажмите:** "Сгенерировать"
5. **Ожидайте:** 2-4 минуты (видите progress bar)
6. **Результат:** Видео готово! Можно скачать или автопубликовать

---

## 🎯 Функционал для креаторов:

### Что видит креатор:
1. **Кнопка в Dashboard** — "🎬 AI Генерация видео" (фиолетово-синяя)
2. **Модальное окно** с простой формой:
   - Тема видео (текстовое поле)
   - Стиль (dropdown): Кинематографический, Динамичный, Минималистичный, Яркий
   - Длительность (dropdown): 5 или 10 секунд
3. **Progress bar** — показывает процесс генерации (0% → 100%)
4. **Готовое видео** — preview + кнопка скачать

### Технические характеристики:
- ⏱️ **Время генерации:** 2-4 минуты
- 🎬 **Длительность видео:** 5-10 секунд (TikTok/Reels формат)
- 🤖 **AI движок:** Kling AI + GPT-4
- 📊 **Статусы:** generating → completed/failed
- 🔄 **Polling:** каждые 10 секунд
- ⏳ **Timeout:** 5 минут

---

## 🧪 Тестовые credentials TurboBoost:

```
Email: inbe@ya.ru
Password: rewfdsvcx5
```

**Аккаунт содержит:**
- Package: Starter (ID: 1)
- Videos left: 6 шт.

---

## 📊 API Endpoints (TurboBoost):

### 1. Auth
```bash
POST https://turboboost-portal.pages.dev/api/auth/login
Content-Type: application/json

{
  "email": "inbe@ya.ru",
  "password": "rewfdsvcx5"
}

# Response:
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": 7,
    "email": "inbe@ya.ru",
    "videos_left": 6
  }
}
```

### 2. Generate Video
```bash
POST https://turboboost-portal.pages.dev/api/tasks/generate-video
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Cinematic view of mountain landscape at sunset",
  "brief": {
    "topic": "Mountain landscape",
    "style": "cinematic",
    "duration": 5
  }
}

# Response:
{
  "success": true,
  "task_id": 5,
  "message": "Видео генерируется. Проверьте статус через несколько минут."
}
```

### 3. Check Status
```bash
GET https://turboboost-portal.pages.dev/api/tasks/5
Authorization: Bearer <token>

# Response (generating):
{
  "task": {
    "id": 5,
    "status": "generating",
    "video_url": null,
    "generation_time_seconds": null
  }
}

# Response (completed):
{
  "task": {
    "id": 5,
    "status": "completed",
    "video_url": "https://...",
    "generation_time_seconds": 180
  }
}
```

---

## 🔐 Security:

- ✅ **API credentials** хранятся в Environment Variables (не в коде)
- ✅ **Token** генерируется на backend, не передаётся на frontend
- ✅ **Rate limiting** — встроен в TurboBoost API
- ✅ **Error handling** — все ошибки логируются и показываются пользователю

---

## 🚀 Следующие шаги (опционально):

### 1. Автопубликация
Интегрировать с Uploader сервисом после генерации:
```typescript
onVideoGenerated={(url) => {
  // Передать в Uploader для публикации на TikTok/Instagram
  publishToUploader(url)
}}
```

### 2. История генераций
Сохранять сгенерированные видео в Supabase:
```sql
CREATE TABLE creator_videos (
  id SERIAL PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id),
  turboboost_task_id INT,
  video_url TEXT,
  topic TEXT,
  style TEXT,
  duration INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. White Label
Скрыть бренд TurboBoost и показать только ваш:
```typescript
// В VideoGeneratorModal заменить:
"Создано с помощью AI" → "Создано с помощью AdMarket AI"
```

### 4. Монетизация
Добавить лимиты генераций по тарифам:
```typescript
// Проверять credits перед генерацией
if (user.videos_left <= 0) {
  alert('Лимит видео исчерпан. Обновите тариф.')
}
```

---

## 📞 Поддержка:

**Вопросы по TurboBoost API:**
- Документация: QUICK_START_INTEGRATION.md
- Email: support@turboboost.ai (пример)

**Вопросы по интеграции:**
- GitHub: https://github.com/Christiangrandcrue/admarket
- Issue tracker: https://github.com/Christiangrandcrue/admarket/issues

---

## ✅ Checklist для деплоя:

- [x] Backend API создан
- [x] Frontend UI готов
- [x] Компонент интегрирован в Dashboard
- [ ] Environment Variables добавлены в Vercel
- [ ] Проект redeploy'нут
- [ ] Протестирована генерация видео
- [ ] История генераций (опционально)
- [ ] Автопубликация (опционально)

---

**Дата интеграции:** 2025-11-27  
**Время на настройку:** 5 минут (только env vars)  
**Статус:** ✅ Готово к деплою!
