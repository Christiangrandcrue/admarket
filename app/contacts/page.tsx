import InfoPageTemplate from '@/components/layout/info-page-template'

export default function ContactsPage() {
  return (
    <InfoPageTemplate 
      title="Контакты"
      description="Свяжитесь с нами любым удобным способом."
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Поддержка пользователей</h3>
          <p className="text-gray-600 mb-4">По вопросам работы платформы и заказов</p>
          <a href="mailto:support@admarket.com" className="text-purple-600 hover:underline">support@admarket.com</a>
        </div>
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Сотрудничество</h3>
          <p className="text-gray-600 mb-4">Для партнеров и прессы</p>
          <a href="mailto:partners@admarket.com" className="text-purple-600 hover:underline">partners@admarket.com</a>
        </div>
      </div>
    </InfoPageTemplate>
  )
}
