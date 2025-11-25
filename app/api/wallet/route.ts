import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/wallet - Get user balance and recent transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Get user balance
    const balanceResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_balances?user_id=eq.${userId}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    let balance = null
    if (balanceResponse.ok) {
      const balances = await balanceResponse.json()
      if (balances && balances.length > 0) {
        balance = balances[0]
      }
    }

    // Get recent transactions
    const transactionsResponse = await fetch(
      `${supabaseUrl}/rest/v1/transactions?user_id=eq.${userId}&order=created_at.desc&limit=50`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    let transactions = []
    if (transactionsResponse.ok) {
      transactions = await transactionsResponse.json()
    }

    return NextResponse.json({
      success: true,
      balance,
      transactions,
    })
  } catch (error: any) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
}
