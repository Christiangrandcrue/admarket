'use client'

import { useState, useRef, useEffect } from 'react'
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
  Eye
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
import { createClient } from "@/lib/supabase/client"

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
  timestamp: number
  url?: string
  storagePath: string
}

interface FolderItem {
  id: string
  name: string
  count: number
  color: string
  bg: string
}

export default function ArchivistPage() {
  const supabase = createClient()
  
  // State
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'drive' | 'recent' | 'starred' | 'trash'>('drive')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Dialogs
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null)
  const [newName, setNewName] = useState('')
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Real Data Fetching ---
  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch Folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (foldersError) console.error('Error fetching folders:', foldersError)

      // Fetch Files
      const { data: filesData, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filesError) console.error('Error fetching files:', filesError)

      // Transform Data
      if (foldersData) {
        const formattedFolders = foldersData.map(f => ({
          id: f.id,
          name: f.name,
          count: 0, // Calculated locally
          color: f.color || 'text-blue-500',
          bg: f.bg || 'bg-blue-50'
        }))
        // Update counts based on files
        if (filesData) {
          formattedFolders.forEach(folder => {
            folder.count = filesData.filter((file: any) => file.folder_id === folder.id && !file.is_deleted).length
          })
        }
        setFolders(formattedFolders)
      }

      if (filesData) {
        const formattedFiles = filesData.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type as FileType,
          size: f.size,
          date: new Date(f.created_at).toLocaleDateString('ru-RU'),
          folderId: f.folder_id,
          starred: f.starred,
          deleted: f.is_deleted,
          timestamp: new Date(f.created_at).getTime(),
          storagePath: f.storage_path
        }))
        setFiles(formattedFiles)
      }

    } catch (error) {
      console.error('Error loading archivist data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- Logic ---

  const getFilteredFiles = () => {
    let filtered = files

    if (searchQuery) {
      filtered = filtered.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    switch (activeSection) {
      case 'drive':
        filtered = filtered.filter(f => !f.deleted && f.folderId === activeFolder)
        break
      case 'recent':
        filtered = filtered.filter(f => !f.deleted).sort((a, b) => b.timestamp - a.timestamp)
        break
      case 'starred':
        filtered = filtered.filter(f => !f.deleted && f.starred)
        break
      case 'trash':
        filtered = filtered.filter(f => f.deleted)
        break
    }
    return filtered
  }

  const currentFiles = getFilteredFiles()

  // Real Upload
  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(10) // Initial progress

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthorized')

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // 1. Upload to Storage
      setUploadProgress(30)
      const { error: uploadError } = await supabase.storage
        .from('archivist')
        .upload(filePath, file)

      if (uploadError) throw uploadError
      setUploadProgress(70)

      // 2. Determine type
      let type: FileType = 'document'
      if (file.type.startsWith('image/')) type = 'image'
      else if (file.type.startsWith('video/')) type = 'video'
      else if (file.type.startsWith('audio/')) type = 'audio'

      const sizeStr = (file.size / 1024 / 1024).toFixed(1) + ' MB'

      // 3. Insert Metadata
      const { data: newFileMeta, error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          name: file.name,
          size: sizeStr,
          type: type,
          storage_path: filePath,
          folder_id: activeFolder
        })
        .select()
        .single()

      if (dbError) throw dbError
      
      setUploadProgress(100)
      
      // Refresh List locally to feel fast
      const newLocalFile: FileItem = {
        id: newFileMeta.id,
        name: newFileMeta.name,
        type: newFileMeta.type as FileType,
        size: newFileMeta.size,
        date: new Date().toLocaleDateString('ru-RU'),
        folderId: newFileMeta.folder_id,
        starred: false,
        deleted: false,
        timestamp: Date.now(),
        storagePath: newFileMeta.storage_path
      }
      setFiles([newLocalFile, ...files])
      
      // Update folder count
      if (activeFolder) {
        setFolders(folders.map(f => f.id === activeFolder ? { ...f, count: f.count + 1 } : f))
      }

    } catch (error: any) {
      console.error('Upload failed:', error)
      alert('Ошибка загрузки: ' + error.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = '' // Reset input
    }
  }

  // Real Create Folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: newFolder, error } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name: newFolderName,
          color: 'text-gray-500',
          bg: 'bg-gray-50'
        })
        .select()
        .single()

      if (error) throw error

      const localFolder: FolderItem = {
        id: newFolder.id,
        name: newFolder.name,
        count: 0,
        color: newFolder.color,
        bg: newFolder.bg
      }

      setFolders([localFolder, ...folders])
      setNewFolderName('')
      setIsNewFolderOpen(false)
    } catch (error: any) {
      console.error('Error creating folder:', error)
      alert('Ошибка создания папки')
    }
  }

  // Real Interactions
  const toggleStar = async (id: string) => {
    const file = files.find(f => f.id === id)
    if (!file) return
    
    // Optimistic Update
    const newStatus = !file.starred
    setFiles(files.map(f => f.id === id ? { ...f, starred: newStatus } : f))

    await supabase.from('files').update({ starred: newStatus }).eq('id', id)
  }

  const moveToTrash = async (id: string) => {
    // Optimistic
    setFiles(files.map(f => f.id === id ? { ...f, deleted: true } : f))
    await supabase.from('files').update({ is_deleted: true }).eq('id', id)
  }

  const restoreFromTrash = async (id: string) => {
    // Optimistic
    setFiles(files.map(f => f.id === id ? { ...f, deleted: false } : f))
    await supabase.from('files').update({ is_deleted: false }).eq('id', id)
  }

  const deletePermanently = async (id: string) => {
    const file = files.find(f => f.id === id)
    if (!file) return

    // Optimistic
    setFiles(files.filter(f => f.id !== id))

    // 1. Delete from Storage
    await supabase.storage.from('archivist').remove([file.storagePath])
    // 2. Delete from DB
    await supabase.from('files').delete().eq('id', id)
  }

  const handleRename = async () => {
    if (!renamingFile || !newName.trim()) return
    
    // Optimistic
    setFiles(files.map(f => f.id === renamingFile.id ? { ...f, name: newName } : f))
    setRenamingFile(null)
    setNewName('')

    await supabase.from('files').update({ name: newName }).eq('id', renamingFile.id)
  }

  // Preview Logic (Get Signed URL)
  const handlePreview = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('archivist')
        .createSignedUrl(file.storagePath, 3600) // 1 hour

      if (error) throw error

      setPreviewFile({ ...file, url: data.signedUrl })
    } catch (error) {
      console.error('Error getting signed url:', error)
      alert('Не удалось открыть файл. Возможно, он был удален.')
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('archivist')
        .createSignedUrl(file.storagePath, 60, { download: true }) // Download disposition

      if (error) throw error
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  // --- UI Helpers ---
  const getIcon = (type: FileType) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8 text-purple-500" />
      case 'video': return <Video className="w-8 h-8 text-red-500" />
      case 'audio': return <Music className="w-8 h-8 text-pink-500" />
      case 'folder': return <Folder className="w-8 h-8 text-blue-500" />
      default: return <FileText className="w-8 h-8 text-gray-500" />
    }
  }

  // Dummy calculation
  const usedStorage = files.length * 0.05 
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
             
             {loading && files.length === 0 ? (
               <div className="py-12 text-center text-gray-400">Загрузка...</div>
             ) : viewMode === 'grid' ? (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {currentFiles.length > 0 ? currentFiles.map(file => (
                   <ContextMenu key={file.id}>
                     <ContextMenuTrigger>
                       <div 
                         className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all relative h-full flex flex-col"
                         onDoubleClick={() => handlePreview(file)}
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
                                    <DropdownMenuItem onClick={() => handlePreview(file)}>
                                      <Eye className="w-4 h-4 mr-2" /> Просмотр
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownload(file)}>Скачать</DropdownMenuItem>
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
                            <ContextMenuItem onClick={() => handlePreview(file)}>
                              <Eye className="w-4 h-4 mr-2" /> Просмотр
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleDownload(file)}>
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
                            onDoubleClick={() => handlePreview(file)}
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
                                    {activeSection === 'trash' ? (
                                      <>
                                        <DropdownMenuItem onClick={() => restoreFromTrash(file.id)}>Восстановить</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => deletePermanently(file.id)}>Удалить навсегда</DropdownMenuItem>
                                      </>
                                    ) : (
                                      <>
                                        <DropdownMenuItem onClick={() => handlePreview(file)}>
                                          <Eye className="w-4 h-4 mr-2" /> Просмотр
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDownload(file)}>Скачать</DropdownMenuItem>
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
                            <ContextMenuLabel>{file.name}</ContextMenuLabel>
                            <ContextMenuSeparator />
                            {activeSection === 'trash' ? (
                              <>
                                <ContextMenuItem onClick={() => restoreFromTrash(file.id)}>Восстановить</ContextMenuItem>
                                <ContextMenuItem className="text-red-600" onClick={() => deletePermanently(file.id)}>Удалить навсегда</ContextMenuItem>
                              </>
                            ) : (
                              <>
                                <ContextMenuItem onClick={() => handlePreview(file)}>
                                  <Eye className="w-4 h-4 mr-2" /> Просмотр
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => handleDownload(file)}>Скачать</ContextMenuItem>
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
