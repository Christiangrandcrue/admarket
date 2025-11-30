'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Search, ShieldAlert } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'advertiser' | 'creator' | 'admin'
  status: 'new' | 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) throw error

      toast.success(`Пользователь ${newStatus === 'approved' ? 'одобрен' : 'отклонен'}`)
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Ошибка обновления статуса')
    }
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Управление пользователями</h2>
            <p className="text-gray-500">Модерация доступа к платформе</p>
        </div>
        <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
                placeholder="Поиск по email..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600">Ожидают проверки</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                    {users.filter(u => u.status === 'pending').length}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Активные</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.status === 'approved' || u.status === 'active').length}
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата регистрации</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.full_name || 'Без имени'}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </TableCell>
                <TableCell>
                    {user.role === 'advertiser' && <Badge variant="outline" className="bg-purple-50 text-purple-700">Рекламодатель</Badge>}
                    {user.role === 'creator' && <Badge variant="outline" className="bg-blue-50 text-blue-700">Креатор</Badge>}
                    {user.role === 'admin' && <Badge variant="default" className="bg-gray-900">Админ</Badge>}
                </TableCell>
                <TableCell>
                    {user.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">На проверке</Badge>}
                    {(user.status === 'approved' || user.status === 'active') && <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Активен</Badge>}
                    {user.status === 'rejected' && <Badge variant="destructive">Отклонен</Badge>}
                    {user.status === 'new' && <Badge variant="secondary">Новый</Badge>}
                </TableCell>
                <TableCell>
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell className="text-right">
                    {user.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateUserStatus(user.id, 'approved')}>
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Одобрить
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateUserStatus(user.id, 'rejected')}>
                                <XCircle className="w-4 h-4 mr-1" /> Откл.
                            </Button>
                        </div>
                    )}
                    {user.status === 'approved' && (
                         <Button size="sm" variant="ghost" className="text-gray-400" disabled>
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Одобрено
                        </Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && !loading && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Пользователи не найдены
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
