'use client'

import { useState, useRef } from 'react'
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
  ChevronRight,
  Loader2,
  Pencil,
  FolderPlus,
  Eye,
  File
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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// --- Types ---
type FileType = 'image' | 'video' | 'document' | 'audio' | 'folder'

interface FileItem {
  id: string
  name: string
  type: FileType
  size: string
  date: string
  folderId: string | null // null = root
  starred: boolean
  deleted: boolean
  timestamp: number // for sorting
  url?: string // mock url for preview
}

interface FolderItem {
  id: string
  name: string
  count: number
  color: string
  bg: string
}

// --- Initial Data ---
const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'contracts', name: 'Договоры и Акты', count: 3, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'media', name: 'Исходники видео', count: 4, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'invoices', name: 'Счета на оплату', count: 2, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'assets', name: 'Бренд-кит', count: 2, color: 'text-orange-500', bg: 'bg-orange-50' },
]

const INITIAL_FILES: FileItem[] = [
  { id: '1', name: 'Оферта_AdMarket_2025.pdf', type: 'document', size: '2.4 MB', date: '29.11.2025', folderId: 'contracts', starred: true, deleted: false, timestamp: 1732838400000, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { id: '2', name: 'Договор_Samsung_Integration.docx', type: 'document', size: '1.1 MB', date: '28.11.2025', folderId: 'contracts', starred: false, deleted: false, timestamp: 1732752000000 },
  { id: '3', name: 'Акт_выполненных_работ_#402.pdf', type: 'document', size: '850 KB', date: '25.11.2025', folderId: 'contracts', starred: false, deleted: false, timestamp: 1732492800000 },
  { id: '4', name: 'Review_Pixel_8_Draft_v1.mp4', type: 'video', size: '1.2 GB', date: '27.11.2025', folderId: 'media', starred: true, deleted: false, timestamp: 1732665600000, url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4' },
  { id: '5', name: 'Thumbnail_Youtube_Final.jpg', type: 'image', size: '4.5 MB', date: '27.11.2025', folderId: 'media', starred: false, deleted: false, timestamp: 1732665600000, url: 'https://placehold.co/800x450/png' },
  { id: '6', name: 'B-Roll_Unboxing.mov', type: 'video', size: '850 MB', date: '26.11.2025', folderId: 'media', starred: false, deleted: false, timestamp: 1732579200000 },
  { id: '7', name: 'Voiceover_Intro.wav', type: 'audio', size: '12 MB', date: '26.11.2025', folderId: 'media', starred: false, deleted: false, timestamp: 1732579200000, url: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav' },
  { id: '8', name: 'Invoice_#2024-001.pdf', type: 'document', size: '150 KB', date: '20.11.2025', folderId: 'invoices', starred: false, deleted: false, timestamp: 1732060800000 },
  { id: '9', name: 'Invoice_#2024-002.pdf', type: 'document', size: '150 KB', date: '22.11.2025', folderId: 'invoices', starred: false, deleted: false, timestamp: 1732233600000 },
  { id: '10', name: 'Logo_Vector.svg', type: 'image', size: '50 KB', date: '01.11.2025', folderId: 'assets', starred: true, deleted: false, timestamp: 1730419200000, url: 'https://placehold.co/500x500/png' },
  { id: '11', name: 'Font_Bold.ttf', type: 'document', size: '2 MB', date: '01.11.2025', folderId: 'assets', starred: false, deleted: false, timestamp: 1730419200000 },
]

export default function ArchivistPage() {
  // State
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS)
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES)
  const [activeFolder, setActiveFolder] = useState<string | null>(null) // null = root
  const [activeSection, setActiveSection] = useState<'drive' | 'recent' | 'starred' | 'trash'>('drive')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Dialogs
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null)
  const [newName, setNewName] = useState('')
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Logic ---

  // Filter Files based on current view
  const getFilteredFiles = () => {
    let filtered = files

    // 1. Apply Search
    if (searchQuery) {
      filtered = filtered.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // 2. Apply Section Logic
    switch (activeSection) {
      case 'drive':
        // Show files in current folder only, not deleted
        filtered = filtered.filter(f => !f.deleted && f.folderId === activeFolder)
        break
      case 'recent':
        // Show all non-deleted files, sorted by date
        filtered = filtered.filter(f => !f.deleted).sort((a, b) => b.timestamp - a.timestamp)
        break
      case 'starred':
        // Show starred non-deleted files
        filtered = filtered.filter(f => !f.deleted && f.starred)
        break
      case 'trash':
        // Show deleted files
        filtered = filtered.filter(f => f.deleted)
        break
    }

    return filtered
  }

  const currentFiles = getFilteredFiles()

  // Upload Simulation
  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    // Fake progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    setTimeout(() => {
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.includes('image') ? 'image' : file.type.includes('video') ? 'video' : 'document',
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        date: new Date().toLocaleDateString('ru-RU'),
        folderId: activeFolder,
        starred: false,
        deleted: false,
        timestamp: Date.now(),
        url: URL.createObjectURL(file) // Create object URL for preview
      }
      setFiles([newFile, ...files])
      setUploading(false)
      setUploadProgress(0)
      
      // Update folder count if in a folder
      if (activeFolder) {
        setFolders(folders.map(f => f.id === activeFolder ? { ...f, count: f.count + 1 } : f))
      }
    }, 2500)
  }

  // Create Folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    const newFolder: FolderItem = {
      id: Date.now().toString(),
      name: newFolderName,
      count: 0,
      color: 'text-gray-500',
      bg: 'bg-gray-50'
    }
    setFolders([...folders, newFolder])
    setNewFolderName('')
    setIsNewFolderOpen(false)
  }

  // File Actions
  const toggleStar = (id: string) => {
    setFiles(files.map(f => f.id === id ? { ...f, starred: !f.starred } : f))
  }

  const moveToTrash = (id: string) => {
    setFiles(files.map(f => f.id === id ? { ...f, deleted: true } : f))
  }

  const restoreFromTrash = (id: string) => {
    setFiles(files.map(f => f.id === id ? { ...f, deleted: false } : f))
  }

  const deletePermanently = (id: string) => {
    setFiles(files.filter(f => f.id !== id))
  }

  const handleRename = () => {
    if (!renamingFile || !newName.trim()) return
    setFiles(files.map(f => f.id === renamingFile.id ? { ...f, name: newName } : f))
    setRenamingFile(null)
    setNewName('')
  }

  // Icons
  const getIcon = (type: FileType) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8 text-purple-500" />
      case 'video': return <Video className="w-8 h-8 text-red-500" />
      case 'audio': return <Music className="w-8 h-8 text-pink-500" />
      case 'folder': return <Folder className="w-8 h-8 text-blue-500" />
      default: return <FileText className="w-8 h-8 text-gray-500" />
    }
  }

  // Calculate Storage
  const usedStorage = files.length * 0.5 // Dummy calculation: 0.5 GB per file avg for demo
  const totalStorage = 10

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden relative">
      
      {/* Hidden Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
      />

      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6">
          <Button 
            onClick={handleUploadClick} 
            disabled={uploading}
            className="w-full bg-purple-600 hover:bg-purple-700 shadow-md mb-6"
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />} 
            {uploading ? 'Загрузка...' : 'Загрузить файл'}
          </Button>

          {uploading && (
            <div className="mb-6 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-purple-500 h-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }} 
              />
            </div>
          )}

          <nav className="space-y-1">
            <button 
              onClick={() => { setActiveSection('drive'); setActiveFolder(null) }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeSection === 'drive' ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <HardDrive className="w-4 h-4" /> Мой диск
            </button>
            <button 
              onClick={() => { setActiveSection('recent'); setActiveFolder(null) }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeSection === 'recent' ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Clock className="w-4 h-4" /> Недавние
            </button>
            <button 
              onClick={() => { setActiveSection('starred'); setActiveFolder(null) }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeSection === 'starred' ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Star className="w-4 h-4" /> Избранное
            </button>
            <button 
              onClick={() => { setActiveSection('trash'); setActiveFolder(null) }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeSection === 'trash' ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Trash2 className="w-4 h-4" /> Корзина
            </button>
          </nav>

          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Хранилище
            </h3>
            <div className="px-3">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((usedStorage / totalStorage) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{usedStorage.toFixed(1)} GB исп.</span>
                <span>{totalStorage} GB всего</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500 overflow-hidden whitespace-nowrap">
            <span 
              className="hover:text-purple-600 cursor-pointer hover:underline"
              onClick={() => { setActiveSection('drive'); setActiveFolder(null) }}
            >
              {activeSection === 'drive' ? 'Мой диск' : 
               activeSection === 'recent' ? 'Недавние' :
               activeSection === 'starred' ? 'Избранное' : 'Корзина'}
            </span>
            {activeFolder && activeSection === 'drive' && (
              <>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className="font-medium text-gray-900 truncate">
                  {folders.find(f => f.id === activeFolder)?.name}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-1">
               <Button variant="ghost" size="sm" onClick={handleUploadClick}>
                 <UploadCloud className="w-5 h-5" />
               </Button>
            </div>

            <div className="relative w-32 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Поиск..." 
                className="pl-9 h-9 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center border rounded-lg p-1 bg-gray-50 shrink-0">
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          
          {/* Folders Section (Visible on Drive Root) */}
          {activeSection === 'drive' && !activeFolder && !searchQuery && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm font-semibold text-gray-900">Папки</h2>
                 <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 md:hidden" onClick={() => setIsNewFolderOpen(true)}>
                   <Plus className="w-4 h-4 mr-1" /> Создать
                 </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {folders.map(folder => (
                  <div 
                    key={folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                    className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all flex items-center gap-4"
                  >
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shrink-0", folder.bg)}>
                      <Folder className={cn("w-6 h-6", folder.color)} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 group-hover:text-purple-700 truncate">
                        {folder.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {folder.count} файлов
                      </div>
                    </div>
                  </div>
                ))}
                {/* Create New Folder Button (Desktop) */}
                <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
                  <DialogTrigger asChild>
                    <div className="hidden md:flex border-2 border-dashed border-gray-200 rounded-xl items-center justify-center p-4 cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors text-gray-400 hover:text-purple-600">
                      <div className="flex flex-col items-center">
                         <Plus className="w-6 h-6 mb-1" />
                         <span className="text-xs font-medium">Новая папка</span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Создать папку</DialogTitle>
                      <DialogDescription>
                        Введите название для новой папки.
                      </DialogDescription>
                    </DialogHeader>
                    <Input 
                      value={newFolderName} 
                      onChange={(e) => setNewFolderName(e.target.value)} 
                      placeholder="Название папки" 
                    />
                    <DialogFooter>
                      <Button onClick={handleCreateFolder}>Создать</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {/* Files Section */}
          <div>
             <h2 className="text-sm font-semibold text-gray-900 mb-4">
               {searchQuery ? `Результаты поиска: "${searchQuery}"` :
                activeSection === 'drive' && activeFolder ? folders.find(f => f.id === activeFolder)?.name :
                activeSection === 'recent' ? 'Недавние файлы' :
                activeSection === 'starred' ? 'Избранное' :
                activeSection === 'trash' ? 'Корзина' : 'Файлы'}
             </h2>
             
             {viewMode === 'grid' ? (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {currentFiles.length > 0 ? currentFiles.map(file => (
                   <ContextMenu key={file.id}>
                     <ContextMenuTrigger>
                       <div 
                         className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all relative h-full flex flex-col"
                         onDoubleClick={() => setPreviewFile(file)}
                       >
                          <div className="flex justify-between items-start mb-3">
                             <div className="p-3 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                                {getIcon(file.type)}
                             </div>
                             {file.starred && !file.deleted && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                          </div>
                          <h3 className="font-medium text-sm text-gray-900 truncate mb-1" title={file.name}>
                            {file.name}
                          </h3>
                          <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
                             <span>{file.size}</span>
                             <span>{file.date}</span>
                          </div>
                          
                          {/* Mobile/Touch Dropdown */}
                          <div className="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white shadow-sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {activeSection === 'trash' ? (
                                  <>
                                    <DropdownMenuItem onClick={() => restoreFromTrash(file.id)}>
                                      Восстановить
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => deletePermanently(file.id)}>
                                      Удалить навсегда
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <>
                                    <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                                      <Eye className="w-4 h-4 mr-2" /> Просмотр
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Скачать</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setRenamingFile(file); setNewName(file.name) }}>
                                      Переименовать
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toggleStar(file.id)}>
                                      {file.starred ? 'Убрать из избранного' : 'В избранное'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => moveToTrash(file.id)}>
                                      Удалить
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                       </div>
                     </ContextMenuTrigger>
                     <ContextMenuContent>
                        <ContextMenuLabel>{file.name}</ContextMenuLabel>
                        <ContextMenuSeparator />
                        {activeSection === 'trash' ? (
                          <>
                            <ContextMenuItem onClick={() => restoreFromTrash(file.id)}>
                              <Clock className="w-4 h-4 mr-2" /> Восстановить
                            </ContextMenuItem>
                            <ContextMenuItem className="text-red-600" onClick={() => deletePermanently(file.id)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Удалить навсегда
                            </ContextMenuItem>
                          </>
                        ) : (
                          <>
                            <ContextMenuItem onClick={() => setPreviewFile(file)}>
                              <Eye className="w-4 h-4 mr-2" /> Просмотр
                            </ContextMenuItem>
                            <ContextMenuItem>
                              <Download className="w-4 h-4 mr-2" /> Скачать
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => { setRenamingFile(file); setNewName(file.name) }}>
                              <Pencil className="w-4 h-4 mr-2" /> Переименовать
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => toggleStar(file.id)}>
                              <Star className={cn("w-4 h-4 mr-2", file.starred ? "fill-yellow-400 text-yellow-400" : "")} />
                              {file.starred ? 'Убрать из избранного' : 'В избранное'}
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem className="text-red-600" onClick={() => moveToTrash(file.id)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Удалить
                            </ContextMenuItem>
                          </>
                        )}
                     </ContextMenuContent>
                   </ContextMenu>
                 )) : (
                   <div className="col-span-full py-12 text-center text-gray-400">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Search className="w-8 h-8 opacity-20" />
                     </div>
                     <p>Здесь пока пусто</p>
                   </div>
                 )}
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
                       <ContextMenu key={file.id}>
                         <ContextMenuTrigger asChild>
                           <tr 
                            className="border-b border-gray-50 hover:bg-purple-50/50 transition-colors group cursor-pointer"
                            onDoubleClick={() => setPreviewFile(file)}
                           >
                             <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-3">
                                {getIcon(file.type)}
                                {file.name}
                                {file.starred && !file.deleted && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                             </td>
                             <td className="px-6 py-3 text-gray-500">{file.size}</td>
                             <td className="px-6 py-3 text-gray-500">{file.date}</td>
                             <td className="px-6 py-3 text-right">
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {/* Copy-paste same menu logic */}
                                    {activeSection === 'trash' ? (
                                      <>
                                        <DropdownMenuItem onClick={() => restoreFromTrash(file.id)}>Восстановить</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => deletePermanently(file.id)}>Удалить навсегда</DropdownMenuItem>
                                      </>
                                    ) : (
                                      <>
                                        <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                                          <Eye className="w-4 h-4 mr-2" /> Просмотр
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Скачать</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { setRenamingFile(file); setNewName(file.name) }}>Переименовать</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toggleStar(file.id)}>{file.starred ? 'Убрать из избранного' : 'В избранное'}</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" onClick={() => moveToTrash(file.id)}>Удалить</DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                               </DropdownMenu>
                             </td>
                           </tr>
                         </ContextMenuTrigger>
                         <ContextMenuContent>
                            {/* Same Context Menu Content */}
                            <ContextMenuLabel>{file.name}</ContextMenuLabel>
                            <ContextMenuSeparator />
                            {activeSection === 'trash' ? (
                              <>
                                <ContextMenuItem onClick={() => restoreFromTrash(file.id)}>Восстановить</ContextMenuItem>
                                <ContextMenuItem className="text-red-600" onClick={() => deletePermanently(file.id)}>Удалить навсегда</ContextMenuItem>
                              </>
                            ) : (
                              <>
                                <ContextMenuItem onClick={() => setPreviewFile(file)}>
                                  <Eye className="w-4 h-4 mr-2" /> Просмотр
                                </ContextMenuItem>
                                <ContextMenuItem>Скачать</ContextMenuItem>
                                <ContextMenuItem onClick={() => { setRenamingFile(file); setNewName(file.name) }}>Переименовать</ContextMenuItem>
                                <ContextMenuItem onClick={() => toggleStar(file.id)}>
                                  {file.starred ? 'Убрать из избранного' : 'В избранное'}
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem className="text-red-600" onClick={() => moveToTrash(file.id)}>Удалить</ContextMenuItem>
                              </>
                            )}
                         </ContextMenuContent>
                       </ContextMenu>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!renamingFile} onOpenChange={(open) => !open && setRenamingFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать файл</DialogTitle>
          </DialogHeader>
          <Input 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            placeholder="Новое имя" 
          />
          <DialogFooter>
            <Button onClick={handleRename}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-none">
          <div className="relative w-full h-[80vh] flex flex-col items-center justify-center">
             <DialogHeader className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
               <div className="flex items-center justify-between text-white">
                 <DialogTitle className="text-lg font-medium truncate pr-8">
                   {previewFile?.name}
                 </DialogTitle>
               </div>
             </DialogHeader>
             
             <div className="w-full h-full flex items-center justify-center overflow-hidden">
               {previewFile?.type === 'image' && previewFile.url ? (
                 <img 
                   src={previewFile.url} 
                   alt={previewFile.name} 
                   className="max-w-full max-h-full object-contain"
                 />
               ) : previewFile?.type === 'video' && previewFile.url ? (
                 <video 
                   src={previewFile.url} 
                   controls 
                   className="max-w-full max-h-full"
                   autoPlay
                 />
               ) : previewFile?.type === 'audio' && previewFile.url ? (
                 <div className="w-full max-w-md p-8 bg-white/10 rounded-xl backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4">
                      <Music className="w-24 h-24 text-white opacity-80" />
                      <audio 
                        src={previewFile.url} 
                        controls 
                        className="w-full" 
                      />
                    </div>
                 </div>
               ) : (
                 <div className="text-center text-white">
                    <FileText className="w-24 h-24 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-4">Предпросмотр недоступен</p>
                    <Button variant="secondary" onClick={() => window.open(previewFile?.url, '_blank')}>
                      <Download className="w-4 h-4 mr-2" /> Скачать файл
                    </Button>
                 </div>
               )}
             </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
