'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface RevenueExpenseChartProps {
  data: Array<{
    month: string
    revenue: number
    expense: number
  }>
  title?: string
  description?: string
  userType: 'advertiser' | 'creator'
  id?: string
}

export function RevenueExpenseChart({
  data,
  title,
  description,
  userType,
  id = 'revenue-expense-chart',
}: RevenueExpenseChartProps) {
  const defaultTitle =
    userType === 'advertiser' ? 'Расходы по месяцам' : 'Доходы по месяцам'
  const defaultDescription =
    userType === 'advertiser'
      ? 'Динамика расходов на размещения'
      : 'Динамика доходов от размещений'

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{title || defaultTitle}</CardTitle>
        <CardDescription>{description || defaultDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ₽`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
              formatter={(value: number) => [
                `${(value / 100).toFixed(2)} ₽`,
                '',
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            {userType === 'creator' ? (
              <Bar
                dataKey="revenue"
                name="Доходы"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
              />
            ) : (
              <Bar
                dataKey="expense"
                name="Расходы"
                fill="#ef4444"
                radius={[8, 8, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
