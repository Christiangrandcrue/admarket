'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UploadCloud, Languages, Mic2, Play, Loader2, Sparkles, FileVideo, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function TranslatorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('')
  const [lipSync, setLipSync] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultVideoUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleTranslate = async () => {
    if (!file || !targetLang) {
      toast.error('Пожалуйста, выберите видео и целевой язык')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    // Simulate processing steps
    const steps = [
        { p: 10, msg: 'Загрузка видео...' },
        { p: 30, msg: 'Распознавание речи (Whisper)...' },
        { p: 50, msg: 'Перевод текста (GPT-4)...' },
        { p: 70, msg: 'Синтез речи (ElevenLabs)...' },
        { p: 90, msg: 'Lip Sync генерация (Wav2Lip)...' },
        { p: 100, msg: 'Готово!' }
    ]

    for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setProgress(step.p)
        // toast(step.msg) // Optional: too many toasts might be annoying
    }

    setIsProcessing(false)
    setResultVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4') // Mock result
    toast.success('Перевод завершен!')
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Languages className="w-8 h-8 text-indigo-600" />
            AI Переводчик Видео
          </h1>
          <p className="text-gray-500 mt-1">
            Переводите видео на другие языки с сохранением вашего голоса и синхронизацией губ (Lip Sync).
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
          <Card className="border-indigo-100 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" /> 
                1. Загрузите видео
              </h3>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
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
                        <FileVideo className="w-12 h-12 text-green-600 mb-2" />
                        <p className="text-green-700 font-medium">{file.name}</p>
                        <p className="text-xs text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                        <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">Нажмите для загрузки</p>
                        <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI до 500MB</p>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* 2. Language Settings */}
          <Card className="border-indigo-100 shadow-md">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Mic2 className="w-5 h-5 text-indigo-600" /> 
                2. Настройки перевода
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Исходный язык</Label>
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">Автоопределение</SelectItem>
                            <SelectItem value="ru">Русский</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Целевой язык</Label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите язык" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English (US)</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="it">Italian</SelectItem>
                            <SelectItem value="zh">Chinese (Mandarin)</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="pt">Portuguese</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <p className="font-medium text-indigo-900">Lip Sync (Синхронизация губ)</p>
                        <p className="text-xs text-indigo-600">AI подстроит движение губ под новый язык</p>
                    </div>
                </div>
                <input 
                    type="checkbox" 
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    checked={lipSync}
                    onChange={(e) => setLipSync(e.target.checked)}
                />
              </div>

              <Button 
                className="w-full h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200"
                onClick={handleTranslate}
                disabled={isProcessing || !file || !targetLang}
              >
                {isProcessing ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Обработка {progress}%
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Languages className="w-5 h-5" />
                        Перевести видео
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
                    <h3 className="text-lg font-semibold mb-4">Результат</h3>
                    
                    <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                        {resultUrl ? (
                            <video 
                                src={resultUrl} 
                                controls 
                                className="w-full h-full object-contain"
                                poster="/placeholder-video-poster.jpg"
                            />
                        ) : isProcessing ? (
                            <div className="text-center space-y-4 p-8">
                                <div className="relative w-24 h-24 mx-auto">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-gray-700"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={251.2}
                                            strokeDashoffset={251.2 - (251.2 * progress) / 100}
                                            className="text-indigo-500 transition-all duration-500 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                                        {progress}%
                                    </div>
                                </div>
                                <p className="text-indigo-200 animate-pulse">
                                    AI переводит ваше видео...
                                </p>
                                <div className="text-xs text-gray-500 max-w-xs mx-auto">
                                    Это может занять несколько минут. Вы можете покинуть эту страницу, уведомление придет по завершению.
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <Play className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>Здесь появится переведенное видео</p>
                            </div>
                        )}
                    </div>

                    {resultUrl && (
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <Button variant="outline" className="w-full">
                                Скачать
                            </Button>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                Опубликовать
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
