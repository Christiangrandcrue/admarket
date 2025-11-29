'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function WikiPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">База знаний (Wiki)</h1>
        <p className="text-gray-500">Ответы на вопросы, правила платформы и юридическая информация.</p>
      </div>

      <div className="space-y-8">
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Частые вопросы (FAQ)</h2>
          <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-gray-200 px-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>Как повысить Trust Rank?</AccordionTrigger>
              <AccordionContent>
                Trust Rank растет при успешном выполнении заказов, верификации личности и подключении социальных сетей.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Как вывести деньги?</AccordionTrigger>
              <AccordionContent>
                Выплаты производятся автоматически раз в неделю на привязанную карту или расчетный счет. Минимальная сумма — 5000 ₽.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Что такое Комбайн Контента?</AccordionTrigger>
              <AccordionContent>
                Это набор AI-инструментов для автоматического создания видео, генерации идей и планирования публикаций.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Юридическая информация</h2>
          <div className="grid gap-4">
             <div className="p-4 bg-white border border-gray-200 rounded-lg flex justify-between items-center hover:border-purple-200 cursor-pointer transition-colors">
                <span className="font-medium text-gray-700">Правила использования платформы</span>
                <span className="text-xs text-purple-600 font-bold">Читать</span>
             </div>
             <div className="p-4 bg-white border border-gray-200 rounded-lg flex justify-between items-center hover:border-purple-200 cursor-pointer transition-colors">
                <span className="font-medium text-gray-700">Политика конфиденциальности</span>
                <span className="text-xs text-purple-600 font-bold">Читать</span>
             </div>
             <div className="p-4 bg-white border border-gray-200 rounded-lg flex justify-between items-center hover:border-purple-200 cursor-pointer transition-colors">
                <span className="font-medium text-gray-700">Агентский договор (Оферта)</span>
                <span className="text-xs text-purple-600 font-bold">Скачать PDF</span>
             </div>
          </div>
        </section>

      </div>
    </div>
  )
}
