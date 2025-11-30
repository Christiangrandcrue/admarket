'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wand2, Play, Clock, Film, Download, Share2, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function VideoGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  
  const handleGenerate = async () => {
    if (!prompt) {
      toast.error('Введите описание видео')
      return
    }

    setIsGenerating(true)
    
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false)
      toast.success('Видео успешно сгенерировано!')
    }, 3000)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Видео Генератор
          </h1>
          <p className="text-gray-500 mt-1">Превратите текст в вирусные видео за секунды</p>
        </div>
        <Link href="/dashboard/creator/content-factory">
          <Button variant="outline">Назад в Комбайн</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-purple-100 shadow-md">
            <CardHeader className="bg-purple-50/50 border-b border-purple-100">
              <CardTitle>Настройки генерации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              
              <div className="space-y-2">
                <Label>Промпт (Описание)</Label>
                <Textarea 
                  placeholder="Опишите видео детально. Например: Футуристический город Дубай, летающие машины, неоновые огни, кинематографичный стиль..." 
                  className="h-32 resize-none focus-visible:ring-purple-500"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <p className="text-xs text-gray-400 text-right">{prompt.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label>Формат (Aspect Ratio)</Label>
                <Select defaultValue="9:16">
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите формат" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:16">9:16 (Reels / TikTok)</SelectItem>
                    <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Стиль</Label>
                <Select defaultValue="realistic">
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите стиль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Фотореализм</SelectItem>
                    <SelectItem value="anime">Аниме / Мультфильм</SelectItem>
                    <SelectItem value="cyberpunk">Киберпанк</SelectItem>
                    <SelectItem value="cinematic">Кинематографичный</SelectItem>
                    <SelectItem value="3d">3D Рендер</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Длительность</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите длительность" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 секунды (Быстро)</SelectItem>
                    <SelectItem value="5">5 секунд (Стандарт)</SelectItem>
                    <SelectItem value="10">10 секунд (Pro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200 mt-4"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Сгенерировать
                  </>
                )}
              </Button>

            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Совет Pro</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Для лучших результатов описывайте освещение ("неоновый свет", "солнечный день") и движение камеры ("slow motion", "drone shot").
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview & History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Preview Area */}
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Предпросмотр</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center bg-gray-900 rounded-lg m-6 relative group">
              {isGenerating ? (
                 <div className="text-center space-y-4">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-purple-400 animate-pulse" />
                    </div>
                    <p className="text-purple-200 animate-pulse">AI создает магию...</p>
                 </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Film className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Здесь появится ваше видео</p>
                </div>
              )}
              
              {/* Overlay Actions (Visible on Hover/Active) */}
              {!isGenerating && false && ( // Hidden by default for mock
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                  <Button size="sm" variant="secondary"><Download className="w-4 h-4 mr-2"/> Скачать</Button>
                  <Button size="sm" variant="secondary"><Share2 className="w-4 h-4 mr-2"/> Поделиться</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent History */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              История генераций
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-500 transition-all cursor-pointer">
                   {/* Placeholder Image */}
                   <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <Film className="w-8 h-8 text-gray-400" />
                   </div>
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-10 h-10 text-white fill-white" />
                   </div>
                   <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs truncate">
                      Cyberpunk City #{i}
                   </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
