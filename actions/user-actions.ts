"use server"

import { createStripeCustomer } from "@/lib/stripe"
import { getSupabaseClient } from "@/lib/supabase"

/**
 * Ensures a user has a Stripe customer ID
 * Creates one if it doesn't exist
 */
export async function ensureStripeCustomer(userId: string) {
  const supabase = getSupabaseClient()

  // Get the user's profile
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    throw new Error(`Failed to get user profile: ${error.message}`)
  }

  // If the user already has a Stripe customer ID, return it
  if (profile.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  // Get the user's email
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.admin.getUserById(userId)

  if (userError || !user) {
    throw new Error(`Failed to get user: ${userError?.message || "User not found"}`)
  }

  // Create a Stripe customer
  const customer = await createStripeCustomer(user.email || "", profile.full_name || undefined)

  // Update the user's profile with the Stripe customer ID
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      stripe_customer_id: customer.id,
    })
    .eq("id", userId)

  if (updateError) {
    throw new Error(`Failed to update user profile: ${updateError.message}`)
  }

  return customer.id
}

/**
 * Gets a user's subscription details
 */
export async function getUserSubscription(userId: string) {
  const supabase = getSupabaseClient()

  // Get the user's profile
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    throw new Error(`Failed to get user profile: ${error.message}`)
  }

  return {
    plan: profile.plan || "starter",
    subscriptionStatus: profile.subscription_status,
    subscriptionPeriodEnd: profile.subscription_period_end,
    stripeCustomerId: profile.stripe_customer_id,
    stripeSubscriptionId: profile.stripe_subscription_id,
  }
}

