/**
 * Stripe Server-side Client
 * For API Routes and Server Components only
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

/**
 * Create a Connected Account for a creator
 * Used during creator onboarding
 */
export async function createConnectedAccount(params: {
  email: string
  country?: string
  businessType?: 'individual' | 'company'
}) {
  const account = await stripe.accounts.create({
    type: 'express', // Express for easier onboarding
    country: params.country || 'RU',
    email: params.email,
    business_type: params.businessType || 'individual',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  return account
}

/**
 * Create an onboarding link for a connected account
 * Creator clicks this to complete Stripe KYC
 */
export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  return accountLink
}

/**
 * Get Connected Account details
 */
export async function getConnectedAccount(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId)
  return account
}

/**
 * Create a Payment Intent for campaign payment
 * Money is held in escrow until content is approved
 */
export async function createPaymentIntent(params: {
  amount: number // in cents
  currency?: string
  customerId?: string
  metadata: {
    campaignId: string
    advertiserId: string
    platformFee: string
  }
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency || 'rub',
    customer: params.customerId,
    metadata: params.metadata,
    // Capture manually after content approval
    capture_method: 'manual',
    // Enable automatic payment methods
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return paymentIntent
}

/**
 * Capture a Payment Intent
 * Called when all content is approved and ready to release funds
 */
export async function capturePaymentIntent(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId)
  return paymentIntent
}

/**
 * Cancel a Payment Intent
 * Called when campaign is canceled before content approval
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)
  return paymentIntent
}

/**
 * Transfer funds to a creator's connected account
 * Called after content is approved and payment is captured
 */
export async function transferToCreator(params: {
  amount: number // in cents
  currency?: string
  destination: string // connected account ID
  metadata: {
    campaignId: string
    placementId: string
    creatorId: string
    [key: string]: string
  }
}) {
  const transfer = await stripe.transfers.create({
    amount: params.amount,
    currency: params.currency || 'rub',
    destination: params.destination,
    metadata: params.metadata,
  })

  return transfer
}

/**
 * Create a refund for a payment intent
 * Called when campaign is disputed or canceled after payment
 */
export async function createRefund(params: {
  paymentIntentId: string
  amount?: number // in cents, optional (full refund if not specified)
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}) {
  const refund = await stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: params.amount,
    reason: params.reason,
  })

  return refund
}

/**
 * Create a Stripe Customer for an advertiser
 * Stores payment methods for future use
 */
export async function createCustomer(params: {
  email: string
  name?: string
  metadata?: Record<string, string>
}) {
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  })

  return customer
}

/**
 * Get or create a Stripe Customer
 */
export async function getOrCreateCustomer(params: {
  email: string
  name?: string
  userId: string
}) {
  // Try to find existing customer
  const customers = await stripe.customers.list({
    email: params.email,
    limit: 1,
  })

  if (customers.data.length > 0) {
    return customers.data[0]
  }

  // Create new customer
  return createCustomer({
    email: params.email,
    name: params.name,
    metadata: { userId: params.userId },
  })
}

/**
 * Calculate platform fee (10% of total)
 */
export function calculatePlatformFee(totalAmount: number): {
  platformFee: number
  creatorPayout: number
} {
  const platformFee = Math.round(totalAmount * 0.1)
  const creatorPayout = totalAmount - platformFee

  return { platformFee, creatorPayout }
}

/**
 * Convert rubles to cents (Stripe uses cents)
 */
export function rublesToCents(rubles: number): number {
  return Math.round(rubles * 100)
}

/**
 * Convert cents to rubles
 */
export function centsToRubles(cents: number): number {
  return cents / 100
}
