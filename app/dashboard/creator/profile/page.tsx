'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Youtube, 
  Globe, 
  Upload,
  CheckCircle2,
  AlertCircle,
  Power,
  Shield,
  Trophy,
  Lock
} from 'lucide-react'
import { calculateTrustRank, getTrustLevel } from '@/lib/trust-rank'

export default function CreatorProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock Data (в будущем будем брать из Supabase)
  const [profile, setProfile] = useState({
    nickname: 'CreativeSoul',
    fullName: 'Alex Morgan',
    bio: 'Создаю уникальный контент про путешествия и технологии.',
    email: 'alex@example.com',
    phone: '+1 234 567 8900',
    location: 'Dubai, UAE',
    status: 'active',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    // Trust Factors
    hasSocial: true,
    isKyVerified: false,
    completedOrders: 3
  })

  // Calculate Trust Rank
  const { score, breakdown } = calculateTrustRank({
    hasAvatar: !!profile.avatarUrl,
    hasBio: profile.bio.length > 10,
    hasSocial: profile.hasSocial,
    isKyVerified: profile.isKyVerified,
    completedOrders: profile.completedOrders
  })

  const level = getTrustLevel(score)

  const handleStatusChange = (newStatus: string) => {
    setProfile({ ...profile, status: newStatus })
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1000)) // Simulate API
    setIsLoading(false)
    alert('Профиль сохранен!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header & Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Настройки кабинета</h1>
            <p className="text-gray-500">Управляйте своим публичным профилем и статусом работы.</p>
          </div>
          
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex gap-2">
            <button
              onClick={() => handleStatusChange('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                profile.status === 'active' 
                  ? 'bg-green-100 text-green-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Активен
            </button>
            <button
              onClick={() => handleStatusChange('busy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                profile.status === 'busy' 
                  ? 'bg-orange-100 text-orange-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Занят
            </button>
            <button
              onClick={() => handleStatusChange('vacation')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                profile.status === 'vacation' 
                  ? 'bg-gray-100 text-gray-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Power className="w-4 h-4" />
              Отпуск
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Trust */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={profile.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover border-4 border-purple-50"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload className="text-white w-8 h-8" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
              <p className="text-purple-600 font-medium">@{profile.nickname}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-100 text-left">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Статистика</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Рейтинг</span>
                    <span className="font-bold text-gray-900">4.9 ★</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Выполнено заказов</span>
                    <span className="font-bold text-gray-900">{profile.completedOrders}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className="text-gray-600">Trust Rank</span>
                    <span className={`font-bold ${level.color}`}>{score}/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Rank Details (New) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Уровень доверия
              </h3>
              
              <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${level.bg}`}>
                    <Trophy className={`w-5 h-5 ${level.color}`} />
                 </div>
                 <div>
                    <div className="text-xs text-gray-500">Текущий статус</div>
                    <div className={`font-bold ${level.color}`}>{level.name}</div>
                 </div>
                 <div className="ml-auto text-2xl font-bold text-gray-900">{score}</div>
              </div>

              <div className="space-y-3">
                {breakdown.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {item.achieved ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                      )}
                      <span className={item.achieved ? 'text-gray-700' : 'text-gray-400'}>
                        {item.label}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-500">
                      {item.detail ? item.detail : `+${item.currentPoints}`}
                    </div>
                  </div>
                ))}
              </div>
              
              {!profile.isKyVerified && (
                <Button variant="outline" className="w-full mt-4 text-xs h-8 border-blue-200 text-blue-600 hover:bg-blue-50">
                  Пройти KYC (+40 баллов)
                </Button>
              )}
            </div>

            {/* Connected Accounts */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-400" />
                Соцсети
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Instagram</div>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Подключено
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400">Edit</Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                      <Youtube className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">YouTube</div>
                      <div className="text-xs text-gray-500">Не подключено</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center">
                      <span className="font-bold text-lg">Ti</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">TikTok</div>
                      <div className="text-xs text-gray-500">Не подключено</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Основная информация</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Никнейм (публичный)</Label>
                    <Input 
                      value={profile.nickname} 
                      onChange={(e) => setProfile({...profile, nickname: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Полное имя</Label>
                    <Input 
                      value={profile.fullName}
                      onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>О себе (Био)</Label>
                  <textarea 
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Краткое описание вашего канала и тем, которые вы освещаете.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" /> Email для связи
                    </Label>
                    <Input 
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" /> Телефон
                    </Label>
                    <Input 
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> Локация
                  </Label>
                  <Input 
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <Button variant="ghost">Отмена</Button>
                <Button onClick={handleSave} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                  {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            </div>

            {/* Trust & Verification Stub */}
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                   <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Повысьте свой Trust Rank</h3>
                  <p className="text-sm text-gray-600 mt-1 mb-4">
                    Пройдите верификацию личности (KYC), чтобы получить доступ к дорогим заказам и значок "Проверенный Креатор".
                  </p>
                  <Button variant="outline" className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
                    Начать верификацию
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}
