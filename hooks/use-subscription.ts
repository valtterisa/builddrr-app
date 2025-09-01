"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "trialing"
  | "past_due"
  | null;

export interface UserSubscription {
  plan: "free" | "pro" | "enterprise";
  status: SubscriptionStatus;
  periodEnd: Date | null;
  isActive: boolean;
  isLoading: boolean;
  error: Error | null;
  aiUsageLimits?: {
    monthly_chat_requests: number;
    monthly_content_generation_requests: number;
    monthly_code_generation_requests: number;
    monthly_image_generation_requests: number;
    monthly_token_limit: number;
  };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription>({
    plan: "free",
    status: null,
    periodEnd: null,
    isActive: false,
    isLoading: true,
    error: null,
  });

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUser(user);
    } catch (err) {
      console.error("Error in fetchUser:", err);
    }
  };

  const fetchSubscription = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get user's websites
      const { data: websites, error: websitesError } = await supabase
        .from("websites")
        .select("id")
        .eq("user_id", user.id);

      if (websitesError) {
        throw new Error(
          `Database error: ${websitesError.message || JSON.stringify(websitesError)}`
        );
      }

      if (!websites || websites.length === 0) {
        // No websites, default to free plan
        setSubscription({
          plan: "free",
          status: null,
          periodEnd: null,
          isActive: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      const websiteIds = websites.map((website) => website.id);

      // Get active subscription for any of user's websites
      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select(
            `
            id,
            status,
            current_period_end,
            plan_id,
            plans:plan_id (
              name
            )
          `
          )
          .in("website_id", websiteIds)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .maybeSingle();

      if (subscriptionError) {
        throw new Error(
          `Database error: ${subscriptionError.message || JSON.stringify(subscriptionError)}`
        );
      }

      if (!subscriptionData) {
        // No active subscription, default to free plan
        setSubscription({
          plan: "free",
          status: null,
          periodEnd: null,
          isActive: false,
          isLoading: false,
          error: null,
        });
      } else {
        // Determine plan from subscription data
        const planName =
          (subscriptionData.plans as any)?.name?.toLowerCase() || "free";
        const periodEnd = subscriptionData.current_period_end
          ? new Date(subscriptionData.current_period_end)
          : null;

        setSubscription({
          plan:
            planName === "pro" || planName === "enterprise" ? planName : "free",
          status: subscriptionData.status as SubscriptionStatus,
          periodEnd,
          isActive:
            subscriptionData.status === "active" ||
            subscriptionData.status === "trialing",
          isLoading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      // Set default values if we can't fetch subscription data
      setSubscription({
        plan: "free", // Default to free plan
        status: null,
        periodEnd: null,
        isActive: false,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user, fetchSubscription]);

  useEffect(() => {
    let authSubscription: any;

    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });
      authSubscription = data.subscription;
    } catch (err) {
      console.error("Error setting up auth listener:", err);
      setError(
        err instanceof Error
          ? err
          : new Error(`Auth listener error: ${String(err)}`)
      );
      setIsLoading(false);
    }

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [supabase.auth]);

  return {
    ...subscription,
    isLoading,
    error,
  };
}
