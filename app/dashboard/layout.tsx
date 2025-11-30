/**
 * Dashboard Layout
 * Force dynamic rendering for all dashboard pages
 */

import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { OnboardingTutorial } from '@/components/onboarding/tutorial'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Navigation Bar */}
      <MobileNav />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-64 flex-shrink-0">
         <DashboardSidebar className="h-full fixed w-64" />
      </div>
      <div className="hidden md:block w-64 flex-shrink-0"></div> {/* Spacer for fixed sidebar */}

      <main className="flex-1 w-full bg-gray-50 min-h-screen">
        {children}
      </main>
      <OnboardingTutorial />
    </div>
  )
}
