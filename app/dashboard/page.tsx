import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const userRole = user.user_metadata?.role || 'advertiser'

  // Redirect based on role
  if (userRole === 'creator') {
    redirect('/dashboard/creator')
  } else {
    redirect('/dashboard/campaigns')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Добро пожаловать, {user.user_metadata?.full_name || user.email}!
        </h1>
        <p className="text-gray-600">
          {userRole === 'advertiser' 
            ? 'Панель управления рекламными кампаниями'
            : 'Панель управления каналами и заказами'
          }
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-2 text-sm font-medium text-gray-600">Ваша роль</div>
          <div className="text-2xl font-bold text-gray-900">
            {userRole === 'advertiser' ? '💼 Рекламодатель' : '🎬 Блогер'}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-2 text-sm font-medium text-gray-600">Email</div>
          <div className="text-lg font-semibold text-gray-900">
            {user.email}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-2 text-sm font-medium text-gray-600">Статус</div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-900">
            <span className="h-2 w-2 rounded-full bg-green-600"></span>
            Активен
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Следующие шаги
        </h2>
        
        {userRole === 'advertiser' ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xl">
                🎯
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  Найдите блогеров
                </h3>
                <p className="text-sm text-gray-600">
                  Изучите каталог верифицированных каналов и выберите подходящих для вашей кампании
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xl">
                🚀
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  Создайте кампанию
                </h3>
                <p className="text-sm text-gray-600">
                  Настройте цели, бюджет и креатив за 6 простых шагов
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xl">
                📊
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  Отслеживайте результаты
                </h3>
                <p className="text-sm text-gray-600">
                  Получайте детальную аналитику и атрибуцию продаж в реальном времени
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-pink-100 text-xl">
                ✅
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  Заполните профиль
                </h3>
                <p className="text-sm text-gray-600">
                  Добавьте свои каналы, метрики и форматы рекламных интеграций
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-pink-100 text-xl">
                🔍
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  Пройдите верификацию
                </h3>
                <p className="text-sm text-gray-600">
                  Подтвердите свои каналы для получения бейджа "Верифицирован"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-pink-100 text-xl">
                💰
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  Получайте заказы
                </h3>
                <p className="text-sm text-gray-600">
                  Рекламодатели смогут находить вас в каталоге и отправлять заявки
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
