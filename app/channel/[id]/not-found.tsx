import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ChannelNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <AlertCircle className="mb-4 h-16 w-16 text-gray-400" />
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Канал не найден</h1>
      <p className="mb-6 text-gray-600">
        К сожалению, запрашиваемый канал не существует или был удалён
      </p>
      <Link href="/catalog">
        <Button>Вернуться к каталогу</Button>
      </Link>
    </div>
  )
}
