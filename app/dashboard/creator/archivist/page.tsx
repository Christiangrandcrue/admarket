'use client'

import { useState } from 'react'
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  MoreVertical, 
  Search, 
  UploadCloud, 
  Grid, 
  List as ListIcon,
  Download,
  Trash2,
  HardDrive,
  Clock,
  Star,
  Plus,
  ChevronRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- Types ---
type FileType = 'image' | 'video' | 'document' | 'audio' | 'folder'

interface FileItem {
  id: string
  name: string
  type: FileType
  size: string
  date: string
  starred?: boolean
}

// --- Mock Data ---
const FOLDERS = [
  { id: 'contracts', name: 'Договоры и Акты', count: 12, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'media', name: 'Исходники видео', count: 45, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'invoices', name: 'Счета на оплату', count: 8, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'assets', name: 'Бренд-кит', count: 24, color: 'text-orange-500', bg: 'bg-orange-50' },
]

const FILES: Record<string, FileItem[]> = {
  'contracts': [
    { id: '1', name: 'Оферта_AdMarket_2025.pdf', type: 'document', size: '2.4 MB', date: '29.11.2025', starred: true },
    { id: '2', name: 'Договор_Samsung_Integration.docx', type: 'document', size: '1.1 MB', date: '28.11.2025' },
    { id: '3', name: 'Акт_выполненных_работ_#402.pdf', type: 'document', size: '850 KB', date: '25.11.2025' },
  ],
  'media': [
    { id: '4', name: 'Review_Pixel_8_Draft_v1.mp4', type: 'video', size: '1.2 GB', date: '27.11.2025', starred: true },
    { id: '5', name: 'Thumbnail_Youtube_Final.jpg', type: 'image', size: '4.5 MB', date: '27.11.2025' },
    { id: '6', name: 'B-Roll_Unboxing.mov', type: 'video', size: '850 MB', date: '26.11.2025' },
    { id: '7', name: 'Voiceover_Intro.wav', type: 'audio', size: '12 MB', date: '26.11.2025' },
  ],
  'invoices': [
    { id: '8', name: 'Invoice_#2024-001.pdf', type: 'document', size: '150 KB', date: '20.11.2025' },
    { id: '9', name: 'Invoice_#2024-002.pdf', type: 'document', size: '150 KB', date: '22.11.2025' },
  ],
  'assets': [
    { id: '10', name: 'Logo_Vector.svg', type: 'image', size: '50 KB', date: '01.11.2025', starred: true },
    { id: '11', name: 'Font_Bold.ttf', type: 'document', size: '2 MB', date: '01.11.2025' },
  ]
}

const RECENT_FILES = [
  ...FILES['media'], ...FILES['contracts']
].sort(() => 0.5 - Math.random()).slice(0, 4)

// --- Components ---

export default function ArchivistPage() {
  const [activeFolder, setActiveFolder] = useState<string | null>(null) // null = Dashboard/Overview
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const currentFiles = activeFolder ? FILES[activeFolder] : RECENT_FILES

  const getIcon = (type: FileType) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8 text-purple-500" />
      case 'video': return <Video className="w-8 h-8 text-red-500" />
      case 'audio': return <Music className="w-8 h-8 text-pink-500" />
      case 'folder': return <Folder className="w-8 h-8 text-blue-500" />
      default: return <FileText className="w-8 h-8 text-gray-500" />
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-md mb-6">
            <UploadCloud className="w-4 h-4 mr-2" /> Загрузить файл
          </Button>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveFolder(null)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeFolder === null ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <HardDrive className="w-4 h-4" /> Мой диск
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Clock className="w-4 h-4" /> Недавние
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Star className="w-4 h-4" /> Избранное
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Trash2 className="w-4 h-4" /> Корзина
            </button>
          </nav>

          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Хранилище
            </h3>
            <div className="px-3">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-purple-500 w-[65%] rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>6.5 GB исп.</span>
                <span>10 GB всего</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span 
              className="hover:text-purple-600 cursor-pointer hover:underline"
              onClick={() => setActiveFolder(null)}
            >
              Мой диск
            </span>
            {activeFolder && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-gray-900">
                  {FOLDERS.find(f => f.id === activeFolder)?.name}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Поиск..." 
                className="pl-9 h-9 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center border rounded-lg p-1 bg-gray-50">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === 'grid' ? "bg-white shadow-sm text-purple-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === 'list' ? "bg-white shadow-sm text-purple-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Folders Section (Only visible on root) */}
          {!activeFolder && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Папки</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {FOLDERS.map(folder => (
                  <div 
                    key={folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                    className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all flex items-center gap-4"
                  >
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", folder.bg)}>
                      <Folder className={cn("w-6 h-6", folder.color)} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-purple-700">
                        {folder.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {folder.count} файлов
                      </div>
                    </div>
                  </div>
                ))}
                {/* Create New Folder Button */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-4 cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors text-gray-400 hover:text-purple-600">
                  <div className="flex flex-col items-center">
                     <Plus className="w-6 h-6 mb-1" />
                     <span className="text-xs font-medium">Новая папка</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Files Section */}
          <div>
             <h2 className="text-sm font-semibold text-gray-900 mb-4">
               {activeFolder ? 'Файлы' : 'Недавние файлы'}
             </h2>
             
             {viewMode === 'grid' ? (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {currentFiles.map(file => (
                   <div key={file.id} className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all relative">
                      <div className="flex justify-between items-start mb-3">
                         <div className="p-3 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                            {getIcon(file.type)}
                         </div>
                         {file.starred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                      </div>
                      <h3 className="font-medium text-sm text-gray-900 truncate mb-1" title={file.name}>
                        {file.name}
                      </h3>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                         <span>{file.size}</span>
                         <span>{file.date}</span>
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white shadow-sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Скачать</DropdownMenuItem>
                            <DropdownMenuItem>Переименовать</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Удалить</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                     <tr>
                       <th className="px-6 py-3 font-medium">Имя</th>
                       <th className="px-6 py-3 font-medium">Размер</th>
                       <th className="px-6 py-3 font-medium">Дата</th>
                       <th className="px-6 py-3 font-medium text-right">Действия</th>
                     </tr>
                   </thead>
                   <tbody>
                     {currentFiles.map(file => (
                       <tr key={file.id} className="border-b border-gray-50 hover:bg-purple-50/50 transition-colors group">
                         <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-3">
                            {getIcon(file.type)}
                            {file.name}
                         </td>
                         <td className="px-6 py-3 text-gray-500">{file.size}</td>
                         <td className="px-6 py-3 text-gray-500">{file.date}</td>
                         <td className="px-6 py-3 text-right">
                           <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                             <Download className="w-4 h-4" />
                           </Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
