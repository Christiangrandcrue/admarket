'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Book, 
  FileText, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  PlayCircle,
  CreditCard,
  Zap
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function WikiPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const articles = [
    {
      category: 'Начало работы',
      icon: PlayCircle,
      items: [
        { title: 'Как заполнить профиль для Trust Rank', id: 'profile' },
        { title: 'Подключение соцсетей (Instagram, YouTube)', id: 'socials' },
        { title: 'Верификация личности (KYC)', id: 'kyc' },
      ]
    },
    {
      category: 'Заказы и Оплата',
      icon: CreditCard,
      items: [
        { title: 'Как откликнуться на заказ', id: 'apply' },
        { title: 'Безопасная сделка: как это работает', id: 'escrow' },
        { title: 'Вывод средств и комиссии', id: 'payout' },
      ]
    },
    {
      category: 'AI Инструменты',
      icon: Zap,
      items: [
        { title: 'Создание первого AI-аватара', id: 'avatar' },
        { title: 'Генерация контент-плана', id: 'content-plan' },
        { title: 'Промпты для видео: лучшие практики', id: 'prompts' },
      ]
    },
    {
      category: 'Правила и Документы',
      icon: Shield,
      items: [
        { title: 'Публичная оферта', id: 'offer' },
        { title: 'Политика конфиденциальности', id: 'privacy' },
        { title: 'Требования к контенту', id: 'rules' },
      ]
    }
  ]

  const filteredArticles = articles.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 py-12 px-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Как мы можем помочь?</h1>
        <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
          База знаний AdMarket — это коллекция статей, инструкций и ответов на частые вопросы, 
          которые помогут вам зарабатывать больше.
        </p>
        
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Поиск по базе знаний (например: вывод средств)" 
            className="pl-12 h-12 text-lg shadow-sm border-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-8">
        
        {/* Quick Links Grid */}
        {!searchQuery && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <PlayCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Новичкам</h3>
              <p className="text-sm text-gray-500">Пошаговое руководство по старту на платформе.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Безопасность</h3>
              <p className="text-sm text-gray-500">Как защитить свой аккаунт и не попасть на мошенников.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Финансы</h3>
              <p className="text-sm text-gray-500">Всё о налогах, комиссиях и способах выплат.</p>
            </div>
          </div>
        )}

        {/* Knowledge Base Categories */}
        <div className="space-y-8">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <category.icon className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-bold text-gray-900">{category.category}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {category.items.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 hover:bg-purple-50 flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                        <span className="text-gray-700 font-medium group-hover:text-purple-900">{item.title}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-400" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Ничего не найдено</h3>
              <p className="text-gray-500">Попробуйте изменить запрос или напишите в поддержку.</p>
              <Button className="mt-4" variant="outline">Написать в поддержку</Button>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        {!searchQuery && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Частые вопросы (FAQ)</h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Сколько я могу заработать?</AccordionTrigger>
                  <AccordionContent>
                    Заработок зависит от вашего Trust Rank и количества подписчиков. В среднем, креаторы уровня Verified зарабатывают от 50,000 ₽ в месяц.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Нужно ли мне платить за регистрацию?</AccordionTrigger>
                  <AccordionContent>
                    Нет, регистрация и создание портфолио на AdMarket полностью бесплатны. Мы берем комиссию только с успешных сделок.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Как быстро приходят деньги?</AccordionTrigger>
                  <AccordionContent>
                    После того как рекламодатель подтвердит выполнение заказа, деньги поступают на ваш внутренний счет мгновенно. Вывод на карту занимает 1-3 рабочих дня.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
