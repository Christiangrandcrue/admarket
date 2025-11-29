import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InfoPageTemplate({ 
  title, 
  description, 
  children 
}: { 
  title: string
  description: string
  children?: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 pl-0 hover:bg-transparent hover:text-purple-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Button>
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-500 mb-12">{description}</p>
        
        <div className="prose prose-gray max-w-none">
          {children || (
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-gray-600">
                Контент для этого раздела находится в разработке. Пожалуйста, зайдите позже.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
