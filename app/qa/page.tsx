'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, XCircle, AlertCircle, Save } from 'lucide-react'
import { toast } from 'sonner'

type Status = 'pending' | 'success' | 'error'

interface TestItem {
  id: string
  title: string
  description: string
  status: Status
  notes: string
}

interface TestBlock {
  id: string
  title: string
  description: string
  items: TestItem[]
}

const INITIAL_DATA: TestBlock[] = [
  {
    id: 'block-1',
    title: 'Блок 1: Авторизация и Навигация',
    description: 'Базовый функционал входа и перемещения по приложению.',
    items: [
      { id: '1.1', title: 'Вход/Регистрация', description: 'Проверка работы страницы /login (или Auth компонента).', status: 'pending', notes: '' },
      { id: '1.2', title: 'Выбор роли', description: 'Корректно ли переключается интерфейс (Рекламодатель <-> Креатор).', status: 'pending', notes: '' },
      { id: '1.3', title: 'Сайдбар (Sidebar)', description: 'Не исчезают ли пункты меню при перезагрузке страницы (F5).', status: 'pending', notes: '' },
      { id: '1.4', title: 'Сохранение состояния', description: 'Запоминает ли система выбранную роль после закрытия вкладки.', status: 'pending', notes: '' },
    ]
  },
  {
    id: 'block-2',
    title: 'Блок 2: Рекламодатель — Создание Кампании',
    description: 'Ключевой функционал для бизнеса.',
    items: [
      { id: '2.1', title: 'Визард (Step 1 - Цели)', description: 'Выбор цели кампании. Валидация обязательных полей.', status: 'pending', notes: '' },
      { id: '2.2', title: 'Визард (Step 2 - Каналы)', description: 'Выбор соцсети (Instagram/YouTube/Telegram).', status: 'pending', notes: '' },
      { id: '2.3', title: 'Визард (Step 3 - Бюджет)', description: 'Ввод бюджета. Проверка на ввод отрицательных чисел.', status: 'pending', notes: '' },
      { id: '2.4', title: 'Визард (Step 4 - Детали)', description: 'Ввод описания. Проверка сохранения в БД (поле description).', status: 'pending', notes: '' },
      { id: '2.5', title: 'Финал и Редирект', description: 'Нажатие "Запустить". Редирект на список кампаний.', status: 'pending', notes: '' },
      { id: '2.6', title: 'Запись в БД', description: 'Появление новой записи в таблице campaigns со статусом active.', status: 'pending', notes: '' },
      { id: '2.7', title: 'Список кампаний', description: 'Отображение созданной кампании на /dashboard/campaigns с верными данными.', status: 'pending', notes: '' },
    ]
  },
  {
    id: 'block-3',
    title: 'Блок 3: Креатор — Архивариус',
    description: 'Управление файлами и хранилищем.',
    items: [
      { id: '3.1', title: 'Загрузка изображения', description: 'Загрузка PNG/JPG. Появление в списке.', status: 'pending', notes: '' },
      { id: '3.2', title: 'Загрузка видео', description: 'Загрузка видео. Проверка превью.', status: 'pending', notes: '' },
      { id: '3.3', title: 'Папки', description: 'Создание папки. Вход внутрь. Загрузка файла в папку.', status: 'pending', notes: '' },
      { id: '3.4', title: 'Контекстное меню', description: 'Правый клик -> Переименовать, В избранное, Удалить.', status: 'pending', notes: '' },
      { id: '3.5', title: 'Корзина и Восстановление', description: 'Удаление в корзину и восстановление оттуда.', status: 'pending', notes: '' },
      { id: '3.6', title: 'Quick View', description: 'Двойной клик -> Просмотр файла без скачивания.', status: 'pending', notes: '' },
    ]
  },
  {
    id: 'block-4',
    title: 'Блок 4: Финансы и Кошелек',
    description: 'Баланс и транзакции.',
    items: [
      { id: '4.1', title: 'Страница Кошелька', description: 'Страница /dashboard/wallet открывается без ошибок 500.', status: 'pending', notes: '' },
      { id: '4.2', title: 'Пополнение (Top Up)', description: 'Ввод суммы -> Кнопка Оплатить -> Обновление баланса.', status: 'pending', notes: '' },
      { id: '4.3', title: 'История операций', description: 'Появление новой записи Deposit в таблице.', status: 'pending', notes: '' },
    ]
  },
  {
    id: 'block-5',
    title: 'Блок 5: Чат и Сообщения',
    description: 'Коммуникация между пользователями.',
    items: [
      { id: '5.1', title: 'Список чатов', description: 'Страница /messages открывается.', status: 'pending', notes: '' },
      { id: '5.2', title: 'Отправка сообщения', description: 'Ввод текста -> Enter -> Сообщение появляется.', status: 'pending', notes: '' },
    ]
  }
]

export default function QAPage() {
  const [blocks, setBlocks] = useState<TestBlock[]>(INITIAL_DATA)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('qa_checklist_v1')
    if (saved) {
      try {
        setBlocks(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved QA data', e)
      }
    }
  }, [])

  // Save to localStorage whenever blocks change
  useEffect(() => {
    localStorage.setItem('qa_checklist_v1', JSON.stringify(blocks))
  }, [blocks])

  const updateStatus = (blockIndex: number, itemIndex: number, status: Status) => {
    const newBlocks = [...blocks]
    newBlocks[blockIndex].items[itemIndex].status = status
    setBlocks(newBlocks)
  }

  const updateNotes = (blockIndex: number, itemIndex: number, notes: string) => {
    const newBlocks = [...blocks]
    newBlocks[blockIndex].items[itemIndex].notes = notes
    setBlocks(newBlocks)
  }

  const resetAll = () => {
    if (confirm('Сбросить весь прогресс тестирования?')) {
      setBlocks(INITIAL_DATA)
      toast.info('Прогресс сброшен')
    }
  }

  const calculateProgress = () => {
    let total = 0
    let completed = 0
    blocks.forEach(block => {
      block.items.forEach(item => {
        total++
        if (item.status === 'success') completed++
      })
    })
    return Math.round((completed / total) * 100) || 0
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QA Dashboard</h1>
            <p className="text-gray-500 mt-1">Система контроля качества и приемки (UAT)</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{calculateProgress()}%</div>
                <div className="text-xs text-gray-500">Готовность</div>
             </div>
             <Button variant="outline" onClick={resetAll}>Сбросить</Button>
          </div>
        </div>

        {blocks.map((block, blockIndex) => (
          <Card key={block.id} className="shadow-sm">
            <CardHeader className="bg-white border-b">
              <CardTitle className="flex items-center gap-2">
                {block.title}
              </CardTitle>
              <CardDescription>{block.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {block.items.map((item, itemIndex) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <span className="text-gray-400 text-sm w-8">{item.id}</span>
                          {item.title}
                        </div>
                        <p className="text-sm text-gray-600 pl-10">{item.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant={item.status === 'success' ? 'default' : 'outline'}
                          size="sm"
                          className={item.status === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
                          onClick={() => updateStatus(blockIndex, itemIndex, 'success')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          ОК
                        </Button>
                        
                        <Button
                          variant={item.status === 'error' ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => updateStatus(blockIndex, itemIndex, 'error')}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Баг
                        </Button>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {(item.status === 'error' || item.notes) && (
                      <div className="mt-4 pl-10">
                        <Textarea
                          placeholder="Опишите ошибку или поведение системы..."
                          value={item.notes}
                          onChange={(e) => updateNotes(blockIndex, itemIndex, e.target.value)}
                          className="min-h-[80px] bg-red-50 border-red-100 text-gray-800 focus:border-red-300 focus:ring-red-200"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  )
}
