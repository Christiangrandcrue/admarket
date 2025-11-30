import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const role = requestUrl.searchParams.get('role')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // If role is provided (from registration), create user profile
    if (role) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Create user profile with role in 'profiles' table
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name || user.email?.split('@')[0],
          role: role as 'advertiser' | 'creator',
          status: 'active', // Auto-activate
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })
      }
    }
  }

  // Redirect to dashboard or onboarding based on role
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
