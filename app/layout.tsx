import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AuthProvider } from '@/lib/auth/auth-context'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'AdMarket — Маркетплейс рекламы у блогеров',
  description: 'Покупайте рекламу у блогеров и пабликов по метрикам. Каталог, эскроу, атрибуция продаж и отчёты в одном месте.',
  keywords: ['реклама', 'блогеры', 'инфлюенсер маркетинг', 'маркетплейс', 'эскроу'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
