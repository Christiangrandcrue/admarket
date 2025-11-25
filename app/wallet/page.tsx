'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function WalletPage() {
  const currentUserId = 'bf91c23b-7b52-4870-82f7-ba9ad852b49e'

  const [balance, setBalance] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWallet()
  }, [])

  const loadWallet = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/wallet?user_id=${currentUserId}`)

      if (!response.ok) {
        throw new Error('Не удалось загрузить кошелёк')
      }

      const result = await response.json()
      if (result.success) {
        setBalance(result.balance)
        setTransactions(result.transactions)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'placement_payment':
      case 'bonus':
      case 'placement_refund':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />
      case 'withdrawal':
      case 'placement_hold':
      case 'placement_release':
      case 'fee':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />
    }
  }

  const getTransactionLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      deposit: 'Пополнение',
      withdrawal: 'Вывод средств',
      placement_hold: 'Резервирование',
      placement_release: 'Списание',
      placement_payment: 'Оплата',
      placement_refund: 'Возврат',
      fee: 'Комиссия',
      bonus: 'Бонус',
      adjustment: 'Корректировка',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadWallet}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Кошелёк</h1>
        <p className="text-gray-600">Управляйте балансом и транзакциями</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Доступно</p>
                <p className="text-3xl font-bold text-green-600">
                  {balance ? formatCurrency(balance.available_balance_cents) : '0 ₽'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">
              Средства доступные к выводу и использованию
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Зарезервировано</p>
                <p className="text-3xl font-bold text-orange-600">
                  {balance ? formatCurrency(balance.held_balance_cents) : '0 ₽'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500">
              Средства зарезервированные для размещений
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Всего</p>
                <p className="text-3xl font-bold text-purple-600">
                  {balance ? formatCurrency(balance.balance_cents) : '0 ₽'}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500">
              Общий баланс (доступно + зарезервировано)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lifetime Stats */}
      {balance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">Всего заработано</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(balance.total_earned_cents)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">Всего потрачено</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(balance.total_spent_cents)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">Пополнено</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(balance.total_deposited_cents)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">Выведено</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(balance.total_withdrawn_cents)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>История транзакций</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>История транзакций пуста</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {getTransactionLabel(tx.type)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tx.description || formatDate(tx.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        ['deposit', 'placement_payment', 'bonus', 'placement_refund'].includes(tx.type)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {['deposit', 'placement_payment', 'bonus', 'placement_refund'].includes(tx.type)
                        ? '+'
                        : '-'}
                      {formatCurrency(tx.amount_cents)}
                    </p>
                    <Badge
                      variant={
                        tx.status === 'completed'
                          ? 'success'
                          : tx.status === 'pending'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {tx.status === 'completed'
                        ? 'Завершено'
                        : tx.status === 'pending'
                        ? 'В обработке'
                        : tx.status === 'failed'
                        ? 'Ошибка'
                        : 'Отменено'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note about payment integration */}
      <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Примечание:</strong> Интеграция с платёжными системами (Stripe, PayPal) будет
          добавлена в следующей версии. Текущий функционал показывает структуру системы платежей.
        </p>
      </div>
    </div>
  )
}
