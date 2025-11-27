import { NextRequest, NextResponse } from 'next/server'

const TURBOBOOST_API_URL = process.env.TURBOBOOST_API_URL || 'https://turboboost-portal.pages.dev/api'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/turboboost/generate - Create video generation task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, prompt, brief } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'TurboBoost token is required' },
        { status: 401 }
      )
    }

    if (!prompt || !brief) {
      return NextResponse.json(
        { success: false, error: 'Prompt and brief are required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${TURBOBOOST_API_URL}/tasks/generate-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        prompt,
        brief,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Video generation failed')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      task_id: data.task_id,
      message: data.message,
    })
  } catch (error: any) {
    console.error('TurboBoost generate error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate video',
      },
      { status: 500 }
    )
  }
}
