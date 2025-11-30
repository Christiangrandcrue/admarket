'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Megaphone, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RoleSelectionPage() {
  const [loading, setLoading] = useState<string | null>(null) // 'advertiser' | 'creator' | null
  const router = useRouter()
  const supabase = createClient()

  const selectRole = async (role: 'advertiser' | 'creator') => {
    if (loading) return // Prevent double clicks

    try {
      setLoading(role)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Пользователь не найден. Пожалуйста, войдите снова.')
        router.push('/auth/login')
        return
      }

      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
            role: role,
            status: 'active' // Auto-activate for MVP
        }
      })

      if (authError) throw authError

      // CRITICAL: Use UPSERT to handle both existing and missing rows
      // This ensures the profile exists and has the correct status
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
            id: user.id,
            role: role, 
            status: 'active',
            updated_at: new Date().toISOString()
        })
        .select()

      if (profileError) {
        console.error('Profile update error:', profileError)
        toast.error(`Ошибка обновления профиля: ${profileError.message}`)
        setLoading(null)
        return
      }

      // Double check: Read it back to confirm
      const { data: checkProfile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single()
      
      if (!checkProfile || checkProfile.role !== role) {
         toast.error('Не удалось подтвердить сохранение роли. Попробуйте еще раз.')
         setLoading(null)
         return
      }

      toast.success('Роль выбрана! Переходим в кабинет...')
      
      // Save to localStorage for sidebar consistency
      localStorage.setItem('dashboard_role_override', role)
      
      // Force hard reload to clear any stale middleware caches
      const targetUrl = role === 'creator' ? '/dashboard/creator' : '/dashboard/campaigns'
      window.location.href = targetUrl // Use standard navigation instead of router for hard switch

    } catch (error) {
      console.error(error)
      toast.error('Ошибка сохранения роли')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full grid gap-8 md:grid-cols-2">
        
        {/* Advertiser Card */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg relative overflow-hidden ${loading ? 'opacity-50 pointer-events-none' : 'hover:border-purple-500'}`}
          onClick={() => selectRole('advertiser')}
        >
          {loading === 'advertiser' && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          )}
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
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg relative overflow-hidden ${loading ? 'opacity-50 pointer-events-none' : 'hover:border-blue-500'}`}
          onClick={() => selectRole('creator')}
        >
          {loading === 'creator' && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
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
