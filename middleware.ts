import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Public Routes (Always allowed)
  const isPublic = 
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('favicon.ico')

  if (isPublic) {
    return supabaseResponse
  }

  // 2. Protected Routes (Require Login)
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 3. Role & Status Check (The "Wall")
  // We query the profiles table to check status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  // Current path
  const path = request.nextUrl.pathname

  // If no profile exists yet (rare edge case after registration trigger), let them proceed to role selection
  // or force them there if they are trying to access dashboard
  if (!profile) {
    // Allow access to role selection page
    if (path === '/onboarding/role-selection') return supabaseResponse
    // Redirect everything else to role selection
    return NextResponse.redirect(new URL('/onboarding/role-selection', request.url))
  }

  // STATUS CHECKS
  // A. If status is 'new' or role is null -> Force Role Selection
  if (profile.status === 'new' || !profile.role) {
    if (path !== '/onboarding/role-selection') {
        return NextResponse.redirect(new URL('/onboarding/role-selection', request.url))
    }
    return supabaseResponse
  }

  // B. If status is 'pending' -> Force Verification Page (Block Dashboards)
  if (profile.status === 'pending') {
    if (path !== '/onboarding/verification') {
        return NextResponse.redirect(new URL('/onboarding/verification', request.url))
    }
    return supabaseResponse
  }

  // C. If status is 'rejected' -> Show rejection (or just reuse verification page with error param)
  if (profile.status === 'rejected') {
     // For now, redirect to verification but maybe show a toast there
     if (path !== '/onboarding/verification') {
        return NextResponse.redirect(new URL('/onboarding/verification', request.url))
    }
    return supabaseResponse
  }

  // D. Approved Users -> Role Based Access Control (RBAC)
  if (profile.status === 'approved' || profile.status === 'active') { // 'active' is legacy status
    
    // Prevent Approved Advertiser from accessing Creator Dashboard
    if (profile.role === 'advertiser' && path.startsWith('/dashboard/creator')) {
        return NextResponse.redirect(new URL('/dashboard/campaigns', request.url))
    }

    // Prevent Approved Creator from accessing Advertiser Dashboard
    if (profile.role === 'creator' && path.startsWith('/dashboard/campaigns')) {
        return NextResponse.redirect(new URL('/dashboard/creator', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
