/**
 * API Route: Create Payment Intent for Campaign
 * POST /api/stripe/payment-intent
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createPaymentIntent,
  getOrCreateCustomer,
  rublesToCents,
  calculatePlatformFee,
} from '@/lib/stripe/server'

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

    // Parse request body
    const body = await request.json()
    const { campaignId } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, advertiser_id, total_budget, payment_status, stripe_payment_intent_id')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Verify ownership
    if (campaign.advertiser_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to pay for this campaign' },
        { status: 403 }
      )
    }

    // Check if already paid
    if (campaign.payment_status === 'succeeded') {
      return NextResponse.json(
        { error: 'Campaign is already paid' },
        { status: 400 }
      )
    }

    // If Payment Intent already exists, return it
    if (campaign.stripe_payment_intent_id) {
      return NextResponse.json({
        clientSecret: campaign.stripe_payment_intent_id,
        paymentIntentId: campaign.stripe_payment_intent_id,
      })
    }

    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()

    // Get or create Stripe Customer
    const customer = await getOrCreateCustomer({
      email: user.email || '',
      name: userData?.name,
      userId: user.id,
    })

    // Calculate fees
    const totalBudget = campaign.total_budget
    const { platformFee, creatorPayout } = calculatePlatformFee(totalBudget)
    const amountInCents = rublesToCents(totalBudget)

    // Create Payment Intent
    const paymentIntent = await createPaymentIntent({
      amount: amountInCents,
      currency: 'rub',
      customerId: customer.id,
      metadata: {
        campaignId: campaign.id,
        advertiserId: user.id,
        platformFee: platformFee.toString(),
      },
    })

    // Update campaign with Payment Intent ID
    await supabase
      .from('campaigns')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'processing',
      })
      .eq('id', campaignId)

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      campaign_id: campaignId,
      type: 'charge',
      amount: totalBudget,
      currency: 'RUB',
      stripe_id: paymentIntent.id,
      status: 'pending',
      metadata: {
        platformFee,
        creatorPayout,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalBudget,
      platformFee,
      creatorPayout,
    })
  } catch (error: any) {
    console.error('Error creating Payment Intent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
