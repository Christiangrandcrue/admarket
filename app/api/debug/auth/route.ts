import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({
        authenticated: false,
        error: authError.message,
        user: null
      })
    }
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: 'No user found',
        user: null
      })
    }
    
    // Get user data from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, status')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      authenticated: true,
      authUser: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      dbUser: userData,
      dbError: dbError?.message
    })
  } catch (error: any) {
    return NextResponse.json({
      authenticated: false,
      error: error.message
    }, { status: 500 })
  }
}
