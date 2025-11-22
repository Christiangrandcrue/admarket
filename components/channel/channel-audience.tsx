'use client'

import type { Channel } from '@/types'

interface ChannelAudienceProps {
  channel: Channel
}

export function ChannelAudience({ channel }: ChannelAudienceProps) {
  const audience = channel.audience || {}
  const gender = audience.gender || {}
  const age = audience.age || {}
  const geo = audience.geo || {}

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Аудитория</h2>

      <div className="space-y-6">
        {/* Gender Distribution */}
        {Object.keys(gender).length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Пол</h3>
            <div className="space-y-2">
              {gender.male !== undefined && (
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">Мужчины</span>
                    <span className="font-semibold text-gray-900">{gender.male}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${gender.male}%` }}
                    />
                  </div>
                </div>
              )}
              {gender.female !== undefined && (
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">Женщины</span>
                    <span className="font-semibold text-gray-900">{gender.female}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-pink-500"
                      style={{ width: `${gender.female}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Age Distribution */}
        {Object.keys(age).length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Возраст</h3>
            <div className="space-y-2">
              {Object.entries(age).map(([ageGroup, percentage]) => (
                <div key={ageGroup}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">{ageGroup}</span>
                    <span className="font-semibold text-gray-900">{percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Geography Distribution */}
        {(Array.isArray(geo) ? geo : Object.entries(geo)).length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">География</h3>
            <div className="space-y-2">
              {(Array.isArray(geo) 
                ? geo.map((item: any) => [item.country, item.share] as [string, number])
                : Object.entries(geo) as [string, number][]
              ).map(([country, percentage]: [string, number]) => (
                <div key={country}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">{country}</span>
                    <span className="font-semibold text-gray-900">{percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {Object.keys(gender).length === 0 &&
          Object.keys(age).length === 0 &&
          Object.keys(geo).length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <p>Данные об аудитории недоступны</p>
            </div>
          )}
      </div>
    </div>
  )
}
