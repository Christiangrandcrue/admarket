import { CatalogClient } from '@/components/catalog/catalog-client'

export default async function CatalogPage() {
  // Загружаем каналы через API
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  let channels: any[] = []
  
  try {
    const response = await fetch(`${apiUrl}/api/channels`, {
      cache: 'no-store'
    })
    const result = await response.json()
    
    if (result.success && result.channels) {
      channels = result.channels
    }
  } catch (error) {
    console.error('Error loading channels:', error)
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Каталог блогеров</h1>
          <p className="text-gray-700">
            {channels.length} проверенных каналов для вашей рекламы
          </p>
        </div>

        <CatalogClient channels={channels} />
      </div>
    </div>
  )
}
