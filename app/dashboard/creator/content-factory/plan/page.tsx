'use client'

import { useState } from 'react'
import { Calendar, Clock, Plus, Trash2, Save, Sparkles } from 'lucide-react'

export default function CreateContentPlanPage() {
  // State for form fields
  const [planName, setPlanName] = useState('')
  const [category, setCategory] = useState('')
  const [frequency, setFrequency] = useState('3')
  const [variations, setVariations] = useState('')
  
  // Schedule state
  const [schedule, setSchedule] = useState([
    { day: 'Понедельник', time: '09:00' }
  ])

  // Platforms state
  const [platforms, setPlatforms] = useState({
    tiktok: false,
    youtube: false,
    instagram: false
  })

  const handleAddSchedule = () => {
    setSchedule([...schedule, { day: 'Понедельник', time: '09:00' }])
  }

  const handleRemoveSchedule = (index: number) => {
    const newSchedule = [...schedule]
    newSchedule.splice(index, 1)
    setSchedule(newSchedule)
  }

  const handleScheduleChange = (index: number, field: 'day' | 'time', value: string) => {
    const newSchedule = [...schedule]
    newSchedule[index] = { ...newSchedule[index], [field]: value }
    setSchedule(newSchedule)
  }

  const togglePlatform = (platform: keyof typeof platforms) => {
    setPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }))
  }

  const handleSubmit = () => {
    console.log({
      planName,
      category,
      frequency,
      variations,
      schedule,
      platforms
    })
    alert('Контент-план сохранен! (API integration pending)')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Создать контент-план</h1>
            <p className="text-gray-500 text-sm">Запланируйте автоматическую генерацию серии роликов</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Plan Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Название плана</label>
              <input 
                type="text" 
                placeholder="Например: Фитнес-контент март 2024"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>

            {/* Category & Frequency Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Категория</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Выберите...</option>
                  <option value="fitness">Фитнес и Спорт</option>
                  <option value="travel">Путешествия</option>
                  <option value="tech">Технологии</option>
                  <option value="business">Бизнес и Финансы</option>
                  <option value="education">Образование</option>
                  <option value="entertainment">Развлечения</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Частота (видео/день)</label>
                <input 
                  type="number" 
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                />
              </div>
            </div>

            {/* Variations */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Вариации (через запятую)</label>
              <textarea 
                placeholder="Утренняя зарядка, Здоровое питание, Мотивация дня"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                value={variations}
                onChange={(e) => setVariations(e.target.value)}
              />
              <p className="text-xs text-gray-400">AI будет использовать эти вариации для разнообразия контента</p>
            </div>

            {/* Schedule Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="text-sm font-semibold text-gray-700 block">Расписание публикаций</label>
              
              {schedule.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <select 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 font-medium px-2"
                    value={item.day}
                    onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                  >
                    {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input 
                      type="time" 
                      className="bg-transparent border-none focus:ring-0 p-0 w-20 text-sm"
                      value={item.time}
                      onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                    />
                  </div>

                  {schedule.length > 1 && (
                    <button 
                      onClick={() => handleRemoveSchedule(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button 
                onClick={handleAddSchedule}
                className="text-sm text-purple-600 font-medium flex items-center gap-1 hover:text-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить время публикации
              </button>
            </div>

            {/* Platforms */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label className="text-sm font-semibold text-gray-700">Целевые платформы</label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${platforms.tiktok ? 'bg-black border-black' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                    {platforms.tiktok && <Sparkles className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={platforms.tiktok} onChange={() => togglePlatform('tiktok')} />
                  <span className="text-gray-700 flex items-center gap-2">
                    <i className="fab fa-tiktok"></i> TikTok
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${platforms.youtube ? 'bg-red-600 border-red-600' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                    {platforms.youtube && <Sparkles className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={platforms.youtube} onChange={() => togglePlatform('youtube')} />
                  <span className="text-gray-700 flex items-center gap-2">
                    <i className="fab fa-youtube text-red-600"></i> YouTube Shorts
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${platforms.instagram ? 'bg-pink-600 border-pink-600' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                    {platforms.instagram && <Sparkles className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={platforms.instagram} onChange={() => togglePlatform('instagram')} />
                  <span className="text-gray-700 flex items-center gap-2">
                    <i className="fab fa-instagram text-pink-600"></i> Instagram Reels
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                onClick={handleSubmit}
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1"
              >
                <Save className="w-5 h-5" />
                Создать контент-план
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
