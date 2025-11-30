'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function VerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
            <Clock className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Заявка на проверке</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Спасибо за регистрацию! Мы проверяем ваши данные. <br/>
            Обычно это занимает от 15 минут до 24 часов.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 text-left space-y-2">
            <p className="font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Что проверяем:
            </p>
            <ul className="list-disc list-inside pl-1 space-y-1">
                <li>Реальность контактных данных</li>
                <li>Соответствие контента правилам</li>
                <li>Отсутствие накруток (для креаторов)</li>
            </ul>
          </div>
          
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Вернуться на главную</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
