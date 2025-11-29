'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Repeat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function RoleSwitcher() {
  const [currentRole, setCurrentRole] = useState<string>('advertiser')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkRole()
  }, [])

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.role) {
      setCurrentRole(user.user_metadata.role)
    }
  }

  const toggleRole = async () => {
    const newRole = currentRole === 'advertiser' ? 'creator' : 'advertiser'
    
    // 1. Update local state
    setCurrentRole(newRole)

    // 2. Save to LocalStorage for Sidebar persistence
    localStorage.setItem('dashboard_role_override', newRole)
    
    // 3. Dispatch event for immediate Sidebar update (no reload needed if on same page type)
    window.dispatchEvent(new Event('dashboard-role-change'))

    // 4. Update Supabase (optional, for server consistency)
    await supabase.auth.updateUser({
      data: { role: newRole }
    })

    // 5. Navigate to the correct dashboard root
    const targetPath = newRole === 'creator' ? '/dashboard/creator' : '/dashboard/campaigns'
    router.push(targetPath)
  }

  return (
    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full flex gap-2 text-xs border-dashed border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100"
        onClick={toggleRole}
      >
        <Repeat className="w-3 h-3" />
        Сменить роль ({currentRole === 'advertiser' ? 'Рекл.' : 'Креатор'})
      </Button>
      <div className="text-[10px] text-center text-gray-400 mt-1">
        (Только для тестов)
      </div>
    </div>
  )
}
