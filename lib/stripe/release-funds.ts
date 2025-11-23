/**
 * Release Funds Helper
 * Automatically transfers funds to creator when content is approved
 */

import { createClient } from '@/lib/supabase/server'
import {
  capturePaymentIntent,
  transferToCreator,
  centsToRubles,
  rublesToCents,
} from '@/lib/stripe/server'

interface ReleaseFundsParams {
  placementId: string
  campaignId: string
}

/**
 * Release funds for a single placement
 * Called when content is approved
 */
export async function releaseFundsForPlacement({
  placementId,
  campaignId,
}: ReleaseFundsParams) {
  const supabase = await createClient()

  try {
    // Get placement details
    const { data: placement, error: placementError } = await supabase
      .from('placements')
      .select(`
        id,
        budget,
        payout_status,
        channel:channels!placements_channel_id_fkey(
          id,
          creator_id,
          creator:users!channels_creator_id_fkey(
            id,
            stripe_account_id,
            stripe_account_status
          )
        )
      `)
      .eq('id', placementId)
      .single()

    if (placementError || !placement) {
      throw new Error('Placement not found')
    }

    // Check if already paid
    if (placement.payout_status === 'paid' || placement.payout_status === 'processing') {
      console.log(`⚠️ Placement ${placementId} already paid or processing`)
      return { success: false, reason: 'Already paid' }
    }

    // Get creator's Stripe account
    const creator = (placement.channel as any)?.creator
    if (!creator?.stripe_account_id) {
      console.error(`❌ Creator doesn't have Stripe account connected`)
      return { success: false, reason: 'No Stripe account' }
    }

    if (creator.stripe_account_status !== 'connected') {
      console.error(`❌ Creator's Stripe account is not fully connected`)
      return { success: false, reason: 'Stripe account not verified' }
    }

    // Get campaign payment details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('stripe_payment_intent_id, payment_status, total_budget, platform_fee')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      throw new Error('Campaign not found')
    }

    // Check if campaign is paid
    if (campaign.payment_status !== 'succeeded') {
      console.error(`❌ Campaign ${campaignId} is not paid yet`)
      return { success: false, reason: 'Campaign not paid' }
    }

    // Calculate payout amount (budget minus 10% platform fee)
    const placementBudget = placement.budget
    const platformFee = Math.round(placementBudget * 0.1)
    const payoutAmount = placementBudget - platformFee
    const payoutAmountCents = rublesToCents(payoutAmount)

    // Transfer funds to creator
    const transfer = await transferToCreator({
      amount: payoutAmountCents,
      currency: 'rub',
      destination: creator.stripe_account_id,
      metadata: {
        campaignId,
        placementId,
        creatorId: creator.id,
      },
    })

    // Update placement status
    await supabase
      .from('placements')
      .update({
        stripe_transfer_id: transfer.id,
        payout_status: 'processing',
        payout_amount: payoutAmount,
      })
      .eq('id', placementId)

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: creator.id,
      campaign_id: campaignId,
      placement_id: placementId,
      type: 'payout',
      amount: payoutAmount,
      currency: 'RUB',
      stripe_id: transfer.id,
      status: 'pending',
      metadata: {
        platformFee,
      },
    })

    console.log(`✅ Funds released for placement ${placementId}: ${payoutAmount} RUB`)

    return {
      success: true,
      transferId: transfer.id,
      amount: payoutAmount,
    }
  } catch (error: any) {
    console.error('Error releasing funds:', error)
    return {
      success: false,
      reason: error.message || 'Transfer failed',
    }
  }
}

/**
 * Release funds for all approved placements in a campaign
 * Called when campaign is completed
 */
export async function releaseFundsForCampaign(campaignId: string) {
  const supabase = await createClient()

  try {
    // Get all approved placements
    const { data: placements, error } = await supabase
      .from('placements')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('content_status', 'approved')
      .eq('payout_status', 'pending')

    if (error) throw error

    if (!placements || placements.length === 0) {
      return { success: true, count: 0 }
    }

    // Release funds for each placement
    const results = await Promise.allSettled(
      placements.map((placement) =>
        releaseFundsForPlacement({
          placementId: placement.id,
          campaignId,
        })
      )
    )

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length

    console.log(
      `✅ Released funds for ${successful}/${placements.length} placements in campaign ${campaignId}`
    )

    return { success: true, count: successful, total: placements.length }
  } catch (error: any) {
    console.error('Error releasing campaign funds:', error)
    return { success: false, reason: error.message }
  }
}

/**
 * Check if all placements are approved and trigger campaign completion
 */
export async function checkCampaignCompletion(campaignId: string) {
  const supabase = await createClient()

  try {
    // Get campaign placements
    const { data: placements, error } = await supabase
      .from('placements')
      .select('id, content_status, payout_status')
      .eq('campaign_id', campaignId)

    if (error || !placements || placements.length === 0) {
      return { completed: false }
    }

    // Check if all placements are approved
    const allApproved = placements.every(
      (p) => p.content_status === 'approved'
    )

    // Check if all payouts are complete
    const allPaid = placements.every(
      (p) => p.payout_status === 'paid' || p.payout_status === 'processing'
    )

    if (allApproved && allPaid) {
      // Mark campaign as completed
      await supabase
        .from('campaigns')
        .update({ status: 'completed' })
        .eq('id', campaignId)

      console.log(`✅ Campaign ${campaignId} completed`)

      return { completed: true }
    }

    return { completed: false, allApproved, allPaid }
  } catch (error: any) {
    console.error('Error checking campaign completion:', error)
    return { completed: false, error: error.message }
  }
}
