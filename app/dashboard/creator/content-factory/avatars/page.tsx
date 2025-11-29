'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, Image as ImageIcon, Info } from 'lucide-react'

export default function MyAvatarsPage() {
  const [avatars, setAvatars] = useState([
    { id: '1', url: '/static/demo-avatar-1.jpg', name: 'upscale от photo_2025-11-26...', size: '60 KB' },
    { id: '2', url: '/static/demo-avatar-2.jpg', name: 'photo_2025-11-26_16-09...', size: '60 KB' }
  ])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Mock upload
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          const newAvatar = {
            id: Date.now().toString(),
            url: e.target.result as string,
            name: file.name,
            size: `${(file.size / 1024).toFixed(0)} KB`
          }
          setAvatars([newAvatar, ...avatars])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить это фото?')) {
      setAvatars(avatars.filter(a => a.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-600 p-2 rounded-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мои фото</h1>
            <p className="text-gray-500 text-sm">Загрузите фото для использования лица в генерации видео (Face Swap)</p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3 text-purple-800 font-semibold">
            <div className="bg-purple-100 p-1 rounded-full"><Upload className="w-4 h-4" /></div>
            Загрузить фото
          </div>
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-white hover:bg-gray-50 hover:border-purple-400 transition-all cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
            />
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Нажмите для выбора фото</h3>
            <p className="text-gray-400 text-sm">JPG, PNG или WEBP до 10MB</p>
          </div>
        </div>

        {/* Gallery */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
            <ImageIcon className="w-5 h-5" />
            Мои фото ({avatars.length})
          </div>

          {avatars.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <Info className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">У вас пока нет загруженных фото</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {avatars.map((avatar) => (
                <div key={avatar.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-all">
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    {/* Avatar Image - using standard img for base64 data */}
                    <img 
                      src={avatar.url} 
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image load fails (for demo static paths)
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=User&background=random&size=200`
                      }}
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(avatar.id)
                        }}
                        className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 text-sm truncate" title={avatar.name}>
                      {avatar.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">{avatar.size}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
