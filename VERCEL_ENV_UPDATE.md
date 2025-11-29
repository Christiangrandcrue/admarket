# Обновление переменных окружения Vercel (ОБЯЗАТЕЛЬНО)

Вы успешно обновили код и базу данных, но **Vercel не знает о новых ключах**. Чтобы сайт `ads.synthnova.me` заработал, нужно добавить их вручную.

1. Перейдите в настройки проекта: [https://vercel.com/dashboard](https://vercel.com/dashboard) -> Выберите проект -> **Settings** -> **Environment Variables**.
2. Добавьте (или обновите) следующие переменные:

### 1. Content Factory (Генерация видео)
*   **Key:** `CONTENT_FACTORY_SECRET`
*   **Value:** `sk_live_synthnova_factory_x99_v2_turbo`

### 2. Supabase (База данных)
*Если эти ключи уже есть, убедитесь, что они правильные. Если нет — добавьте.*

*   **Key:** `NEXT_PUBLIC_SUPABASE_URL`
*   **Value:** `https://visoxfhymssvunyazgsl.supabase.co`

*   **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpc294Zmh5bXNzdnVueWF6Z3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDg5NDIsImV4cCI6MjA3OTMyNDk0Mn0.9fykm5X3fLT7sQz366gQqwO9zu_BuhnKh-_WSeaRpzs`

*   **Key:** `SUPABASE_SERVICE_ROLE_KEY`
*   **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpc294Zmh5bXNzdnVueWF6Z3NsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzc0ODk0MiwiZXhwIjoyMDc5MzI0OTQyfQ.5P340LoCs2hUqtfjKtGKzCfiNQ9N93qiF6rW3cQciuQ`

### 3. Stripe (Платежи) - если еще не добавлены
*   **Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
*   **Value:** `pk_test_51SR61NFqMRSVCimKtWAl97mbT6T1qIwuRC3XNZ3rP8waRil66aHOG3MN0ELHBnIp2GRV2wg8VRG0kXacupeNJtKV00tfHlskSK`

*   **Key:** `STRIPE_SECRET_KEY`
*   **Value:** `sk_test_51SR61NFqMRSVCimKWWWAk29OoWAtZQ2zEyKv1bK4h8l6mLm8duB55NmEvPDLI3ak5olTieVJoct0pBGJDqzsWTwW00gnuSgPDk`

---
**После добавления переменных:**
Перейдите во вкладку **Deployments** и нажмите **Redeploy** на последнем коммите (или сделайте новый пуш), чтобы сайт пересобрался с новыми ключами.
