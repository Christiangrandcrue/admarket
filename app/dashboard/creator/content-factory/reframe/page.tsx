'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UploadCloud, Crop, Play, Loader2, ScanFace, LayoutTemplate, Scissors } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ReframePage() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState('auto_focus')
  const [layout, setLayout] = useState('full')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultVideoUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleProcess = async () => {
    if (!file) {
      toast.error('Пожалуйста, загрузите горизонтальное видео')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    // Simulate processing steps
    const steps = [
        { p: 15, msg: 'Анализ сцен (Scene Detection)...' },
        { p: 40, msg: 'Трекинг объектов (Object Tracking)...' },
        { p: 60, msg: 'Определение говорящего (Active Speaker)...' },
        { p: 80, msg: 'Кадрирование (Smart Crop)...' },
        { p: 100, msg: 'Рендеринг 9:16...' }
    ]

    for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1200))
        setProgress(step.p)
    }

    setIsProcessing(false)
    setResultVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4') // Mock result
    toast.success('Видео успешно нарезано!')
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Crop className="w-8 h-8 text-orange-600" />
            AI Нарезка (Auto Reframe)
          </h1>
          <p className="text-gray-500 mt-1">
            Автоматическая конвертация горизонтальных видео (YouTube) в вертикальные (Shorts/Reels) с умным фокусом.
          </p>
        </div>
        <Link href="/dashboard/creator/content-factory">
          <Button variant="outline">Назад в Комбайн</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Settings */}
        <div className="space-y-6">
          
          {/* 1. Upload */}
          <Card className="border-orange-100 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-orange-600" /> 
                1. Загрузите видео (16:9)
              </h3>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                }`}
              >
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  id="video-upload"
                  onChange={handleFileChange}
                />
                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                  {file ? (
                    <>
                        <Scissors className="w-12 h-12 text-green-600 mb-2" />
                        <p className="text-green-700 font-medium">{file.name}</p>
                        <p className="text-xs text-green-600 mt-1">Готово к нарезке</p>
                    </>
                  ) : (
                    <>
                        <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">Нажмите для загрузки</p>
                        <p className="text-xs text-gray-400 mt-1">YouTube видео, Подкасты, Стримы</p>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* 2. Smart Crop Settings */}
          <Card className="border-orange-100 shadow-md">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-orange-600" /> 
                2. Режим фокусировки
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Кого отслеживать?</Label>
                    <Select value={mode} onValueChange={setMode}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto_focus">Авто-фокус (Главный объект)</SelectItem>
                            <SelectItem value="active_speaker">Активный спикер (Лицо + Голос)</SelectItem>
                            <SelectItem value="face_tracking">Слежение за лицом (Face Tracking)</SelectItem>
                            <SelectItem value="action">Экшн (Движение)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Макет (Layout)</Label>
                    <div className="grid grid-cols-3 gap-3">
                        <button 
                            onClick={() => setLayout('full')}
                            className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                                layout === 'full' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="w-6 h-10 bg-gray-300 rounded-sm border border-gray-400"></div>
                            <span className="text-xs font-medium">Полный</span>
                        </button>
                        <button 
                            onClick={() => setLayout('split')}
                            className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                                layout === 'split' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="w-6 h-10 rounded-sm border border-gray-400 flex flex-col">
                                <div className="flex-1 bg-gray-300 border-b border-white"></div>
                                <div className="flex-1 bg-gray-400"></div>
                            </div>
                            <span className="text-xs font-medium">Сплит</span>
                        </button>
                        <button 
                            onClick={() => setLayout('game')}
                            className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                                layout === 'game' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="w-6 h-10 bg-gray-300 rounded-sm border border-gray-400 relative">
                                <div className="absolute top-1 right-1 w-2 h-2 bg-gray-500 rounded-full"></div>
                            </div>
                            <span className="text-xs font-medium">Гейминг</span>
                        </button>
                    </div>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-200 text-white"
                onClick={handleProcess}
                disabled={isProcessing || !file}
              >
                {isProcessing ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Нарезка {progress}%
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Crop className="w-5 h-5" />
                        Создать Shorts / Reels
                    </span>
                )}
              </Button>

            </CardContent>
          </Card>

        </div>

        {/* Right: Result & Preview */}
        <div className="space-y-6">
            <Card className="h-full border-gray-200 shadow-sm min-h-[500px] flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-4">Предпросмотр 9:16</h3>
                    
                    <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                        {resultUrl ? (
                            <div className="relative h-full aspect-[9/16]">
                                <video 
                                    src={resultUrl} 
                                    controls 
                                    autoPlay
                                    loop
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : isProcessing ? (
                            <div className="text-center space-y-4 p-8">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                    <ScanFace className="absolute inset-0 m-auto w-8 h-8 text-orange-400 animate-pulse" />
                                </div>
                                <p className="text-orange-200 animate-pulse">
                                    AI ищет самое интересное...
                                </p>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <div className="w-16 h-24 border-2 border-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                    <LayoutTemplate className="w-8 h-8 opacity-20" />
                                </div>
                                <p>Здесь появится вертикальное видео</p>
                            </div>
                        )}
                    </div>

                    {resultUrl && (
                        <div className="mt-6 space-y-3">
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1">
                                    Скачать
                                </Button>
                                <Button className="flex-1 bg-black text-white hover:bg-gray-800">
                                    В расписание
                                </Button>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg text-xs text-orange-800 flex items-center gap-2">
                                <ScanFace className="w-4 h-4" />
                                AI обнаружил 3 интересных момента в видео. Это первый.
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
