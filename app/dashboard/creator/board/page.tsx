'use client'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, DollarSign, ArrowRight } from "lucide-react"

export default function JobBoardPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Доска заказов</h1>
        <p className="text-gray-500">Персональные рекомендации и новые заявки от рекламодателей.</p>
      </div>

      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center font-bold text-purple-600 text-xl">
                {i === 1 ? 'Ni' : i === 2 ? 'Sam' : 'App'}
              </div>
              <div>
                <div className="flex gap-2 items-center mb-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {i === 1 ? 'Реклама новой коллекции кроссовок' : i === 2 ? 'Обзор смартфона Samsung S25' : 'Интеграция мобильного приложения'}
                  </h3>
                  {i === 1 && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Рекомендуем</Badge>}
                </div>
                <p className="text-gray-500 text-sm mb-3 max-w-2xl">
                  Ищем креаторов в нише Fashion/Lifestyle для создания коротких Reels (15-30 сек) с распаковкой и примеркой.
                </p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Москва, РФ
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Дедлайн: 5 дней
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-green-600">
                    <DollarSign className="w-4 h-4" /> Бюджет: 50,000 ₽
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none">Подробнее</Button>
              <Button className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700">Откликнуться</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
