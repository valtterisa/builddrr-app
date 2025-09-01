import { createClient } from "@/lib/supabase/client";

export interface PolarUsageEvent {
  customer_id: string;
  event_name: string;
  properties: Record<string, any>;
  timestamp: string;
}

export interface UsageTrackingResult {
  success: boolean;
  polarTracked?: boolean;
  supabaseTracked?: boolean;
  error?: string;
  usageId?: string;
}

/**
 * Track usage in both Polar (for billing) and Supabase (for service limiting)
 * This gives us the best of both worlds:
 * - Polar handles usage-based billing for PAID plans only
 * - Supabase handles service limits and enforcement for ALL plans
 */
export async function trackUsageDual(
  usageType: "chat",
  tokensUsed: number,
  websiteId?: string,
  polarCustomerId?: string,
  userId?: string
): Promise<UsageTrackingResult> {
  const supabase = createClient();

  try {
    // 1. First track in Supabase for service limiting (ALL plans)
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get user's current plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const userPlan = profile.plan;

    // Insert into Supabase ai_usage table
    const { data: usageData, error: supabaseError } = await supabase
      .from("ai_usage")
      .insert({
        user_id: userId,
        website_id: websiteId,
        usage_type: usageType,
        tokens_used: tokensUsed,
        requests_count: 1,
        cost_usd: calculateCost(tokensUsed, usageType),
        polar_customer_id: polarCustomerId, // Store for reference if available
      })
      .select()
      .single();

    if (supabaseError) {
      throw new Error(`Supabase tracking failed: ${supabaseError.message}`);
    }

    // 2. Only track in Polar for PAID plans (pro/enterprise)
    let polarTracked = false;
    if (polarCustomerId && (userPlan === "pro" || userPlan === "enterprise")) {
      try {
        await trackPolarUsage(polarCustomerId, usageType, tokensUsed);
        polarTracked = true;
      } catch (polarError) {
        console.warn(
          "Polar tracking failed, but Supabase tracking succeeded:",
          polarError
        );
        // Don't fail the entire operation if Polar tracking fails
      }
    } else if (userPlan === "free") {
      console.log("Free plan user - skipping Polar tracking");
    }

    return {
      success: true,
      polarTracked,
      supabaseTracked: true,
      usageId: usageData.id,
    };
  } catch (error) {
    console.error("Usage tracking failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Track usage in Polar.sh for billing purposes (PAID plans only)
 * This uses Polar's Usage Plugin API endpoints
 */
async function trackPolarUsage(
  customerId: string,
  usageType: string,
  tokensUsed: number
): Promise<void> {
  const POLAR_API_URL =
    process.env.NEXT_PUBLIC_POLAR_API_URL || "https://api.polar.sh";
  const POLAR_API_KEY = process.env.POLAR_API_KEY;

  if (!POLAR_API_KEY) {
    throw new Error("POLAR_API_KEY not configured");
  }

  // Polar Usage Plugin endpoint for ingesting events
  const response = await fetch(`${POLAR_API_URL}/api/v1/usage/events`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${POLAR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer_id: customerId,
      event_name: `ai_${usageType}_usage`,
      properties: {
        usage_type: usageType,
        tokens_used: tokensUsed,
        requests_count: 1,
        timestamp: new Date().toISOString(),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Polar API error: ${response.status} - ${errorText}`);
  }
}

/**
 * Get usage data from Polar for a specific customer (PAID plans only)
 * Useful for syncing data between Polar and Supabase
 */
export async function getPolarUsage(
  customerId: string,
  startDate: string,
  endDate: string
): Promise<any> {
  const POLAR_API_URL =
    process.env.NEXT_PUBLIC_POLAR_API_URL || "https://api.polar.sh";
  const POLAR_API_KEY = process.env.POLAR_API_KEY;

  if (!POLAR_API_KEY) {
    throw new Error("POLAR_API_KEY not configured");
  }

  const response = await fetch(
    `${POLAR_API_URL}/api/v1/usage/customers/${customerId}/usage?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: {
        "Authorization": `Bearer ${POLAR_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Polar API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Sync usage data between Polar and Supabase (PAID plans only)
 * Useful for ensuring data consistency
 */
export async function syncUsageData(
  customerId: string,
  startDate: string,
  endDate: string
): Promise<void> {
  try {
    // Get usage from Polar
    const polarUsage = await getPolarUsage(customerId, startDate, endDate);

    // Get usage from Supabase
    const supabase = createClient();
    const { data: supabaseUsage } = await supabase
      .from("ai_usage")
      .select("*")
      .eq("polar_customer_id", customerId)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Compare and sync if needed
    // This is a basic implementation - you might want more sophisticated logic
    console.log("Usage sync completed", { polarUsage, supabaseUsage });
  } catch (error) {
    console.error("Usage sync failed:", error);
    throw error;
  }
}

/**
 * Calculate cost based on usage type and tokens
 * This should match your actual AI provider costs
 */
function calculateCost(tokens: number, usageType: string): number {
  // Adjust these rates based on your actual AI provider costs
  const rates = {
    chat: 0.000002, // $0.002 per 1K tokens
    content_generation: 0.000003,
    code_generation: 0.000004,
    image_generation: 0.0001,
  };

  const rate = rates[usageType as keyof typeof rates] || rates.chat;
  return (tokens / 1000) * rate;
}

/**
 * Get customer ID from user's subscription data (PAID plans only)
 * Free plan users don't have Polar customer IDs
 */
export async function getCustomerIdFromUser(
  userId: string
): Promise<string | null> {
  const supabase = createClient();

  // First check if user has a paid plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, polar_customer_id")
    .eq("id", userId)
    .single();

  if (!profile) {
    return null;
  }

  // Free plan users don't have Polar customer IDs
  if (profile.plan === "free") {
    return null;
  }

  // Return customer ID if available for paid plans
  if (profile.polar_customer_id) {
    return profile.polar_customer_id;
  }

  // Try to get from subscriptions table for paid plans
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("polar_customer_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  return subscription?.polar_customer_id || null;
}

/**
 * Enhanced usage tracking that automatically gets customer ID
 * Only tracks in Polar for paid plans
 */
export async function trackUsageAuto(
  usageType: "chat",
  tokensUsed: number,
  websiteId?: string
): Promise<UsageTrackingResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get customer ID automatically (will be null for free plan users)
  const customerId = await getCustomerIdFromUser(user.id);

  // Track usage in both systems
  return trackUsageDual(
    usageType,
    tokensUsed,
    websiteId,
    customerId || undefined,
    user.id
  );
}
