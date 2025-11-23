/**
 * API Route: Stripe Webhook Handler
 * POST /api/stripe/webhook
 * 
 * Handles events from Stripe:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - transfer.created
 * - account.updated
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Disable body parsing, need raw body for signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('⚠️ STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  console.log('✅ Stripe webhook event received:', event.type)

  const supabase = await createClient()

  try {
    switch (event.type) {
      // Payment succeeded
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const campaignId = paymentIntent.metadata.campaignId

        if (campaignId) {
          // Update campaign status
          await supabase
            .from('campaigns')
            .update({
              payment_status: 'succeeded',
              status: 'active',
              paid_at: new Date().toISOString(),
            })
            .eq('id', campaignId)

          // Update transaction status
          await supabase
            .from('transactions')
            .update({ status: 'succeeded' })
            .eq('stripe_id', paymentIntent.id)

          console.log(`✅ Campaign ${campaignId} payment succeeded`)

          // TODO: Send notification to advertiser
          // TODO: Notify creators that campaign is now active
        }
        break
      }

      // Payment failed
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const campaignId = paymentIntent.metadata.campaignId

        if (campaignId) {
          await supabase
            .from('campaigns')
            .update({ payment_status: 'failed' })
            .eq('id', campaignId)

          await supabase
            .from('transactions')
            .update({ status: 'failed' })
            .eq('stripe_id', paymentIntent.id)

          console.log(`❌ Campaign ${campaignId} payment failed`)

          // TODO: Send notification to advertiser about failed payment
        }
        break
      }

      // Transfer to creator succeeded
      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        const placementId = transfer.metadata.placementId

        if (placementId) {
          await supabase
            .from('placements')
            .update({
              stripe_transfer_id: transfer.id,
              payout_status: 'processing',
            })
            .eq('id', placementId)

          console.log(`✅ Transfer created for placement ${placementId}`)
        }
        break
      }

      // Transfer succeeded (funds sent to creator)
      case 'transfer.updated': {
        const transfer = event.data.object as Stripe.Transfer
        const placementId = transfer.metadata.placementId

        if (placementId && transfer.amount > 0) {
          const payoutAmount = transfer.amount / 100 // cents to rubles

          await supabase
            .from('placements')
            .update({
              payout_status: 'paid',
              payout_amount: payoutAmount,
              paid_out_at: new Date().toISOString(),
            })
            .eq('id', placementId)

          // Create transaction record
          const { data: placement } = await supabase
            .from('placements')
            .select('campaign_id, channel:channels!placements_channel_id_fkey(creator_id)')
            .eq('id', placementId)
            .single()

          if (placement) {
            const creatorId = (placement.channel as any)?.creator_id

            await supabase.from('transactions').insert({
              user_id: creatorId,
              campaign_id: placement.campaign_id,
              placement_id: placementId,
              type: 'payout',
              amount: payoutAmount,
              currency: 'RUB',
              stripe_id: transfer.id,
              status: 'succeeded',
            })

            console.log(`✅ Payout completed for placement ${placementId}`)

            // TODO: Send notification to creator about received payout
          }
        }
        break
      }

      // Connected account updated
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        const accountId = account.id

        // Update user's Stripe account status
        await supabase
          .from('users')
          .update({
            stripe_account_status: account.charges_enabled ? 'connected' : 'pending',
            stripe_charges_enabled: account.charges_enabled,
            stripe_payouts_enabled: account.payouts_enabled,
            stripe_onboarding_completed: account.details_submitted,
          })
          .eq('stripe_account_id', accountId)

        console.log(`✅ Account ${accountId} status updated`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
