/**
 * Dashboard Layout
 * Force dynamic rendering for all dashboard pages
 */

import { DashboardSidebar } from '@/components/dashboard/sidebar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1">
      <DashboardSidebar />
      <main className="flex-1 w-full bg-gray-50">
        {children}
      </main>
    </div>
  )
}
