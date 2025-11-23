/**
 * API Route: Check Stripe Connected Account Status
 * GET /api/stripe/connect/status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConnectedAccount } from '@/lib/stripe/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Stripe account ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        status: 'not_connected',
      })
    }

    // Get account details from Stripe
    const account = await getConnectedAccount(userData.stripe_account_id)

    // Determine account status
    const chargesEnabled = account.charges_enabled || false
    const payoutsEnabled = account.payouts_enabled || false
    const detailsSubmitted = account.details_submitted || false

    let status = 'pending'
    if (chargesEnabled && payoutsEnabled && detailsSubmitted) {
      status = 'connected'
    } else if (detailsSubmitted) {
      status = 'pending'
    } else {
      status = 'not_connected'
    }

    // Update database with latest status
    await supabase
      .from('users')
      .update({
        stripe_account_status: status,
        stripe_onboarding_completed: detailsSubmitted,
        stripe_charges_enabled: chargesEnabled,
        stripe_payouts_enabled: payoutsEnabled,
      })
      .eq('id', user.id)

    return NextResponse.json({
      connected: chargesEnabled && payoutsEnabled,
      status,
      accountId: account.id,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      requiresAction: !detailsSubmitted || !chargesEnabled || !payoutsEnabled,
    })
  } catch (error: any) {
    console.error('Error checking Stripe account status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check account status' },
      { status: 500 }
    )
  }
}
