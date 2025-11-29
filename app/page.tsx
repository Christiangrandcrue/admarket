import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  Target, 
  Shield, 
  BarChart3, 
  CheckCircle2,
  TrendingUp,
  Zap,
  Users,
  Globe2,
  Sparkles
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative px-6 py-24 lg:py-32 overflow-hidden bg-white">
        {/* Abstract Background */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-100 opacity-50 blur-3xl filter"></div>
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-100 opacity-50 blur-3xl filter"></div>

        <div className="mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm text-purple-600 mb-8">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>AI-Powered Marketplace v1.0</span>
          </div>
          
          <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-gray-900 md:text-7xl lg:leading-tight">
            Маркетплейс рекламы <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              с гарантией результата
            </span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600 leading-relaxed">
            Закупайте интеграции у проверенных блогеров, используйте AI для генерации креативов и платите только за реальные охваты через безопасную сделку.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 px-8 text-base bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
              <Link href="/catalog">
                Найти блогера <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-gray-300 hover:bg-gray-50 hover:text-gray-900" asChild>
              <Link href="/auth/register?role=creator">
                Я Креатор
              </Link>
            </Button>
          </div>

          {/* Stats Strip */}
          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-gray-100 pt-8 md:grid-cols-4 lg:gap-12">
            <div>
              <div className="text-3xl font-bold text-gray-900">5K+</div>
              <div className="text-sm font-medium text-gray-500">Авторов</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">12M+</div>
              <div className="text-sm font-medium text-gray-500">Аудитория</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">0%</div>
              <div className="text-sm font-medium text-gray-500">Рисков (Escrow)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm font-medium text-gray-500">Поддержка</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Всё для эффективной рекламы</h2>
            <p className="mt-4 text-lg text-gray-600">Мы объединили лучшие инструменты для брендов и креаторов</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Card 1 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Безопасная сделка</h3>
              <p className="text-gray-600">
                Деньги замораживаются на счете и переводятся блогеру только после успешной публикации и проверки выполнения ТЗ.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">AI-генерация</h3>
              <p className="text-gray-600">
                Встроенные инструменты для генерации сценариев, видео и креативов. Экономьте время на продакшене.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Прозрачная аналитика</h3>
              <p className="text-gray-600">
                Отслеживайте клики, конверсии и ROI в реальном времени. Никаких накруток — только живая аудитория.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
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
                   <Link href="/auth/register?role=advertiser">Начать сейчас</Link>
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

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative mx-auto max-w-4xl px-6 text-center z-10">
          <h2 className="mb-6 text-3xl font-bold text-white sm:text-5xl">
            Готовы масштабировать бизнес?
          </h2>
          <p className="mb-10 text-xl text-gray-300">
            Присоединяйтесь к платформе, где бренды находят голос, а креаторы — достойную оплату.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 px-8 text-lg bg-white text-gray-900 hover:bg-gray-100" asChild>
              <Link href="/auth/register">Создать аккаунт бесплатно</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Никаких скрытых комиссий. Кредитная карта не требуется.
          </p>
        </div>
      </section>

    </div>
  )
}
