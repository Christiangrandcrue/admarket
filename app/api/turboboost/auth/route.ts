import { NextRequest, NextResponse } from 'next/server'

// Hardcoded credentials (will work immediately, can be overridden by env vars later)
const API_URL = 'https://turboboost-portal.pages.dev/api'
const EMAIL = 'inbe@ya.ru'
const PASSWORD = 'rewfdsvcx5'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/turboboost/auth - Authenticate with TurboBoost
export async function POST(request: NextRequest) {
  try {
    console.log('[TurboBoost Auth] Starting authentication...')
    console.log('[TurboBoost Auth] API URL:', API_URL)
    console.log('[TurboBoost Auth] Email:', EMAIL)
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    })

    console.log('[TurboBoost Auth] Response status:', response.status)
    console.log('[TurboBoost Auth] Response ok:', response.ok)

    const data = await response.json()
    console.log('[TurboBoost Auth] Response data:', JSON.stringify(data))

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'TurboBoost authentication failed')
    }

    return NextResponse.json({
      success: true,
      token: data.token,
      user: data.user,
    })
  } catch (error: any) {
    console.error('[TurboBoost Auth] Error:', error)
    console.error('[TurboBoost Auth] Error message:', error.message)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to authenticate with TurboBoost',
      },
      { status: 500 }
    )
  }
}
