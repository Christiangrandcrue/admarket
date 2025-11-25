import { CatalogClient } from '@/components/catalog/catalog-client'

export default function CatalogPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Каталог блогеров</h1>
          <p className="text-gray-700">
            Проверенные каналы для вашей рекламы
          </p>
        </div>

        <CatalogClient />
      </div>
    </div>
  )
}
