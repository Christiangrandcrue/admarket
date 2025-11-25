'use client'

import { useEffect, useState } from 'react'

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('[TestAPI] Starting fetch...')
    
    fetch('/api/channels')
      .then(response => {
        console.log('[TestAPI] Response status:', response.status)
        return response.json()
      })
      .then(data => {
        console.log('[TestAPI] Data received:', data)
        setResult(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('[TestAPI] Error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-4 text-2xl font-bold">API Test Page</h1>
      
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold">Status:</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {result && (
          <div>
            <p className="mb-2">
              Success: {result.success ? '✅' : '❌'}
            </p>
            <p className="mb-2">
              Count: {result.count || 0}
            </p>
            <pre className="overflow-auto rounded bg-gray-100 p-4">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border bg-yellow-50 p-6">
        <h2 className="mb-2 text-lg font-semibold">Instructions:</h2>
        <ol className="list-inside list-decimal space-y-2">
          <li>Open DevTools Console (F12)</li>
          <li>Look for logs starting with [TestAPI]</li>
          <li>Check the result above</li>
        </ol>
      </div>
    </div>
  )
}
