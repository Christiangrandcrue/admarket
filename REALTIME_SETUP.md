# Real-time Notifications Setup

## ✅ Что уже сделано

1. **Custom Hook** - `useNotifications` с WebSocket subscriptions
2. **NotificationBell** - Рефакторинг для real-time updates
3. **Migration File** - SQL для включения Realtime в Supabase

## 🔧 Применение миграции в Supabase

### Шаг 1: Откройте Supabase SQL Editor

Перейдите в: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### Шаг 2: Выполните SQL команды

```sql
-- Enable realtime publication for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Grant SELECT permission on notifications table for authenticated users
GRANT SELECT ON public.notifications TO authenticated;

-- Comment
COMMENT ON TABLE public.notifications IS 'In-app notifications with Realtime subscriptions enabled';
```

### Шаг 3: Проверка Realtime статуса

После выполнения миграции, проверьте в Supabase Dashboard:

1. Перейдите в **Database** → **Replication**
2. Убедитесь, что таблица `notifications` присутствует в списке реплицируемых таблиц

## 🚀 Как это работает

### Архитектура Real-time

```
User Action → API → create_notification() → PostgreSQL
                                               ↓
                                    NOTIFY (Realtime)
                                               ↓
                              Supabase Realtime Server
                                               ↓
                                    WebSocket broadcast
                                               ↓
                              useNotifications hook
                                               ↓
                            React state update (INSTANT ⚡)
```

### Пример использования useNotifications

```typescript
import { useNotifications } from '@/lib/hooks/use-notifications'

function MyComponent() {
  const {
    notifications,    // Автообновляемый список
    unreadCount,      // Счётчик непрочитанных (real-time)
    loading,          // Статус загрузки
    error,            // Ошибки
    refresh,          // Ручное обновление
    markAsRead,       // Отметить как прочитанное
    markAllAsRead,    // Отметить все как прочитанные
  } = useNotifications({
    limit: 50,              // Количество уведомлений
    unreadOnly: false,      // Только непрочитанные?
    autoFetch: true,        // Автоматическая загрузка при mount?
    enableRealtime: true,   // 🔥 Real-time подписка
  })

  return (
    <div>
      <h2>Уведомления ({unreadCount})</h2>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  )
}
```

## 📊 Что получаем

### Instant Updates ⚡

- **Новое уведомление** → Появляется мгновенно без перезагрузки
- **Прочитано** → Badge count обновляется instant
- **Нет polling** → WebSocket вместо HTTP polling = меньше нагрузка

### Performance Benefits

- ✅ Нет unnecessary API calls
- ✅ Один WebSocket connection для всех updates
- ✅ Automatic reconnection при потере связи
- ✅ Фильтрация на уровне PostgreSQL (user_id filter)

## 🧪 Тестирование

### 1. Локальный тест (без Realtime)

```bash
npm run dev
```

Уведомления будут работать с обычным fetch (без real-time).

### 2. Production тест (с Realtime)

После применения миграции и деплоя:

1. Откройте два браузера/вкладки с одним аккаунтом
2. Создайте уведомление через API или action в приложении
3. Уведомление должно появиться **мгновенно** в обоих браузерах

### 3. Debug Realtime

Откройте Console в браузере, вы увидите:

```
📡 Realtime subscription status: SUBSCRIBED
🔔 New notification received: {...}
```

## 🎯 Следующие улучшения (опционально)

- [ ] Toast notification при получении нового уведомления
- [ ] Sound effect для важных уведомлений
- [ ] Browser Push notifications (Web Push API)
- [ ] Группировка уведомлений по типу
- [ ] Notification preferences (какие типы показывать)

## 🔍 Troubleshooting

### Realtime не работает?

1. Проверьте, что миграция применена: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`
2. Проверьте RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'notifications';`
3. Проверьте WebSocket connection в Network tab браузера
4. Убедитесь, что `enableRealtime: true` в useNotifications

### Console ошибки?

```typescript
// Проверьте console.log в useNotifications hook:
console.log('📡 Realtime subscription status:', status)
```

Статус должен быть `SUBSCRIBED`, не `CLOSED` или `CHANNEL_ERROR`.
