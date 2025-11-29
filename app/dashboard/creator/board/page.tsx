'use client'

import { useState, useEffect } from "react"
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
import { MapPin, Clock, Search, SlidersHorizontal } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// DB Types
interface Campaign {
  id: string
  title: string
  description: string
  platform: string
  category: string
  budget: number
  deadline: string
  status: string
  requirements: string
  created_at: string
}

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  // 1. Fetch Jobs from DB
  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    // Select all active campaigns
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'active') // Only active jobs
      .order('created_at', { ascending: false })

    if (data) {
      setJobs(data)
    } else if (error) {
      console.error('Error fetching jobs:', error)
    }
    setLoading(false)
  }

  // 2. Apply Filters Locally (can be moved to DB query for large datasets)
  const filteredJobs = jobs.filter(job => {
    const matchesCategory = filterCategory === 'all' || job.category.toLowerCase() === filterCategory.toLowerCase()
    const matchesPlatform = filterPlatform === 'all' || job.platform.toLowerCase() === filterPlatform.toLowerCase()
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
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
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
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* More Filters Button */}
          <div className="md:col-span-1">
            <Button variant="outline" className="w-full" title="Сбросить" onClick={() => {setFilterCategory('all'); setFilterPlatform('all'); setSearchQuery('')}}>
              <SlidersHorizontal className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
             <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
             <p className="text-gray-500">Загружаем заказы...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all relative overflow-hidden">
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Company Logo (Auto-generated from Platform) */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner
                    ${job.platform === 'youtube' ? 'bg-red-100 text-red-600' : 
                      job.platform === 'instagram' ? 'bg-pink-100 text-pink-600' :
                      job.platform === 'telegram' ? 'bg-blue-100 text-blue-500' :
                      'bg-black text-white'}`}>
                    {job.platform.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="text-lg font-bold text-gray-900">
                         {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(job.budget)}
                       </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                  {/* Tags & Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md capitalize">
                      <MapPin className="w-3.5 h-3.5" /> {job.platform}
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                       <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 uppercase text-[10px]">
                         {job.category}
                       </Badge>
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
            <p className="text-gray-500">В данный момент нет активных заказов по вашим критериям.</p>
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
