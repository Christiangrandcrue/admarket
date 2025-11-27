'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

type UserRole = 'advertiser' | 'creator'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<UserRole>('advertiser')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setStep('details')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
          },
        },
      })

      if (signUpError) throw signUpError

      // Create user profile in database
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: formData.email,
            full_name: formData.fullName,
            role: role,
          })

        if (profileError && profileError.code !== '23505') { // Ignore duplicate key error
          console.error('Profile creation error:', profileError)
        }

        // Send welcome email (fire and forget - don't block registration)
        try {
          const welcomeResponse = await fetch('/api/auth/welcome', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!welcomeResponse.ok) {
            console.warn('Failed to send welcome email (non-blocking)')
          }
        } catch (emailError) {
          // Don't block registration if welcome email fails
          console.warn('Welcome email error (non-blocking):', emailError)
        }
      }

      // Redirect to dashboard or verification page
      router.push('/auth/verify-email')
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации через Google')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-block text-2xl font-bold">
            AdMarket
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Регистрация</h1>
          <p className="text-gray-600">
            Создайте аккаунт для доступа к платформе
          </p>
        </div>

        {/* Role Selection Step */}
        {step === 'role' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
                Выберите тип аккаунта
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Advertiser Card */}
                <button
                  onClick={() => handleRoleSelect('advertiser')}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-purple-600 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-2xl">
                    💼
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">
                    Рекламодатель
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Создавайте кампании, работайте с блогерами, отслеживайте результаты
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>Доступ к каталогу блогеров</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>Создание кампаний</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>Аналитика и отчёты</span>
                    </li>
                  </ul>
                </button>

                {/* Creator Card */}
                <button
                  onClick={() => handleRoleSelect('creator')}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-purple-600 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 text-2xl">
                    🎬
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">
                    Блогер / Автор
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Монетизируйте свой контент, получайте заказы, управляйте сделками
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>Управление каналами</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>Получение заказов</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>Финансы и выплаты</span>
                    </li>
                  </ul>
                </button>
              </div>
            </div>

            {/* Back to Login */}
            <div className="text-center text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-purple-600 hover:text-purple-700"
              >
                Войти
              </Link>
            </div>
          </div>
        )}

        {/* Registration Details Step */}
        {step === 'details' && (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            {/* Selected Role Badge */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {role === 'advertiser' ? '💼' : '🎬'}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Регистрация как</div>
                  <div className="font-semibold text-gray-900">
                    {role === 'advertiser' ? 'Рекламодатель' : 'Блогер / Автор'}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('role')}
                disabled={loading}
              >
                Изменить
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-900">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* OAuth Button - Temporarily disabled until Google OAuth is configured in Supabase */}
            {/* 
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Зарегистрироваться через Google
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">или с email</span>
              </div>
            </div>
            */}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-900">
                  Полное имя
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Иван Иванов"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Минимум 6 символов
                </p>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Я принимаю{' '}
                  <Link href="/legal/terms" className="text-purple-600 hover:text-purple-700">
                    условия использования
                  </Link>{' '}
                  и{' '}
                  <Link href="/legal/privacy" className="text-purple-600 hover:text-purple-700">
                    политику конфиденциальности
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-purple-600 hover:text-purple-700"
              >
                Войти
              </Link>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  )
}
