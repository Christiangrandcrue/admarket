'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Settings, Shield, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      setRole(user.user_metadata?.role || 'advertiser')
    }
    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) {
    return <div className="p-8 text-center">Загрузка...</div>
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Общие настройки аккаунта</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Учетная запись
            </CardTitle>
            <CardDescription>Управление входом и безопасностью</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Текущая роль</div>
                <div className="font-medium capitalize">
                  {role === 'creator' ? 'Креатор' : 'Рекламодатель'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <Button variant="outline" onClick={handleSignOut} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                <LogOut className="w-4 h-4 mr-2" />
                Выйти из аккаунта
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Настройки кабинета
            </CardTitle>
            <CardDescription>Перейти к специфичным настройкам вашей роли</CardDescription>
          </CardHeader>
          <CardContent>
            {role === 'creator' ? (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-purple-50 border-purple-100">
                <div>
                  <h3 className="font-semibold text-purple-900">Профиль Креатора</h3>
                  <p className="text-sm text-purple-700">Настройка аватара, био, соцсетей и Trust Rank</p>
                </div>
                <Link href="/dashboard/creator/profile">
                  <Button className="bg-purple-600 hover:bg-purple-700">Открыть</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-100">
                <div>
                  <h3 className="font-semibold text-blue-900">Профиль компании</h3>
                  <p className="text-sm text-blue-700">Настройка реквизитов и данных организации</p>
                </div>
                <Button variant="outline" disabled>В разработке</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Приватность
            </CardTitle>
            <CardDescription>Управление данными</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-gray-500 mb-4">
               Вы можете запросить архив своих данных или удаление аккаунта через поддержку.
             </p>
             <Button variant="ghost" size="sm">Связаться с поддержкой</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
