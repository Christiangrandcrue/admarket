'use client'

import Link from 'next/link'
import { HeaderAuth } from './header-auth'
import { Menu, X, Repeat } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false) // Or simply enable for all for now
  const [role, setRole] = useState<string>('advertiser')
  const router = useRouter()

  // Check if user is admin or simply enable for all during testing
  useEffect(() => {
      // For testing purposes, we make this button available to everyone in the header
      // to ensure the user can switch roles even if sidebar is broken.
      setIsAdmin(true) 
      const savedRole = localStorage.getItem('dashboard_role_override')
      if (savedRole) setRole(savedRole)
  }, [])

  const toggleRole = async () => {
    const supabase = createClient()
    const newRole = role === 'advertiser' ? 'creator' : 'advertiser'
    
    setRole(newRole)
    localStorage.setItem('dashboard_role_override', newRole)
    window.dispatchEvent(new Event('dashboard-role-change'))
    
    await supabase.auth.updateUser({
      data: { role: newRole }
    })
    
    const targetPath = newRole === 'creator' ? '/dashboard/creator' : '/dashboard/campaigns'
    router.push(targetPath)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">
            AdMarket
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/catalog" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Каталог креаторов
            </Link>
            <Link href="/dashboard/campaigns" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Мои кампании
            </Link>
            <Link href="/dashboard/analytics" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Аналитика
            </Link>
            <Link href="/messages" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Сообщения
            </Link>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
           {/* ADMIN SWITCHER IN HEADER */}
           <Button 
             variant="outline" 
             size="sm" 
             onClick={toggleRole}
             className="border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700"
           >
             <Repeat className="w-4 h-4 mr-2" />
             {role === 'advertiser' ? '→ Креатор' : '→ Рекламодатель'}
           </Button>

          <HeaderAuth />
        </div>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {/* Mobile Role Switcher */}
             <Button 
               variant="outline" 
               onClick={toggleRole}
               className="w-full border-red-200 text-red-600 bg-red-50"
             >
               Сменить роль ({role})
             </Button>

            <Link href="/catalog" className="text-sm font-medium">
              Каталог креаторов
            </Link>
            <Link href="/dashboard/campaigns" className="text-sm font-medium">
              Мои кампании
            </Link>
            <Link href="/dashboard/analytics" className="text-sm font-medium">
              Аналитика
            </Link>
            <Link href="/messages" className="text-sm font-medium">
              Сообщения
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Начать</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
