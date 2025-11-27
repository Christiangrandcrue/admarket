import { NextRequest, NextResponse } from 'next/server'

const TURBOBOOST_API_URL = process.env.TURBOBOOST_API_URL || 'https://turboboost-portal.pages.dev/api'
const TURBOBOOST_EMAIL = process.env.TURBOBOOST_EMAIL || 'inbe@ya.ru'
const TURBOBOOST_PASSWORD = process.env.TURBOBOOST_PASSWORD || 'rewfdsvcx5'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/turboboost/auth - Authenticate with TurboBoost
export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${TURBOBOOST_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TURBOBOOST_EMAIL,
        password: TURBOBOOST_PASSWORD,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'TurboBoost authentication failed')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      token: data.token,
      user: data.user,
    })
  } catch (error: any) {
    console.error('TurboBoost auth error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to authenticate with TurboBoost',
      },
      { status: 500 }
    )
  }
}
