import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  Target, 
  Shield, 
  BarChart3, 
  Clock,
  CheckCircle2,
  TrendingUp
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <Badge className="mb-6" variant="default">
            Запуск MVP · 2025
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
            Покупайте рекламу у блогеров
            <br />
            <span className="text-gray-500">по метрикам, а не на удачу</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Каталог верифицированных каналов, эскроу-сделки, атрибуция продаж и отчёты — всё в одном месте
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/auth/register?role=advertiser">
                Запустить кампанию <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register?role=creator">
                Монетизировать канал
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-gray-100 bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold">5,000+</div>
              <div className="text-sm text-gray-600">Верифицированных каналов</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">12M+</div>
              <div className="text-sm text-gray-600">Совокупная аудитория</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">$250</div>
              <div className="text-sm text-gray-600">Средний CPA в e-commerce</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Как это работает</h2>
            <p className="text-lg text-gray-600">Запустите кампанию за 4 простых шага</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-white">
                <Target size={32} />
              </div>
              <h3 className="mb-2 font-bold">1. Бриф</h3>
              <p className="text-sm text-gray-600">
                Опишите цель, аудиторию и бюджет кампании
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-white">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="mb-2 font-bold">2. Подбор</h3>
              <p className="text-sm text-gray-600">
                Выберите каналы из каталога по метрикам и аудитории
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-white">
                <Shield size={32} />
              </div>
              <h3 className="mb-2 font-bold">3. Эскроу</h3>
              <p className="text-sm text-gray-600">
                Безопасная сделка с задержкой выплаты до публикации
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-white">
                <BarChart3 size={32} />
              </div>
              <h3 className="mb-2 font-bold">4. Результаты</h3>
              <p className="text-sm text-gray-600">
                Отслеживайте метрики, конверсии и ROI в реальном времени
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Почему AdMarket</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8">
              <Shield className="mb-4 text-gray-900" size={40} />
              <h3 className="mb-2 text-xl font-bold">Эскроу-сделки</h3>
              <p className="text-gray-600">
                Деньги резервируются на счёте до подтверждения публикации согласно ТЗ
              </p>
            </div>
            
            <div className="rounded-2xl bg-white p-8">
              <BarChart3 className="mb-4 text-gray-900" size={40} />
              <h3 className="mb-2 text-xl font-bold">Атрибуция продаж</h3>
              <p className="text-gray-600">
                UTM-метки, промокоды и интеграции с GA4, AppsFlyer, Shopify
              </p>
            </div>
            
            <div className="rounded-2xl bg-white p-8">
              <TrendingUp className="mb-4 text-gray-900" size={40} />
              <h3 className="mb-2 text-xl font-bold">Прозрачность</h3>
              <p className="text-gray-600">
                Верификация каналов, анти-накрутка, рейтинги и отзывы
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Готовы начать?</h2>
          <p className="mb-8 text-lg text-gray-600">
            Присоединяйтесь к платформе сегодня — запуск кампании занимает 10 минут
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/catalog">
                Посмотреть каталог <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/cases">
                Изучить кейсы
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
