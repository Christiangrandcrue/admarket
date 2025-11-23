/**
 * Admin Flags/Reports Page
 * Simple implementation - user can expand later
 */

'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AdminFlagsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/dashboard/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Flags & Reports</h1>
          <p className="text-gray-600">User-reported content and violations</p>
        </div>

        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <span className="text-2xl">🚩</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No flags yet
          </h3>
          <p className="text-gray-600">
            User reports will appear here when submitted
          </p>
        </div>
      </div>
    </div>
  )
}
