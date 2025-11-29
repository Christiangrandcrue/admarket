'use client'
import { Upload, Youtube, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UploaderPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Аплоадер (Публикация)</h1>
        <p className="text-gray-500">Загрузка контента сразу во все подключенные соцсети.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
             <Upload className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Перетащите видео сюда</h3>
          <p className="text-gray-500 mb-6">или выберите файл на компьютере (MP4, MOV)</p>
          <Button>Выбрать файл</Button>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Куда публикуем?</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Youtube className="w-5 h-5 text-red-600" />
                  <span className="font-medium">YouTube Shorts</span>
                </div>
                <span className="text-xs text-gray-500">Не подключено</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-pink-600" />
                  <span className="font-medium">Instagram Reels</span>
                </div>
                <span className="text-xs text-gray-500">Не подключено</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <span className="font-bold">Ti</span>
                  <span className="font-medium">TikTok</span>
                </div>
                <span className="text-xs text-gray-500">Не подключено</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              * Подключите аккаунты в разделе "Настройки кабинета", чтобы активировать автопостинг.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
