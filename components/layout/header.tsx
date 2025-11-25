'use client'

import Link from 'next/link'
import { HeaderAuth } from './header-auth'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">
            AdMarket
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/catalog" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Каталог
            </Link>
            <Link href="/campaigns" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Кампании
            </Link>
            <Link href="/creator/proposals" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Предложения
            </Link>
            <Link href="/cases" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Кейсы
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Цены
            </Link>
            <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Блог
            </Link>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
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
            <Link href="/catalog" className="text-sm font-medium">
              Каталог
            </Link>
            <Link href="/campaigns" className="text-sm font-medium">
              Кампании
            </Link>
            <Link href="/creator/proposals" className="text-sm font-medium">
              Предложения
            </Link>
            <Link href="/cases" className="text-sm font-medium">
              Кейсы
            </Link>
            <Link href="/pricing" className="text-sm font-medium">
              Цены
            </Link>
            <Link href="/blog" className="text-sm font-medium">
              Блог
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
