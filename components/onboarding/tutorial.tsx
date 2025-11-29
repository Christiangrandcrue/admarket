'use client'

import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

export function OnboardingTutorial() {
  const driverObj = useRef<any>(null)

  useEffect(() => {
    driverObj.current = driver({
      showProgress: true,
      animate: true,
      nextBtnText: 'Далее',
      prevBtnText: 'Назад',
      doneBtnText: 'Готово',
      steps: [
        { 
          element: '#header-role-switcher', 
          popover: { 
            title: '🎭 Смена роли', 
            description: 'Здесь вы можете переключаться между кабинетом Рекламодателя (для создания заказов) и Креатора (для заработка).', 
            side: 'bottom', 
            align: 'start' 
          } 
        },
        { 
          element: '#sidebar-link-profile', 
          popover: { 
            title: '⚙️ Ваш Профиль', 
            description: 'Начните с настройки профиля. Заполните данные и подключите соцсети, чтобы повысить Trust Rank.', 
            side: 'right', 
            align: 'start' 
          } 
        },
        { 
          element: '#sidebar-link-content-factory', 
          popover: { 
            title: '🤖 AI Комбайн', 
            description: 'Уникальный инструмент! Генерируйте видео и аватары с помощью искусственного интеллекта.', 
            side: 'right', 
            align: 'start' 
          } 
        },
        { 
          element: '#sidebar-link-catalog', 
          popover: { 
            title: '🔍 Каталог', 
            description: 'Если вы Рекламодатель — здесь вы найдете блогеров. Если Креатор — убедитесь, что вы есть в этом списке.', 
            side: 'right', 
            align: 'start' 
          } 
        },
        { 
          element: '#sidebar-link-campaigns', 
          popover: { 
            title: '📢 Кампании', 
            description: 'Здесь живут ваши рекламные кампании. Создайте первую прямо сейчас!', 
            side: 'right', 
            align: 'start' 
          } 
        }
      ]
    })
    
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('has_seen_tutorial')
    if (!hasSeenTutorial) {
      // Small delay to ensure elements render
      setTimeout(() => {
        driverObj.current.drive()
        localStorage.setItem('has_seen_tutorial', 'true')
      }, 1500)
    }
  }, [])

  const startTour = () => {
    driverObj.current?.drive()
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={startTour}
      className="fixed bottom-4 right-4 bg-white shadow-lg border border-purple-100 text-purple-600 hover:bg-purple-50 rounded-full z-50"
    >
      <HelpCircle className="w-4 h-4 mr-2" />
      Обучение
    </Button>
  )
}
