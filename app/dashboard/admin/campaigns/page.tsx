'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function ChannelsContent() {
  const searchParams = useSearchParams()
  const [channels, setChannels] = useState([])
  
  useEffect(() => {
    fetch('/api/admin/channels').then(r => r.json()).then(d => setChannels(d.channels || []))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold">Модерация каналов</h1>
        <div className="mt-8">
          {channels.length === 0 ? (
            <p className="text-gray-600">Нет каналов</p>
          ) : (
            <div className="space-y-4">
              {channels.map((c: any) => (
                <div key={c.id} className="rounded-lg bg-white p-6">
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-gray-600">{c.category}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChannelsContent />
    </Suspense>
  )
}
