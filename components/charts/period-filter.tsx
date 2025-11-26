'use client'

import { Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type Period = 'week' | 'month' | 'quarter' | 'year'

interface PeriodFilterProps {
  selectedPeriod: Period
  onPeriodChange: (period: Period) => void
  onExport?: () => void
  showExport?: boolean
}

const periodLabels: Record<Period, string> = {
  week: 'Неделя',
  month: 'Месяц',
  quarter: 'Квартал',
  year: 'Год',
}

export function PeriodFilter({
  selectedPeriod,
  onPeriodChange,
  onExport,
  showExport = true,
}: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Период:</span>
      </div>

      <Select value={selectedPeriod} onValueChange={(value) => onPeriodChange(value as Period)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Выберите период" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">Неделя</SelectItem>
          <SelectItem value="month">Месяц</SelectItem>
          <SelectItem value="quarter">Квартал</SelectItem>
          <SelectItem value="year">Год</SelectItem>
        </SelectContent>
      </Select>

      {showExport && onExport && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="ml-2"
        >
          <Download className="h-4 w-4 mr-2" />
          Экспорт
        </Button>
      )}
    </div>
  )
}
