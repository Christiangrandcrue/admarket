
export interface TrustFactors {
  hasAvatar: boolean
  hasBio: boolean
  hasSocial: boolean
  isKyVerified: boolean
  completedOrders: number
}

export const TRUST_RULES = [
  { id: 'base', label: 'Базовый уровень', points: 10, description: 'Регистрация на платформе' },
  { id: 'avatar', label: 'Аватар профиля', points: 10, description: 'Загружено фото профиля' },
  { id: 'bio', label: 'Инфо о себе', points: 10, description: 'Заполнено поле "О себе"' },
  { id: 'social', label: 'Соцсети', points: 10, description: 'Подключен хотя бы 1 аккаунт' },
  { id: 'kyc', label: 'Верификация (KYC)', points: 40, description: 'Подтверждение личности' },
  { id: 'orders', label: 'Выполненные заказы', points: 20, description: '2 балла за заказ (макс. 10 заказов)' },
]

export function calculateTrustRank(factors: TrustFactors): { score: number, breakdown: any[] } {
  let score = 10 // Base points
  const breakdown = []

  // Base
  breakdown.push({ ...TRUST_RULES[0], achieved: true, currentPoints: 10 })

  // Avatar
  const avatarPoints = factors.hasAvatar ? 10 : 0
  score += avatarPoints
  breakdown.push({ ...TRUST_RULES[1], achieved: factors.hasAvatar, currentPoints: avatarPoints })

  // Bio
  const bioPoints = factors.hasBio ? 10 : 0
  score += bioPoints
  breakdown.push({ ...TRUST_RULES[2], achieved: factors.hasBio, currentPoints: bioPoints })

  // Social
  const socialPoints = factors.hasSocial ? 10 : 0
  score += socialPoints
  breakdown.push({ ...TRUST_RULES[3], achieved: factors.hasSocial, currentPoints: socialPoints })

  // KYC
  const kycPoints = factors.isKyVerified ? 40 : 0
  score += kycPoints
  breakdown.push({ ...TRUST_RULES[4], achieved: factors.isKyVerified, currentPoints: kycPoints })

  // Orders (Max 20 points, 2 per order)
  const ordersPoints = Math.min(factors.completedOrders * 2, 20)
  score += ordersPoints
  breakdown.push({ ...TRUST_RULES[5], achieved: ordersPoints === 20, currentPoints: ordersPoints, detail: `${factors.completedOrders} / 10` })

  return { score, breakdown }
}

export function getTrustLevel(score: number) {
  if (score >= 80) return { name: 'Top Creator', color: 'text-green-600', bg: 'bg-green-100' }
  if (score >= 30) return { name: 'Verified', color: 'text-blue-600', bg: 'bg-blue-100' }
  return { name: 'Newbie', color: 'text-gray-500', bg: 'bg-gray-100' }
}
