"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { getSupabaseClient } from "@/lib/supabase"

export type SubscriptionStatus = "active" | "canceled" | "incomplete" | "past_due" | "trialing" | "unpaid" | null

export interface UserSubscription {
  plan: "starter" | "pro" | "enterprise"
  status: SubscriptionStatus
  periodEnd: Date | null
  isActive: boolean
  isLoading: boolean
  error: Error | null
}

export function useSubscription(): UserSubscription {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Omit<UserSubscription, "isLoading" | "error">>({
    plan: "starter",
    status: null,
    periodEnd: null,
    isActive: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from("profiles")
          .select("plan, subscription_status, subscription_period_end")
          .eq("id", user.id)
          .single()

        if (error) throw error

        const periodEnd = data.subscription_period_end ? new Date(data.subscription_period_end) : null

        setSubscription({
          plan: data.plan || "starter",
          status: data.subscription_status as SubscriptionStatus,
          periodEnd,
          isActive: data.subscription_status === "active" || data.subscription_status === "trialing",
        })
      } catch (err) {
        console.error("Error fetching subscription:", err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  return {
    ...subscription,
    isLoading,
    error,
  }
}

