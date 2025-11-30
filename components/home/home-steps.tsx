'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function HomeSteps() {
  const [role, setRole] = useState<'advertiser' | 'creator' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Try to get role from metadata or local storage override
        // In a real app, we might query a 'profiles' table
        const storedRole = localStorage.getItem('dashboard_role_override')
        if (storedRole === 'creator') {
            setRole('creator')
        } else {
            setRole('advertiser') // Default to advertiser if logged in but unsure
        }
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  if (loading) return null // Or a skeleton

  // CREATOR VIEW
  if (role === 'creator') {
    return (
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
                Монетизируй свой талант <br /> проще, чем кажется
              </h2>
              <p className="mb-8 text-lg text-gray-600">
                Мы берем на себя поиск клиентов и юридические вопросы. Ты просто творишь.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">1</div>
                  <div>
                    <h4 className="mb-1 font-bold text-gray-900">Заполни профиль</h4>
                    <p className="text-gray-600">Расскажи о себе, укажи расценки и подключи соцсети для аналитики.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">2</div>
                  <div>
                    <h4 className="mb-1 font-bold text-gray-900">Получай заявки</h4>
                    <p className="text-gray-600">Бренды сами найдут тебя в каталоге или пришлют персональное предложение.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">3</div>
                  <div>
                    <h4 className="mb-1 font-bold text-gray-900">Гарантия оплаты</h4>
                    <p className="text-gray-600">Деньги резервируются до начала работы. Никаких "кидков" и задержек.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                 <Button asChild className="bg-purple-600 hover:bg-purple-700">
                   <Link href="/dashboard/creator">Перейти в кабинет</Link>
                 </Button>
              </div>
            </div>
            
            {/* Creator Visual */}
            <div className="relative rounded-2xl bg-purple-50 p-8 lg:p-12">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-2xl"></div>
               <div className="relative z-10 flex flex-col gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Новая заявка</span>
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">25 000 ₽</span>
                    </div>
                    <p className="font-bold text-gray-800">Реклама новой коллекции одежды</p>
                    <div className="mt-3 flex gap-2">
                        <div className="h-8 w-20 bg-gray-100 rounded"></div>
                        <div className="h-8 w-20 bg-purple-600 rounded"></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ADVERTISER / GUEST VIEW (Default)
  return (
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
                Запуск кампании <br /> проще, чем кажется
              </h2>
              <p className="mb-8 text-lg text-gray-600">
                Забудьте о долгих переговорах и таблицах в Excel. Мы автоматизировали процесс от подбора до выплаты.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-900">1</div>
                  <div>
                    <h4 className="mb-1 font-bold text-gray-900">Создайте кампанию</h4>
                    <p className="text-gray-600">Опишите задачу, бюджет и выберите платформы (Instagram, YouTube, Telegram).</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-900">2</div>
                  <div>
                    <h4 className="mb-1 font-bold text-gray-900">Получите отклики</h4>
                    <p className="text-gray-600">Заинтересованные блогеры сами отправят заявки, или выберите их в каталоге.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-900">3</div>
                  <div>
                    <h4 className="mb-1 font-bold text-gray-900">Оплатите результат</h4>
                    <p className="text-gray-600">Примите работу, и средства автоматически поступят исполнителю.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                 <Button asChild>
                   <Link href="/dashboard/campaigns">Начать сейчас</Link>
                 </Button>
              </div>
            </div>
            
            {/* Visual Decoration */}
            <div className="relative rounded-2xl bg-gray-50 p-8 lg:p-12">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-2xl"></div>
               <div className="relative z-10 space-y-6">
                  {/* Mock Card 1 */}
                  <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                     <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                     <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-100"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-50"></div>
                     </div>
                     <div className="h-8 w-20 rounded-lg bg-green-100"></div>
                  </div>
                  {/* Mock Card 2 */}
                  <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm translate-x-4">
                     <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                     <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-100"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-50"></div>
                     </div>
                     <div className="h-8 w-20 rounded-lg bg-purple-100"></div>
                  </div>
                  {/* Mock Card 3 */}
                  <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                     <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                     <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-100"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-50"></div>
                     </div>
                     <div className="h-8 w-20 rounded-lg bg-blue-100"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
  )
}
