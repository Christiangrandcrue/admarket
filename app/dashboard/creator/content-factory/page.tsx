import Link from 'next/link'
import { Video, Calendar, Image as ImageIcon, ArrowRight, Sparkles, Zap } from 'lucide-react'

export default function ContentFactoryHub() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-10 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
            <Zap className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 bg-white/20 backdrop-blur-md w-fit px-4 py-1.5 rounded-full border border-white/30">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Content Factory 2.0</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Комбайн контента</h1>
            <p className="text-purple-100 text-lg max-w-2xl">
              Единый центр управления AI-генерацией. Создавайте вирусные видео, планируйте контент и управляйте цифровыми аватарами в одном месте.
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Tool 1: Single Video */}
          <Link href="/dashboard/creator/content-factory/video" className="group">
            <div className="bg-white rounded-2xl p-6 h-full border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-50 w-24 h-24 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Одиночное видео</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Быстрая генерация одного ролика по текстовому описанию (Prompt-to-Video).
                </p>
                <div className="flex items-center text-purple-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                  Создать <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Tool 2: Content Plan */}
          <Link href="/dashboard/creator/content-factory/plan" className="group">
            <div className="bg-white rounded-2xl p-6 h-full border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Контент-план</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Массовая генерация серии роликов. Задайте частоту, и AI создаст расписание.
                </p>
                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                  Запланировать <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Tool 3: My Avatars */}
          <Link href="/dashboard/creator/content-factory/avatars" className="group">
            <div className="bg-white rounded-2xl p-6 h-full border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-pink-50 w-24 h-24 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Мои Аватары</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Загрузите свои фото для использования технологии Face Swap в видео.
                </p>
                <div className="flex items-center text-pink-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                  Управлять <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* Recent Activity / Stats Preview */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Активные процессы</h2>
            <Link href="/dashboard/creator/videos" className="text-purple-600 text-sm font-medium hover:underline">
              Посмотреть все задачи
            </Link>
          </div>
          
          <div className="space-y-4">
            {/* Mock Active Tasks */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Futuristic Dubai City</h4>
                  <p className="text-xs text-gray-500">Одиночное видео • 5 сек</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[80%] animate-pulse"></div>
                </div>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">80%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Фитнес-план Март</h4>
                  <p className="text-xs text-gray-500">Контент-план • 3 видео/день</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">Очередь</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
