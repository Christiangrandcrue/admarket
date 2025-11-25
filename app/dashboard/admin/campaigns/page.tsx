'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function CampaignsContent() {
  const searchParams = useSearchParams()
  const [campaigns, setCampaigns] = useState([])
  
  useEffect(() => {
    fetch('/api/admin/campaigns').then(r => r.json()).then(d => setCampaigns(d.campaigns || []))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold">Модерация кампаний</h1>
        <div className="mt-8">
          {campaigns.length === 0 ? (
            <p className="text-gray-600">Нет кампаний</p>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c: any) => (
                <div key={c.id} className="rounded-lg bg-white p-6">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-gray-600">{c.description}</p>
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
      <CampaignsContent />
    </Suspense>
  )
}
