# 📋 Техническое задание: Интеграция TurboBoost в платформу для блогеров

**Дата**: 2025-11-27  
**Приоритет**: High  
**Сложность**: 2/5 (простая интеграция)  
**Время**: 2-4 часа разработки

---

## 🎯 Цель

Добавить функционал **AI генерации видео** (TurboBoost) в личный кабинет блогеров/креаторов вашей платформы.

**Что получит пользователь:**
1. Кнопка "Сгенерировать видео" в личном кабинете
2. Форма для создания видео (тема, стиль, длительность)
3. Прогресс-бар генерации (2-4 минуты)
4. Готовое видео → автопубликация через Uploader

---

## 📐 Архитектура

```
┌─────────────────────────────────────────────┐
│  Ваша платформа (Frontend)                  │
│                                             │
│  [Личный кабинет блогера]                   │
│   └─ [🎬 Сгенерировать видео] ← НОВАЯ КНОПКА│
│       ↓                                     │
│   [Модалка с формой]                        │
│   [Прогресс-бар 0-99%]                      │
│   [Готовое видео + кнопка публикации]       │
└──────────────┬──────────────────────────────┘
               │
               │ API Call
               ↓
┌─────────────────────────────────────────────┐
│  Ваш Backend (Node.js/Python/PHP)          │
│                                             │
│  POST /api/creator/generate-video          │
│  GET  /api/creator/videos/:id              │
│  GET  /api/creator/videos                  │
└──────────────┬──────────────────────────────┘
               │
               │ Proxy to TurboBoost
               ↓
┌─────────────────────────────────────────────┐
│  TurboBoost API (External)                 │
│  https://turboboost-portal.pages.dev/api   │
│                                             │
│  POST /auth/login                          │
│  POST /tasks/generate-video                │
│  GET  /tasks/:id                           │
└──────────────┬──────────────────────────────┘
               │
               │ Video ready (2-4 min)
               ↓
┌─────────────────────────────────────────────┐
│  Ваш Uploader Service                      │
│  (публикация на TikTok/Instagram/YouTube)   │
└─────────────────────────────────────────────┘
```

---

## 🔧 Техническое задание для Backend

### 1. Создать TurboBoost Client Module

**Файл:** `lib/turboboost-client.js` (или `.py` если Python)

**Требования:**
- ✅ Singleton паттерн (1 экземпляр на весь сервер)
- ✅ Авторизация при инициализации
- ✅ Обработка ошибок и retry логика
- ✅ Credentials из environment variables

**Код (Node.js):**
```javascript
// lib/turboboost-client.js
const fetch = require('node-fetch')

class TurboBoostClient {
  constructor() {
    this.baseUrl = process.env.TURBOBOOST_API_URL || 'https://turboboost-portal.pages.dev/api'
    this.email = process.env.TURBOBOOST_EMAIL // Обязательно из .env!
    this.password = process.env.TURBOBOOST_PASSWORD // Обязательно из .env!
    this.token = null
    this.tokenExpiry = null
  }

  // Авторизация (вызывается автоматически при необходимости)
  async ensureAuthenticated() {
    if (this.token && this.tokenExpiry > Date.now()) {
      return // Token ещё валиден
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      })

      if (!response.ok) {
        throw new Error(`TurboBoost auth failed: ${response.status}`)
      }

      const data = await response.json()
      this.token = data.token
      this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000) // 24 часа
      
      console.log('TurboBoost authenticated, videos left:', data.user.videos_left)
      return data.user
    } catch (error) {
      console.error('TurboBoost auth error:', error)
      throw error
    }
  }

  // Создать задачу генерации видео
  async generateVideo(brief) {
    await this.ensureAuthenticated()

    const prompt = this._buildPrompt(brief)

    try {
      const response = await fetch(`${this.baseUrl}/tasks/generate-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          brief
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Generation failed')
      }

      return await response.json()
    } catch (error) {
      console.error('TurboBoost generate error:', error)
      throw error
    }
  }

  // Получить статус задачи
  async getTask(taskId) {
    await this.ensureAuthenticated()

    try {
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get task: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('TurboBoost getTask error:', error)
      throw error
    }
  }

  // Получить все задачи
  async getTasks() {
    await this.ensureAuthenticated()

    try {
      const response = await fetch(`${this.baseUrl}/tasks`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get tasks: ${response.status}`)
      }

      const data = await response.json()
      return data.tasks || []
    } catch (error) {
      console.error('TurboBoost getTasks error:', error)
      throw error
    }
  }

  // Helper: Построить AI prompt
  _buildPrompt(brief) {
    const { topic, style, duration } = brief

    const styleDescriptions = {
      cinematic: 'epic cinematic view, dramatic lighting, 4K quality, drone shot',
      dynamic: 'fast-paced dynamic shot, energetic movement, action-packed',
      aesthetic: 'aesthetic dreamy atmosphere, soft colors, artistic composition',
      viral: 'attention-grabbing viral content, trending style, high engagement'
    }

    const styleDesc = styleDescriptions[style] || 'cinematic view'
    return `${styleDesc} of ${topic}, ${duration} seconds, professional quality`
  }
}

// Singleton instance
let instance = null

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new TurboBoostClient()
    }
    return instance
  }
}
```

**Environment Variables (.env):**
```bash
# Добавьте в ваш .env файл:
TURBOBOOST_API_URL=https://turboboost-portal.pages.dev/api
TURBOBOOST_EMAIL=inbe@ya.ru
TURBOBOOST_PASSWORD=rewfdsvcx5
```

---

### 2. Создать API Routes для креаторов

**Файл:** `routes/creator-video.js` (или в вашу существующую структуру)

**Endpoints:**
- `POST /api/creator/generate-video` — создать задачу генерации
- `GET /api/creator/videos/:id` — получить статус задачи
- `GET /api/creator/videos` — получить все видео креатора

**Код (Express.js):**
```javascript
// routes/creator-video.js
const express = require('express')
const router = express.Router()
const turboboostClient = require('../lib/turboboost-client')
const { authenticateCreator } = require('../middleware/auth') // Ваш существующий middleware

// POST /api/creator/generate-video
router.post('/generate-video', authenticateCreator, async (req, res) => {
  try {
    const { topic, style = 'cinematic', duration = 5, photo_url } = req.body
    const creatorId = req.user.id // Из вашей auth middleware

    // Валидация
    if (!topic || topic.length < 3) {
      return res.status(400).json({ error: 'Тема должна быть не короче 3 символов' })
    }

    // Проверяем подписку креатора (optional)
    // if (!req.user.canGenerateVideo) {
    //   return res.status(403).json({ error: 'Обновите подписку для генерации видео' })
    // }

    // Вызываем TurboBoost
    const turboboost = turboboostClient.getInstance()
    const result = await turboboost.generateVideo({
      topic,
      style,
      duration,
      photo_url
    })

    // Сохраняем в вашу БД для отслеживания
    const videoRecord = await db.query(`
      INSERT INTO creator_videos (creator_id, turboboost_task_id, topic, style, status, created_at)
      VALUES ($1, $2, $3, $4, 'generating', NOW())
      RETURNING id
    `, [creatorId, result.task_id, topic, style])

    res.json({
      success: true,
      video_id: videoRecord.rows[0].id,
      turboboost_task_id: result.task_id,
      message: 'Видео генерируется. Проверьте статус через 2-4 минуты.',
      estimated_time: 180 // секунды
    })

  } catch (error) {
    console.error('Generate video error:', error)
    res.status(500).json({ 
      error: 'Ошибка генерации видео', 
      details: error.message 
    })
  }
})

// GET /api/creator/videos/:id
router.get('/videos/:id', authenticateCreator, async (req, res) => {
  try {
    const videoId = req.params.id
    const creatorId = req.user.id

    // Получаем из вашей БД
    const video = await db.query(`
      SELECT * FROM creator_videos 
      WHERE id = $1 AND creator_id = $2
    `, [videoId, creatorId])

    if (video.rows.length === 0) {
      return res.status(404).json({ error: 'Видео не найдено' })
    }

    const videoData = video.rows[0]

    // Если ещё генерируется, проверяем статус в TurboBoost
    if (videoData.status === 'generating') {
      const turboboost = turboboostClient.getInstance()
      const task = await turboboost.getTask(videoData.turboboost_task_id)

      // Обновляем статус в БД если изменился
      if (task.status === 'ready') {
        await db.query(`
          UPDATE creator_videos 
          SET status = 'ready', video_url = $1, updated_at = NOW()
          WHERE id = $2
        `, [task.video_url, videoId])

        videoData.status = 'ready'
        videoData.video_url = task.video_url
      } else if (task.status === 'error') {
        await db.query(`
          UPDATE creator_videos 
          SET status = 'error', error_message = $1, updated_at = NOW()
          WHERE id = $2
        `, [task.error_message, videoId])

        videoData.status = 'error'
        videoData.error_message = task.error_message
      }
    }

    res.json({
      id: videoData.id,
      topic: videoData.topic,
      style: videoData.style,
      status: videoData.status,
      video_url: videoData.video_url,
      created_at: videoData.created_at,
      updated_at: videoData.updated_at
    })

  } catch (error) {
    console.error('Get video error:', error)
    res.status(500).json({ error: 'Ошибка получения видео' })
  }
})

// GET /api/creator/videos (список всех видео)
router.get('/videos', authenticateCreator, async (req, res) => {
  try {
    const creatorId = req.user.id

    const videos = await db.query(`
      SELECT id, topic, style, status, video_url, created_at
      FROM creator_videos
      WHERE creator_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [creatorId])

    res.json({
      videos: videos.rows,
      total: videos.rows.length
    })

  } catch (error) {
    console.error('Get videos error:', error)
    res.status(500).json({ error: 'Ошибка получения списка видео' })
  }
})

module.exports = router
```

**Регистрация routes:**
```javascript
// app.js или server.js
const creatorVideoRoutes = require('./routes/creator-video')
app.use('/api/creator', creatorVideoRoutes)
```

---

### 3. Создать таблицу в БД

**SQL Migration:**
```sql
-- migrations/XXXX_add_creator_videos.sql

CREATE TABLE IF NOT EXISTS creator_videos (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES users(id),
  turboboost_task_id INTEGER NOT NULL,
  topic VARCHAR(255) NOT NULL,
  style VARCHAR(50) DEFAULT 'cinematic',
  duration INTEGER DEFAULT 5,
  status VARCHAR(50) DEFAULT 'generating', -- generating / ready / error
  video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_creator_videos_creator_id ON creator_videos(creator_id);
CREATE INDEX idx_creator_videos_status ON creator_videos(status);
```

---

## 🎨 Техническое задание для Frontend

### 1. Добавить кнопку в личный кабинет

**Где:** Личный кабинет креатора (Dashboard)

**Код (React/Vue/Vanilla JS):**
```jsx
// В личном кабинете креатора
<div className="creator-tools">
  <h2>Инструменты креатора</h2>
  
  <div className="tool-card">
    <div className="tool-icon">🎬</div>
    <h3>Генератор видео</h3>
    <p>Создавайте профессиональные короткие видео с помощью AI за 2-4 минуты</p>
    
    <button 
      onClick={() => setShowVideoModal(true)}
      className="btn-primary"
    >
      <i className="fas fa-magic"></i> Сгенерировать видео
    </button>
  </div>
</div>
```

---

### 2. Создать модальное окно генерации

**Файл:** `components/VideoGeneratorModal.jsx` (или `.vue`)

**Функционал:**
- Форма с полями: тема, стиль, длительность
- Кнопка "Сгенерировать"
- Прогресс-бар во время генерации
- Отображение готового видео
- Кнопка "Опубликовать в соцсети"

**Код (React example):**
```jsx
// components/VideoGeneratorModal.jsx
import React, { useState, useEffect } from 'react'

export default function VideoGeneratorModal({ show, onClose }) {
  const [step, setStep] = useState('form') // form / generating / ready
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('cinematic')
  const [duration, setDuration] = useState(5)
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(180)
  const [videoData, setVideoData] = useState(null)
  const [error, setError] = useState(null)

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStep('generating')
    setError(null)

    try {
      const response = await fetch('/api/creator/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style, duration })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации')
      }

      // Начинаем polling
      startPolling(data.video_id)

    } catch (err) {
      setError(err.message)
      setStep('form')
    }
  }

  // Polling статуса
  const startPolling = (videoId) => {
    const startTime = Date.now()
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/creator/videos/${videoId}`)
        const video = await response.json()

        // Обновляем прогресс
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const newProgress = calculateProgress(elapsed)
        const remaining = Math.max(0, 180 - elapsed)

        setProgress(newProgress)
        setTimeRemaining(remaining)

        // Проверяем статус
        if (video.status === 'ready') {
          clearInterval(interval)
          setVideoData(video)
          setStep('ready')
        } else if (video.status === 'error') {
          clearInterval(interval)
          setError(video.error_message || 'Ошибка генерации')
          setStep('form')
        }

        // Timeout через 5 минут
        if (elapsed > 300) {
          clearInterval(interval)
          setError('Превышено время ожидания (5 мин)')
          setStep('form')
        }

      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 5000) // Каждые 5 секунд
  }

  // Нелинейный прогресс
  const calculateProgress = (elapsed) => {
    if (elapsed < 30) {
      return Math.floor((elapsed / 30) * 20)
    } else if (elapsed < 150) {
      return 20 + Math.floor(((elapsed - 30) / 120) * 60)
    } else if (elapsed < 180) {
      return 80 + Math.floor(((elapsed - 150) / 30) * 15)
    } else {
      return Math.min(99, 95 + Math.floor((elapsed - 180) / 10))
    }
  }

  // Публикация в соцсети
  const handlePublish = async () => {
    // Вызов вашего Uploader сервиса
    await fetch('/api/uploader/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_url: videoData.video_url,
        platforms: ['tiktok', 'instagram', 'youtube_shorts'],
        caption: `${topic} 🎬\n\nСоздано с помощью AI`
      })
    })
    
    alert('Видео отправлено на публикацию!')
    onClose()
  }

  if (!show) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Форма */}
        {step === 'form' && (
          <div>
            <h2>🎬 Генерация видео</h2>
            
            {error && (
              <div className="alert-error">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Тема видео</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Дубай Марина на закате"
                  required
                  minLength={3}
                />
              </div>

              <div className="form-group">
                <label>Стиль</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="cinematic">Кинематографичный</option>
                  <option value="dynamic">Динамичный</option>
                  <option value="aesthetic">Эстетичный</option>
                  <option value="viral">Вирусный</option>
                </select>
              </div>

              <div className="form-group">
                <label>Длительность</label>
                <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  <option value={5}>5 секунд</option>
                  <option value={10}>10 секунд</option>
                  <option value={15}>15 секунд</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  <i className="fas fa-magic"></i> Сгенерировать (~3 мин)
                </button>
                <button type="button" onClick={onClose} className="btn-secondary">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Прогресс */}
        {step === 'generating' && (
          <div>
            <h2>🎬 Генерация видео...</h2>

            {/* Прогресс-бар */}
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                >
                  <span className="progress-text">{progress}%</span>
                </div>
              </div>
            </div>

            {/* Время */}
            <div className="time-info">
              <i className="fas fa-clock"></i>
              <span>Осталось: <strong>
                {timeRemaining > 60 
                  ? `~${Math.ceil(timeRemaining / 60)} мин` 
                  : `${timeRemaining} сек`
                }
              </strong></span>
            </div>

            {/* Статус */}
            <div className="status-info">
              <div className="status-dots">
                <span className="dot animate-bounce"></span>
                <span className="dot animate-bounce delay-200"></span>
                <span className="dot animate-bounce delay-400"></span>
              </div>
              <p>AI создаёт ваше видео...</p>
            </div>

            <button onClick={onClose} className="btn-secondary">
              Свернуть (генерация продолжится в фоне)
            </button>
          </div>
        )}

        {/* Готово */}
        {step === 'ready' && videoData && (
          <div>
            <h2>✅ Видео готово!</h2>

            {/* Превью видео */}
            <div className="video-preview">
              <video controls width="100%">
                <source src={videoData.video_url} type="video/mp4" />
              </video>
            </div>

            {/* Информация */}
            <div className="video-info">
              <p><strong>Тема:</strong> {videoData.topic}</p>
              <p><strong>Стиль:</strong> {videoData.style}</p>
              <p><strong>Длительность:</strong> {videoData.duration || 5} сек</p>
            </div>

            {/* Действия */}
            <div className="modal-actions">
              <button onClick={handlePublish} className="btn-primary">
                <i className="fas fa-share-alt"></i> Опубликовать в соцсети
              </button>
              <a href={videoData.video_url} download className="btn-secondary">
                <i className="fas fa-download"></i> Скачать
              </a>
              <button onClick={() => { setStep('form'); setTopic(''); }} className="btn-secondary">
                <i className="fas fa-magic"></i> Сгенерировать ещё
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
```

**CSS (базовый):**
```css
/* styles/video-modal.css */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.progress-bar-container {
  margin: 24px 0;
}

.progress-bar {
  width: 100%;
  height: 32px;
  background: #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #9333ea, #a855f7);
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
}

.progress-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
  color: #6b7280;
}

.status-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
}

.dot {
  width: 10px;
  height: 10px;
  background: #9333ea;
  border-radius: 50%;
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-400 {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
}

.video-preview {
  margin: 24px 0;
  border-radius: 8px;
  overflow: hidden;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  flex: 1;
  padding: 12px 24px;
  background: #9333ea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #7e22ce;
}

.btn-secondary {
  padding: 12px 24px;
  background: transparent;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}
```

---

### 3. Добавить страницу истории видео (optional)

**Файл:** `pages/creator/videos.jsx`

**Код:**
```jsx
// pages/creator/videos.jsx
import React, { useState, useEffect } from 'react'

export default function CreatorVideosPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/creator/videos')
      const data = await response.json()
      setVideos(data.videos)
    } catch (error) {
      console.error('Load videos error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Загрузка...</div>
  }

  return (
    <div className="creator-videos-page">
      <h1>Мои видео</h1>

      <div className="videos-grid">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <div className="video-thumbnail">
              {video.video_url ? (
                <video src={video.video_url} />
              ) : (
                <div className="video-placeholder">
                  {video.status === 'generating' ? '⏳' : '🎬'}
                </div>
              )}
            </div>

            <div className="video-info">
              <h3>{video.topic}</h3>
              <p className="video-meta">
                <span className={`status-badge status-${video.status}`}>
                  {video.status === 'generating' && '⏳ Генерируется'}
                  {video.status === 'ready' && '✅ Готово'}
                  {video.status === 'error' && '❌ Ошибка'}
                </span>
                <span>{new Date(video.created_at).toLocaleDateString('ru-RU')}</span>
              </p>

              {video.video_url && (
                <div className="video-actions">
                  <a href={video.video_url} download className="btn-sm">
                    <i className="fas fa-download"></i> Скачать
                  </a>
                  <button className="btn-sm btn-primary">
                    <i className="fas fa-share-alt"></i> Опубликовать
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="empty-state">
          <p>У вас пока нет сгенерированных видео</p>
          <button onClick={() => window.location.href = '/creator/dashboard'}>
            Создать первое видео
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## ✅ Чеклист для разработчиков

### Backend:
- [ ] Добавить `TURBOBOOST_EMAIL` и `TURBOBOOST_PASSWORD` в `.env`
- [ ] Создать `lib/turboboost-client.js`
- [ ] Создать таблицу `creator_videos` в БД
- [ ] Создать routes: `POST /generate-video`, `GET /videos/:id`, `GET /videos`
- [ ] Протестировать авторизацию в TurboBoost
- [ ] Протестировать создание задачи
- [ ] Протестировать polling статуса

### Frontend:
- [ ] Добавить кнопку "Сгенерировать видео" в ЛК
- [ ] Создать компонент `VideoGeneratorModal`
- [ ] Реализовать форму (тема, стиль, длительность)
- [ ] Реализовать прогресс-бар с таймером
- [ ] Реализовать отображение готового видео
- [ ] Добавить кнопку "Опубликовать" → вызов Uploader
- [ ] Создать страницу истории видео (optional)
- [ ] Протестировать полный flow

### Интеграция с Uploader:
- [ ] Endpoint `/api/uploader/publish` принимает `video_url`
- [ ] Автопубликация на TikTok/Instagram/YouTube
- [ ] Уведомление креатора о публикации

### Тестирование:
- [ ] E2E: Кнопка → Форма → Генерация → Готово → Публикация
- [ ] Проверить обработку ошибок
- [ ] Проверить таймауты (>5 мин)
- [ ] Проверить UI на мобильных

---

## 🧪 Тестирование (для QA)

### 1. Тест авторизации TurboBoost
```bash
curl -X POST https://turboboost-portal.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"inbe@ya.ru","password":"rewfdsvcx5"}'

# Ожидаемый результат: 200 OK + token
```

### 2. Тест создания задачи
```bash
JWT="ваш_токен"

curl -X POST https://turboboost-portal.pages.dev/api/tasks/generate-video \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt":"Cinematic Dubai Marina",
    "brief":{"topic":"Дубай Марина","style":"cinematic","duration":5}
  }'

# Ожидаемый результат: 201 Created + task_id
```

### 3. Тест UI flow (manual)
1. Войти как креатор
2. Перейти в ЛК
3. Нажать "Сгенерировать видео"
4. Заполнить форму: "Дубай Марина на закате", "Кинематографичный", "5 сек"
5. Нажать "Сгенерировать"
6. **Проверить**: Появился прогресс-бар
7. **Проверить**: Таймер обновляется каждые 5 сек
8. **Ждать**: 2-4 минуты
9. **Проверить**: Появилось видео
10. **Проверить**: Кнопка "Опубликовать" работает

---

## 📞 Что спросить у разработчиков

### Вопросы для уточнения:

1. **Stack вашей платформы?**
   - Frontend: React / Vue / Angular / Vanilla JS?
   - Backend: Node.js / Python / PHP / Ruby?
   - Database: PostgreSQL / MySQL / MongoDB?

2. **Где разместить кнопку "Сгенерировать видео"?**
   - В дашборде креатора?
   - В отдельном разделе "Контент"?
   - В меню навигации?

3. **Есть ли Uploader сервис?**
   - Да → какой endpoint для публикации?
   - Нет → нужно ли его создавать?

4. **Монетизация генерации видео?**
   - Включено в подписку?
   - Pay-per-use?
   - Лимиты по тарифам?

5. **Нужен ли White Label?**
   - Скрыть упоминание "TurboBoost"?
   - Использовать ваш брендинг?

---

## 💰 Оценка работ

| Задача | Backend | Frontend | QA | Total |
|--------|---------|----------|-----|-------|
| **TurboBoost Client** | 1 час | - | - | 1 час |
| **API Routes** | 1 час | - | - | 1 час |
| **DB Migration** | 0.5 часа | - | - | 0.5 часа |
| **UI: Кнопка + Модалка** | - | 2 часа | - | 2 часа |
| **UI: История видео** | - | 1 час | - | 1 час |
| **Интеграция Uploader** | 0.5 часа | - | - | 0.5 часа |
| **Тестирование** | - | - | 2 часа | 2 часа |
| **Общее время** | 3 часа | 3 часа | 2 часа | **8 часов** |

**Минимальный MVP (без истории видео):** 4-6 часов

---

## 🎯 Ожидаемый результат

**После интеграции:**

1. Креатор открывает ЛК → видит кнопку "Сгенерировать видео"
2. Нажимает кнопку → открывается модалка с формой
3. Заполняет тему, стиль, длительность → "Сгенерировать"
4. Видит прогресс-бар 0% → 99% (~3 мин)
5. Получает уведомление "Видео готово!"
6. Видит превью видео в модалке
7. Нажимает "Опубликовать" → видео уходит в Uploader
8. Видео публикуется на TikTok/Instagram/YouTube

**Конкурентное преимущество:** У большинства платформ для креаторов НЕТ встроенной AI генерации видео! 🚀

---

## 📚 Полная документация

Для детального изучения:
- **QUICK_START_INTEGRATION.md** — минимальный код для старта
- **INTEGRATION_FOR_CREATORS_PLATFORM.md** — полный гайд (27KB)
- **UX_IMPROVEMENTS.md** — best practices для UI/UX
- **PHOTO_URL_FIX.md** — интеграция фото пользователей

---

## ✉️ Шаблон сообщения для разработчиков

```
Привет команда!

Нужно интегрировать TurboBoost (AI генерация видео) в личный кабинет креаторов.

📋 Техническое задание:
См. прикрепленный файл TECH_TASK_FOR_PLATFORM_DEVELOPERS.md

⏱️ Оценка: 4-8 часов (зависит от scope)
🔧 Сложность: 2/5 (простая REST интеграция)

📚 Документация:
- Техническое задание (этот файл)
- Quick Start Guide (копипаста код)
- Полный гайд (для детального изучения)

🧪 Тестовые credentials:
Email: inbe@ya.ru
Password: rewfdsvcx5

❓ Нужно уточнить:
1. Stack вашей платформы (React/Vue/Angular?)
2. Где разместить кнопку в UI?
3. Есть ли Uploader сервис?
4. Монетизация генерации (подписка/pay-per-use)?

Готов ответить на вопросы и помочь с интеграцией!
```

---

## ✅ Готово!

Это полное техническое задание для разработчиков. Они получили:
- ✅ Архитектуру интеграции
- ✅ Backend код (copy-paste ready)
- ✅ Frontend код (React example)
- ✅ DB migration
- ✅ Тестовые процедуры
- ✅ Чеклист задач
- ✅ Оценку работ

**Отправляйте это ТЗ разработчикам, и они смогут начать прямо сейчас!** 🚀
