'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowDownLeft, ArrowUpRight, CreditCard, Wallet, History as HistoryIcon, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface Transaction {
  id: string
  amount: number
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'earning'
  status: 'pending' | 'completed' | 'failed'
  description: string
  created_at: string
}

interface WalletData {
  id: string
  balance: number
  currency: string
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [userRole, setUserRole] = useState<'advertiser' | 'creator'>('advertiser') // Default, fetched later

  const supabase = createClient()

  useEffect(() => {
    fetchWalletData()
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    // In a real app, we'd check public.users table or metadata
    // For now, we'll use the URL or local storage logic similar to sidebar
    // Or just default to advertiser features for this demo if not specified
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        // Mock role detection
        // setUserRole(user.user_metadata.role || 'advertiser') 
    }
  }

  const fetchWalletData = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Fetch Wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (walletError && walletError.code === 'PGRST116') {
        // Wallet doesn't exist, create one (handled normally by trigger, but for demo we might need manual)
        // For this MVP, we will handle "no wallet" state in UI or auto-create
        console.log('No wallet found, creating one...')
        const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert([{ user_id: user.id, balance: 0 }])
            .select()
            .single()
        
        if (newWallet) {
            setBalance(newWallet.balance)
        }
      } else if (wallet) {
        setBalance(wallet.balance)
      }

      // Fetch Transactions
      if (wallet || true) { // Try fetching transactions even if wallet logic is fuzzy
        const { data: txs, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id) // Ensure transactions have user_id or join via wallet
            .order('created_at', { ascending: false })
        
        // Note: If transactions table is linked to wallet_id, we need that ID.
        // For this MVP, let's assume we might need to adjust the query once the schema is live.
        // We will use a mock list if DB is empty for the demo effect.
        
        if (txs && txs.length > 0) {
            setTransactions(txs)
        } else {
            // Mock data for empty state demonstration
            setTransactions([
                {
                    id: '1',
                    amount: 15000,
                    type: 'deposit',
                    status: 'completed',
                    description: 'Пополнение счета (Карта *4242)',
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    amount: -5000,
                    type: 'payment',
                    status: 'completed',
                    description: 'Оплата кампании "Summer Sale"',
                    created_at: new Date(Date.now() - 86400000).toISOString()
                }
            ])
        }
      }

    } catch (error) {
      console.error('Error fetching wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeposit = async () => {
    try {
      const amount = parseFloat(depositAmount)
      if (isNaN(amount) || amount <= 0) {
        toast.error('Введите корректную сумму')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Update Wallet Balance
      // Ideally this should be a database function / RPC for atomicity
      // But for MVP client-side:
      
      // Get current wallet
      const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', user.id).single()
      
      let walletId = wallet?.id
      let newBalance = (wallet?.balance || 0) + amount

      if (!wallet) {
         const { data: newWallet } = await supabase.from('wallets').insert({ user_id: user.id, balance: amount }).select().single()
         walletId = newWallet?.id
         newBalance = amount
      } else {
         await supabase.from('wallets').update({ balance: newBalance }).eq('id', walletId)
      }

      // 2. Create Transaction Record
      await supabase.from('transactions').insert({
        wallet_id: walletId,
        user_id: user.id, // Adding user_id directly to transactions for easier querying usually
        amount: amount,
        type: 'deposit',
        status: 'completed',
        description: `Пополнение баланса`,
        created_at: new Date().toISOString()
      })

      toast.success(`Баланс успешно пополнен на ${amount.toLocaleString('ru-RU')} ₽`)
      setBalance(newBalance)
      setIsDepositOpen(false)
      setDepositAmount('')
      fetchWalletData() // Refresh list

    } catch (error) {
      console.error('Deposit error:', error)
      toast.error('Ошибка при пополнении')
    }
  }

  return (
    <div className="space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Кошелек и Финансы</h2>
        <div className="flex items-center space-x-2">
            <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <ArrowDownLeft className="mr-2 h-4 w-4" />
                        Пополнить баланс
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Пополнение баланса</DialogTitle>
                        <DialogDescription>
                            Введите сумму пополнения. В демо-режиме средства зачисляются мгновенно.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Сумма
                            </Label>
                            <div className="col-span-3 relative">
                                <Input
                                    id="amount"
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="pl-8"
                                    placeholder="10000"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500">₽</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Метод</Label>
                            <div className="col-span-3 flex gap-2">
                                <div className="border rounded p-2 cursor-pointer bg-blue-50 border-blue-200">
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                                {/* Mock other methods */}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleDeposit}>Оплатить</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Текущий баланс
            </CardTitle>
            <Wallet className="h-4 w-4 text-slate-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{balance.toLocaleString('ru-RU')} ₽</div>
            <p className="text-xs text-slate-400 mt-1">
              +20.1% с прошлого месяца
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Расходы за месяц
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 450 ₽</div>
            <p className="text-xs text-muted-foreground">
              3 активные кампании
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Заморожено (Hold)
            </CardTitle>
            <HistoryIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 000 ₽</div>
            <p className="text-xs text-muted-foreground">
              В безопасной сделке
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">История операций</TabsTrigger>
          <TabsTrigger value="invoices" disabled>Счета и акты</TabsTrigger>
          <TabsTrigger value="settings" disabled>Реквизиты</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Последние операции</CardTitle>
                    <CardDescription>
                        История пополнений и списаний по вашему счету.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Дата</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead>Описание</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead className="text-right">Сумма</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>{new Date(tx.created_at).toLocaleDateString('ru-RU')}</TableCell>
                                    <TableCell>
                                        {tx.type === 'deposit' && <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Пополнение</Badge>}
                                        {tx.type === 'withdrawal' && <Badge variant="destructive">Вывод</Badge>}
                                        {tx.type === 'payment' && <Badge variant="outline">Оплата</Badge>}
                                        {tx.type === 'earning' && <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Доход</Badge>}
                                    </TableCell>
                                    <TableCell>{tx.description}</TableCell>
                                    <TableCell>
                                        {tx.status === 'completed' ? (
                                            <span className="flex items-center text-green-600 text-xs font-medium">
                                                <span className="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                                                Успешно
                                            </span>
                                        ) : (
                                            <span className="text-yellow-600 text-xs">В обработке</span>
                                        )}
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${
                                        ['deposit', 'earning'].includes(tx.type) ? 'text-green-600' : 'text-gray-900'
                                    }`}>
                                        {['deposit', 'earning'].includes(tx.type) ? '+' : '-'} 
                                        {Math.abs(tx.amount).toLocaleString('ru-RU')} ₽
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                                        Операций пока нет
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
