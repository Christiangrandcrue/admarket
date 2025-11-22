import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle2 } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Проверьте email
          </h1>
          <p className="text-gray-600">
            Мы отправили письмо с подтверждением на вашу почту
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-6 space-y-3 text-left text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <p>
                Откройте письмо и нажмите на ссылку подтверждения
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <p>
                После подтверждения вы сможете войти в систему
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <p>
                Если письмо не пришло, проверьте папку "Спам"
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/auth/login" className="block">
              <Button className="w-full">
                Перейти к входу
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                На главную
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Не получили письмо?{' '}
            <button className="font-medium text-purple-600 hover:text-purple-700">
              Отправить повторно
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
