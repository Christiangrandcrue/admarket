import { NextRequest, NextResponse } from 'next/server'

const TURBOBOOST_API_URL = process.env.TURBOBOOST_API_URL || 'https://turboboost-portal.pages.dev/api'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/turboboost/tasks/[id] - Check video generation status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header is required' },
        { status: 401 }
      )
    }

    const response = await fetch(`${TURBOBOOST_API_URL}/tasks/${id}`, {
      headers: {
        'Authorization': authHeader,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to get task status')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      task: data.task,
    })
  } catch (error: any) {
    console.error('TurboBoost task status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get task status',
      },
      { status: 500 }
    )
  }
}
