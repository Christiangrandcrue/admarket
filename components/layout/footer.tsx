import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-bold">AdMarket</h3>
            <p className="text-sm text-gray-600">
              Маркетплейс рекламы у блогеров и пабликов с эскроу-сделками и аналитикой
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-bold">Продукт</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/catalog" className="hover:text-gray-900">
                  Каталог каналов
                </Link>
              </li>
              <li>
                <Link href="/cases" className="hover:text-gray-900">
                  Кейсы
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-gray-900">
                  Цены и модели
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-bold">Компания</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-gray-900">
                  О платформе
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gray-900">
                  Блог
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="hover:text-gray-900">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-bold">Документы</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/legal/offer" className="hover:text-gray-900">
                  Оферта
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-gray-900">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/legal/deals" className="hover:text-gray-900">
                  Безопасные сделки
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} AdMarket. Все права защищены.
        </div>
      </div>
    </footer>
  )
}
