'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { DashboardSidebar } from './sidebar'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close sheet on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="md:hidden sticky top-0 z-40 border-b border-gray-200 bg-white px-4 h-16 flex items-center justify-between">
      <div className="font-bold text-lg text-gray-900">AdMarket</div>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
           <DashboardSidebar mobile />
        </SheetContent>
      </Sheet>
    </div>
  )
}
