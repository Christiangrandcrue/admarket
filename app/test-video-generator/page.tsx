'use client'

import { useState } from 'react'
import { VideoGeneratorModal } from '@/components/turboboost/video-generator-modal'

export default function TestVideoGeneratorPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎬 TurboBoost AI Video Generator
          </h1>
          <p className="text-white/80 text-lg mb-2">
            Production Test Page
          </p>
          <p className="text-white/60 text-sm">
            Generate professional videos for TikTok/Reels in 2-4 minutes
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-semibold mb-4">✨ Features:</h2>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Real-time progress bar (0-100%)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Video preview with native player</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Polling every 10 seconds</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Error handling & console logs</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Download button</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-semibold mb-4">🧪 Test Instructions:</h2>
            <ol className="space-y-2 text-white/80 list-decimal list-inside">
              <li>Open Browser Console (F12)</li>
              <li>Click "Launch Video Generator" button below</li>
              <li>Fill the form:
                <ul className="ml-6 mt-1 text-sm">
                  <li>• Topic: "Mountain landscape at sunset"</li>
                  <li>• Style: "Кинематографический"</li>
                  <li>• Duration: 5 seconds</li>
                </ul>
              </li>
              <li>Click "Сгенерировать"</li>
              <li>Watch Console for detailed logs</li>
              <li>Wait 2-4 minutes for video</li>
            </ol>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            🚀 Launch Video Generator
          </button>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-amber-200 text-sm">
              ⚠️ <strong>Note:</strong> This is a public test page without authentication.
              Production users access this via <code className="bg-black/30 px-2 py-1 rounded">/dashboard/creator</code>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-white/40 text-sm">
          <p>API: <code>https://turboboost-portal.pages.dev/api</code></p>
          <p className="mt-1">Test User: inbe@ya.ru (5 videos left)</p>
        </div>
      </div>

      <VideoGeneratorModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  )
}
