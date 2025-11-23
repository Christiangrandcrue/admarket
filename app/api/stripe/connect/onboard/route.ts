/**
 * API Route: Create Stripe Connected Account for Creator
 * POST /api/stripe/connect/onboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createConnectedAccount, createAccountLink } from '@/lib/stripe/server'

export async function POST(request: NextRequest) {
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

    // Check if user is a creator
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, stripe_account_id, stripe_account_status')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (userData.role !== 'creator') {
      return NextResponse.json(
        { error: 'Only creators can connect Stripe accounts' },
        { status: 403 }
      )
    }

    // If account already exists, just create a new account link
    if (userData.stripe_account_id) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const returnUrl = `${appUrl}/dashboard/creator/earnings?onboarding=success`
      const refreshUrl = `${appUrl}/dashboard/creator/earnings?onboarding=refresh`

      const accountLink = await createAccountLink(
        userData.stripe_account_id,
        returnUrl,
        refreshUrl
      )

      return NextResponse.json({
        url: accountLink.url,
        accountId: userData.stripe_account_id,
      })
    }

    // Create new Connected Account
    const account = await createConnectedAccount({
      email: user.email || '',
      country: 'RU',
      businessType: 'individual',
    })

    // Save account ID to database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        stripe_account_id: account.id,
        stripe_account_status: 'pending',
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user with Stripe account:', updateError)
      return NextResponse.json(
        { error: 'Failed to save Stripe account' },
        { status: 500 }
      )
    }

    // Create onboarding link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = `${appUrl}/dashboard/creator/earnings?onboarding=success`
    const refreshUrl = `${appUrl}/dashboard/creator/earnings?onboarding=refresh`

    const accountLink = await createAccountLink(account.id, returnUrl, refreshUrl)

    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id,
    })
  } catch (error: any) {
    console.error('Error creating Stripe Connected Account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe account' },
      { status: 500 }
    )
  }
}
