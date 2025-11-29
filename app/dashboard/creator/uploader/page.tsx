'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Youtube, 
  Instagram, 
  X, 
  FileVideo, 
  CheckCircle2, 
  Loader2, 
  Calendar,
  Hash,
  Smartphone
} from "lucide-react"

export default function UploaderPage() {
  // State
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const togglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== id))
    } else {
      setSelectedPlatforms([...selectedPlatforms, id])
    }
  }

  const handlePublish = async () => {
    if (!file || selectedPlatforms.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulation of upload process
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setIsSuccess(true)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const resetForm = () => {
    setFile(null)
    setCaption("")
    setSelectedPlatforms([])
    setIsSuccess(false)
    setUploadProgress(0)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Мульти-Аплоадер</h1>
        <p className="text-gray-500">Загружайте контент сразу во все соцсети. Экономьте часы рутины.</p>
      </div>

      {isSuccess ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-green-100 shadow-sm max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Опубликовано успешно!</h2>
          <p className="text-gray-500 mb-8">Ваше видео отправлено в обработку и скоро появится в {selectedPlatforms.join(', ')}.</p>
          <Button onClick={resetForm} className="bg-purple-600 hover:bg-purple-700">
            Загрузить еще одно
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. File Upload */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">1</span>
                Загрузка видео
              </h3>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="video/mp4,video/mov,video/quicktime"
                    onChange={handleFileSelect}
                  />
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="font-medium text-gray-900">Нажмите или перетащите видео</p>
                  <p className="text-sm text-gray-500 mt-1">MP4, MOV до 500MB</p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <FileVideo className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                    <X className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              )}
            </div>

            {/* 2. Platforms */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">2</span>
                Выберите платформы
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'tiktok', name: 'TikTok', icon: 'Ti', color: 'bg-black text-white' },
                  { id: 'instagram', name: 'Reels', icon: <Instagram className="w-5 h-5" />, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white' },
                  { id: 'youtube', name: 'Shorts', icon: <Youtube className="w-5 h-5" />, color: 'bg-red-600 text-white' },
                ].map((platform) => (
                  <div 
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${
                      selectedPlatforms.includes(platform.id) 
                        ? 'border-purple-600 bg-purple-50' 
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {selectedPlatforms.includes(platform.id) && (
                      <div className="absolute top-2 right-2 text-purple-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${platform.color}`}>
                      {platform.icon}
                    </div>
                    <span className="font-medium text-sm">{platform.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Details */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">3</span>
                Детали публикации
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Описание / Caption</label>
                  <textarea 
                    className="w-full min-h-[120px] p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Расскажите о своем видео... Используйте #хештеги"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <div className="flex justify-between mt-2">
                    <div className="flex gap-2">
                       <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">#fyp</Badge>
                       <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">#trends</Badge>
                       <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">#viral</Badge>
                    </div>
                    <span className="text-xs text-gray-400">{caption.length}/2200</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handlePublish}
              disabled={!file || selectedPlatforms.length === 0 || isUploading}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl shadow-lg shadow-purple-200"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Публикация... {uploadProgress}%
                </div>
              ) : (
                "Опубликовать сейчас"
              )}
            </Button>

          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-1">
             <div className="sticky top-8">
                <div className="flex items-center gap-2 mb-4 text-gray-500">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm font-medium">Предпросмотр</span>
                </div>

                {/* Phone Mockup */}
                <div className="bg-black rounded-[2.5rem] border-[8px] border-gray-900 overflow-hidden shadow-2xl aspect-[9/19] relative">
                   {/* Screen Content */}
                   <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      {file ? (
                        <div className="text-white text-center">
                           <FileVideo className="w-12 h-12 mx-auto mb-2 opacity-50" />
                           <p className="text-sm opacity-50">Video Preview</p>
                        </div>
                      ) : (
                        <div className="text-gray-600 text-center">
                           <p className="text-xs">Выберите видео</p>
                        </div>
                      )}
                   </div>

                   {/* UI Overlay */}
                   <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 pb-8 bg-gradient-to-b from-black/20 via-transparent to-black/60">
                      <div className="flex justify-center pt-2">
                         <div className="w-1/3 h-1 bg-white/20 rounded-full"></div>
                      </div>

                      <div className="text-white space-y-2">
                         <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <span className="font-bold text-sm shadow-sm">@CreativeSoul</span>
                         </div>
                         <p className="text-sm text-white/90 line-clamp-3 drop-shadow-md">
                            {caption || "Ваше описание появится здесь..."}
                         </p>
                         <div className="flex gap-2 text-xs opacity-80">
                            <span>♫ Original Sound</span>
                         </div>
                      </div>

                      {/* Side Actions Mockup */}
                      <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center">
                         <div className="w-10 h-10 bg-white/10 rounded-full backdrop-blur-md"></div>
                         <div className="w-10 h-10 bg-white/10 rounded-full backdrop-blur-md"></div>
                         <div className="w-10 h-10 bg-white/10 rounded-full backdrop-blur-md"></div>
                      </div>
                   </div>
                </div>

                <p className="text-xs text-center text-gray-400 mt-4">
                   * Внешний вид может незначительно отличаться в зависимости от платформы
                </p>
             </div>
          </div>

        </div>
      )}
    </div>
  )
}
