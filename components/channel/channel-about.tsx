'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Channel } from '@/types'

interface ChannelAboutProps {
  channel: Channel
}

export function ChannelAbout({ channel }: ChannelAboutProps) {
  const brandSafety = channel.brand_safety || {}

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="mb-4 text-xl font-bold text-gray-900">О канале</h2>
      
      <p className="mb-6 text-gray-700 leading-relaxed">
        {channel.description}
      </p>

      {/* Brand Safety Section */}
      {brandSafety && Object.keys(brandSafety).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Brand Safety</h3>
          
          <div className="grid gap-3 sm:grid-cols-2">
            {brandSafety.verified !== undefined && (
              <div className="flex items-center gap-2">
                {brandSafety.verified ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Верифицирован</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Не верифицирован</span>
                  </>
                )}
              </div>
            )}

            {brandSafety.no_swearing !== undefined && (
              <div className="flex items-center gap-2">
                {brandSafety.no_swearing ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Без мата</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-gray-600">Возможен мат</span>
                  </>
                )}
              </div>
            )}

            {brandSafety.no_politics !== undefined && (
              <div className="flex items-center gap-2">
                {brandSafety.no_politics ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Без политики</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-gray-600">Возможна политика</span>
                  </>
                )}
              </div>
            )}

            {brandSafety.advertiser_friendly !== undefined && (
              <div className="flex items-center gap-2">
                {brandSafety.advertiser_friendly ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Безопасен для брендов</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-gray-600">Осторожно для брендов</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
