import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CatalogClient } from '@/components/catalog/catalog-client'
import { createClient } from '@/lib/supabase/server'

export default async function CatalogPage() {
  const supabase = await createClient()
  
  // Загружаем каналы из Supabase
  const { data: channels, error } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading channels:', error)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Каталог блогеров</h1>
            <p className="text-gray-600">
              {channels?.length || 0} проверенных каналов для вашей рекламы
            </p>
          </div>

          <CatalogClient channels={channels || []} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
