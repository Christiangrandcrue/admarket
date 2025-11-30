'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Megaphone, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RoleSelectionPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const selectRole = async (role: 'advertiser' | 'creator') => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Пользователь не найден. Пожалуйста, войдите снова.')
        router.push('/auth/login')
        return
      }

      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: { 
            role: role,
            status: 'active' // Auto-activate for MVP
        }
      })

      if (error) throw error

      toast.success('Роль выбрана!')
      
      // Force refresh to ensure middleware/layout picks up the new role
      window.location.href = role === 'creator' ? '/dashboard/creator' : '/dashboard/campaigns'

    } catch (error) {
      console.error(error)
      toast.error('Ошибка сохранения роли')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full grid gap-8 md:grid-cols-2">
        
        {/* Advertiser Card */}
        <Card className="cursor-pointer hover:border-purple-500 transition-all hover:shadow-lg" onClick={() => selectRole('advertiser')}>
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                <Megaphone className="w-6 h-6" />
            </div>
            <CardTitle>Я Рекламодатель</CardTitle>
            <CardDescription>Хочу запустить кампанию и найти блогеров</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Доступ к каталогу</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Запуск кампаний</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Безопасная сделка</li>
            </ul>
          </CardContent>
        </Card>

        {/* Creator Card */}
        <Card className="cursor-pointer hover:border-blue-500 transition-all hover:shadow-lg" onClick={() => selectRole('creator')}>
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                <User className="w-6 h-6" />
            </div>
            <CardTitle>Я Креатор</CardTitle>
            <CardDescription>Хочу монетизировать свой блог</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Прием заявок</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Гарантия оплаты</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Инструменты AI</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
