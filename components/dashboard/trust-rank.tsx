import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustRankProps {
  score: number // 0 to 100
  className?: string
}

export function TrustRank({ score, className }: TrustRankProps) {
  // Определяем уровень доверия
  let level = 'Newbie'
  let color = 'text-gray-500'
  let bg = 'bg-gray-100'
  let Icon = Shield

  if (score >= 80) {
    level = 'Trusted'
    color = 'text-green-600'
    bg = 'bg-green-100'
    Icon = ShieldCheck
  } else if (score >= 50) {
    level = 'Verified'
    color = 'text-blue-600'
    bg = 'bg-blue-100'
    Icon = Shield
  } else if (score < 30) {
    level = 'Low Trust'
    color = 'text-orange-500'
    bg = 'bg-orange-100'
    Icon = ShieldAlert
  }

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm", className)}>
      <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", bg)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Rank</div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-gray-900">{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <div className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-gray-50 text-gray-600">
        {level}
      </div>
    </div>
  )
}
