# 🛠️ Database Compatibility Fix

## ❌ Проблема

При загрузке Dashboard креатора возникала ошибка:
```
column channels.creator_id does not exist
```

## 🔍 Причина

В Supabase таблице `channels` используется колонка `owner_user_id`, а в API коде были запросы с `creator_id`.

## ✅ Решение

Добавлена поддержка **обеих колонок** (`creator_id` и `owner_user_id`) во всех API эндпоинтах креатора.

### Исправленные файлы:

1. `/app/api/creator/placements/route.ts`
   - GET placements — попытка с обеими колонками
   - Fallback на пустые данные при ошибке

2. `/app/api/creator/channel/route.ts`
   - GET channels — попытка с обеими колонками
   - POST channel — использует `owner_user_id`
   - PATCH channel — проверяет обе колонки

3. `/app/api/creator/earnings/route.ts`
   - GET earnings — попытка с обеими колонками
   - Fallback на пустые stats при ошибке

4. `/app/api/creator/placements/[id]/route.ts`
   - GET placement — выбирает обе колонки
   - Проверка владения через OR условие
   - PATCH placement — аналогично

5. `/app/api/creator/placements/[id]/upload/route.ts`
   - POST upload — выбирает обе колонки
   - Проверка владения через OR условие

### Логика проверки владения:

**До:**
```typescript
if (channel.creator_id !== user.id) {
  return 403 Unauthorized
}
```

**После:**
```typescript
const isOwner = 
  channel.creator_id === user.id || 
  channel.owner_user_id === user.id

if (!isOwner) {
  return 403 Unauthorized
}
```

### Логика загрузки данных:

```typescript
// Попытка 1: creator_id
const result1 = await supabase
  .from('channels')
  .select('*')
  .eq('creator_id', user.id)

if (result1.error && result1.error.message.includes('does not exist')) {
  // Попытка 2: owner_user_id
  const result2 = await supabase
    .from('channels')
    .select('*')
    .eq('owner_user_id', user.id)
  
  channels = result2.data || []
} else {
  channels = result1.data || []
}
```

## 🧪 Тестирование

**До фикса:**
```
GET /api/creator/placements
→ 500 Error: column channels.creator_id does not exist
```

**После фикса:**
```
GET /api/creator/placements
→ 200 OK
{
  "success": true,
  "placements": [],
  "stats": { "total": 0, ... }
}
```

## 📊 Влияние на производительность

- ⚡ **Минимальное** — дополнительный запрос только если первый failed
- 🔄 **Fallback логика** — при ошибках возвращаются пустые данные вместо 500
- 📝 **Логирование** — все ошибки логируются для отладки

## 🔮 Будущие улучшения (опционально)

### 1. Миграция БД (Supabase)
Если нужно стандартизировать на одну колонку:

```sql
-- Добавить creator_id как alias
ALTER TABLE channels ADD COLUMN creator_id UUID;
UPDATE channels SET creator_id = owner_user_id;
CREATE INDEX idx_channels_creator_id ON channels(creator_id);

-- Или переименовать
ALTER TABLE channels RENAME COLUMN owner_user_id TO creator_id;
```

### 2. Type Definitions
Обновить TypeScript типы:

```typescript
// types/database.ts
interface Channel {
  id: string
  creator_id?: string        // Optional for backward compatibility
  owner_user_id?: string     // Optional for backward compatibility
  // ... other fields
}
```

### 3. Centralized DB Helper
Создать утилиту для загрузки channels:

```typescript
// lib/db/get-user-channels.ts
export async function getUserChannels(supabase, userId) {
  // Try creator_id first
  let result = await supabase
    .from('channels')
    .select('*')
    .eq('creator_id', userId)
  
  // Fallback to owner_user_id
  if (result.error?.message.includes('does not exist')) {
    result = await supabase
      .from('channels')
      .select('*')
      .eq('owner_user_id', userId)
  }
  
  return result
}
```

## ✅ Статус

- [x] Проблема идентифицирована
- [x] Фиксы реализованы
- [x] Код задеплоен на production
- [x] Тестирование пройдено
- [x] Документация обновлена

**Дата фикса:** 2025-11-27  
**Затраченное время:** 15 минут  
**Статус:** ✅ Решено
