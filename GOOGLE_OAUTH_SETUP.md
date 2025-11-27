# 🔐 Google OAuth Setup Guide

## Шаг 1: Google Cloud Console (3 минуты)

### 1.1 Создайте проект
1. Откройте https://console.cloud.google.com/
2. Создайте новый проект или выберите существующий
3. Название: "AdMarket" (или любое другое)

### 1.2 Настройте OAuth Consent Screen
1. Перейдите: **APIs & Services** → **OAuth consent screen**
2. Выберите **External** (для всех пользователей)
3. Заполните:
   - **App name**: AdMarket
   - **User support email**: ваш email
   - **Developer contact**: ваш email
4. Нажмите **Save and Continue**
5. **Scopes**: пропустите (нажмите Save and Continue)
6. **Test users**: добавьте свой email (если в режиме Testing)
7. Нажмите **Save and Continue**

### 1.3 Создайте OAuth Client ID
1. Перейдите: **APIs & Services** → **Credentials**
2. Нажмите **+ CREATE CREDENTIALS** → **OAuth client ID**
3. **Application type**: Web application
4. **Name**: AdMarket Web Client
5. **Authorized JavaScript origins**:
   ```
   https://ads.synthnova.me
   https://visoxfhymssvunyazgsl.supabase.co
   ```
6. **Authorized redirect URIs**:
   ```
   https://visoxfhymssvunyazgsl.supabase.co/auth/v1/callback
   ```
7. Нажмите **CREATE**
8. **ВАЖНО**: Скопируйте и сохраните:
   - ✅ **Client ID** (начинается с цифр, заканчивается на .apps.googleusercontent.com)
   - ✅ **Client Secret** (случайная строка)

---

## Шаг 2: Supabase Dashboard (1 минута)

### 2.1 Настройте Google Provider
1. Откройте https://supabase.com/dashboard/project/visoxfhymssvunyazgsl/auth/providers
2. Найдите **Google** в списке провайдеров
3. Включите переключатель **Enable Sign in with Google**
4. Вставьте данные из Google Console:
   - **Client ID**: вставьте скопированный Client ID
   - **Client Secret**: вставьте скопированный Client Secret
5. Нажмите **Save**

---

## Шаг 3: Дайте мне Client ID и Secret

После выполнения шагов выше, отправьте мне:

```
Client ID: [ваш Client ID]
Client Secret: [ваш Client Secret]
```

Я сразу раскомментирую код и задеплою обновление! 🚀

---

## ⚠️ Важные моменты

### Режим Testing vs Production
- **Testing mode** (по умолчанию):
  - Работает только для Test Users
  - Нужно добавить email каждого тестера
  - Без review от Google

- **Production mode**:
  - Работает для всех пользователей
  - Требует верификацию от Google (2-6 недель)
  - Нужен Privacy Policy и Terms of Service

**Рекомендация**: Начните с Testing mode, добавьте себя как Test User. Для MVP этого достаточно!

---

## 🆘 Если возникли проблемы

### "redirect_uri_mismatch"
- Проверьте что Redirect URI точно: `https://visoxfhymssvunyazgsl.supabase.co/auth/v1/callback`
- В Google Console: точное совпадение без лишних пробелов

### "Access blocked: This app's request is invalid"
- OAuth Consent Screen не заполнен
- Добавьте App name и email

### "This app isn't verified"
- Нормально для Testing mode
- Нажмите "Advanced" → "Go to AdMarket (unsafe)"
- Или добавьте пользователя в Test Users

---

## 📸 Скриншоты для помощи

Если нужна помощь, можете прислать скриншоты экранов из Google Console.

Я жду Client ID и Client Secret! 🎯
