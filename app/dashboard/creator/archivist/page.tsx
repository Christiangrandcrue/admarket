'use client'
import { FileText, Download, Search, Folder } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ArchivistPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Архивариус</h1>
          <p className="text-gray-500">Ваши документы, файлы и медиа-библиотека.</p>
        </div>
        <div className="w-64">
          <Input placeholder="Поиск файлов..." />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-purple-50 p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-purple-100 transition-colors">
          <Folder className="w-12 h-12 text-purple-500 mb-3" />
          <span className="font-medium text-purple-900">Договоры</span>
          <span className="text-xs text-purple-600">12 файлов</span>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-100 transition-colors">
          <Folder className="w-12 h-12 text-blue-500 mb-3" />
          <span className="font-medium text-blue-900">Медиа</span>
          <span className="text-xs text-blue-600">1.2 GB</span>
        </div>
        <div className="bg-orange-50 p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-orange-100 transition-colors">
          <Folder className="w-12 h-12 text-orange-500 mb-3" />
          <span className="font-medium text-orange-900">Счета</span>
          <span className="text-xs text-orange-600">5 файлов</span>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors">
          <Folder className="w-12 h-12 text-gray-500 mb-3" />
          <span className="font-medium text-gray-900">Разное</span>
          <span className="text-xs text-gray-600">0 файлов</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 font-medium text-gray-500 text-sm flex justify-between">
           <span>Имя файла</span>
           <span>Дата</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50">
             <div className="flex items-center gap-3">
               <FileText className="w-5 h-5 text-gray-400" />
               <span className="text-gray-700">Договор оферты #{1000+i}.pdf</span>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">29.11.2025</span>
                <Download className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-900" />
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
