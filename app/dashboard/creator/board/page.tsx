'use client'

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin, Clock, DollarSign, ArrowRight, Search, Filter, SlidersHorizontal } from "lucide-react"

// Mock Data for Jobs
const MOCK_JOBS = [
  {
    id: 1,
    title: 'Реклама новой коллекции кроссовок',
    company: 'Nike',
    logo_initials: 'Ni',
    description: 'Ищем креаторов в нише Fashion/Lifestyle для создания коротких Reels (15-30 сек) с распаковкой и примеркой.',
    category: 'Fashion',
    platform: 'Instagram',
    budget: '50,000 ₽',
    deadline: '5 дней',
    location: 'Москва, РФ',
    isRecommended: true,
    tags: ['Reels', 'Unboxing']
  },
  {
    id: 2,
    title: 'Обзор смартфона Samsung S25',
    company: 'Samsung',
    logo_initials: 'Sa',
    description: 'Нужен подробный обзор фишек камеры нового флагмана. Формат - YouTube видео (5-7 минут).',
    category: 'Tech',
    platform: 'YouTube',
    budget: '120,000 ₽',
    deadline: '10 дней',
    location: 'РФ (Онлайн)',
    isRecommended: false,
    tags: ['Review', 'Tech']
  },
  {
    id: 3,
    title: 'Интеграция мобильного приложения для йоги',
    company: 'ZenApp',
    logo_initials: 'Ze',
    description: 'Нативная интеграция в сторис. Показать, как приложение помогает расслабиться после рабочего дня.',
    category: 'Health',
    platform: 'Instagram',
    budget: '15,000 ₽',
    deadline: '3 дня',
    location: 'Весь мир',
    isRecommended: true,
    tags: ['Stories', 'Lifestyle']
  },
  {
    id: 4,
    title: 'Челлендж с острыми чипсами',
    company: 'HotChips',
    logo_initials: 'Ho',
    description: 'Веселый TikTok челлендж. Нужно съесть чипс и не запивать 1 минуту.',
    category: 'Food',
    platform: 'TikTok',
    budget: '25,000 ₽',
    deadline: '7 дней',
    location: 'РФ',
    isRecommended: false,
    tags: ['Challenge', 'Fun']
  },
  {
    id: 5,
    title: 'Реклама онлайн-курсов английского',
    company: 'SkyEng',
    logo_initials: 'Sk',
    description: 'Рассказать про свой опыт изучения языка. Промокод для подписчиков.',
    category: 'Education',
    platform: 'YouTube',
    budget: '60,000 ₽',
    deadline: '14 дней',
    location: 'Онлайн',
    isRecommended: false,
    tags: ['Education', 'Integration']
  }
]

export default function JobBoardPage() {
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesCategory = filterCategory === 'all' || job.category === filterCategory
    const matchesPlatform = filterPlatform === 'all' || job.platform === filterPlatform
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesPlatform && matchesSearch
  })

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Доска заказов</h1>
          <p className="text-gray-500 mt-1">Находите идеальные предложения от рекламодателей.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
           Мои отклики
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8 sticky top-4 z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Поиск по названию или описанию..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Ниши</SelectLabel>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Platform Filter */}
          <div className="md:col-span-3">
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Платформа" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Соцсети</SelectLabel>
                  <SelectItem value="all">Все платформы</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* More Filters Button */}
          <div className="md:col-span-1">
            <Button variant="outline" className="w-full" title="Расширенные фильтры">
              <SlidersHorizontal className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all relative overflow-hidden">
              {job.isRecommended && (
                <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-bl-xl">
                  Рекомендуем
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner
                    ${job.category === 'Tech' ? 'bg-blue-100 text-blue-600' : 
                      job.category === 'Fashion' ? 'bg-pink-100 text-pink-600' :
                      'bg-purple-100 text-purple-600'}`}>
                    {job.logo_initials}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="text-lg font-bold text-gray-900">{job.budget}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                  {/* Tags & Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                      <MapPin className="w-3.5 h-3.5" /> {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> {job.deadline}
                    </div>
                    <div className="flex gap-2">
                       {job.tags.map(tag => (
                         <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600 border-0">#{tag}</Badge>
                       ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 justify-center md:min-w-[140px]">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Откликнуться
                  </Button>
                  <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-900">
                    Подробнее
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Ничего не найдено</h3>
            <p className="text-gray-500">Попробуйте изменить фильтры или поисковый запрос.</p>
            <Button 
              variant="link" 
              onClick={() => {setFilterCategory('all'); setFilterPlatform('all'); setSearchQuery('')}}
              className="text-purple-600 mt-2"
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
