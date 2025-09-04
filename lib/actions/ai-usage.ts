"use server";

import { createClient } from "@/lib/supabase/server";
import { trackUsageDual } from "@/lib/polar-usage-tracker";

/**
 * Server action to check if user has remaining AI usage for chat
 * This is the secure server-side way to check limits
 */
export async function checkRemainingChatUsage(): Promise<{
  hasRemainingUsage: boolean;
  currentUsage: number;
  limit: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        hasRemainingUsage: false,
        currentUsage: 0,
        limit: 0,
        error: "User not authenticated",
      };
    }

    // Get user's current usage limits
    const { data: limits, error: limitsError } = await supabase.rpc(
      "check_ai_usage_limits",
      { user_uuid: user.id }
    );

    if (limitsError) {
      throw new Error(`Failed to check usage limits: ${limitsError.message}`);
    }

    // Find chat usage limit
    const chatLimit = limits?.find((limit: any) => limit.usage_type === "chat");

    if (!chatLimit) {
      // If no limits found, assume unlimited (enterprise plan)
      return {
        hasRemainingUsage: true,
        currentUsage: 0,
        limit: -1,
      };
    }

    const hasRemainingUsage = !chatLimit.is_exceeded;

    return {
      hasRemainingUsage,
      currentUsage: chatLimit.current_usage || 0,
      limit: chatLimit.limit_value || 0,
    };
  } catch (error) {
    console.error("Error checking remaining chat usage:", error);
    return {
      hasRemainingUsage: false,
      currentUsage: 0,
      limit: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Server action to track AI usage (just count calls, no token tracking)
 * This is the secure server-side way to track usage
 */
export async function trackAICall(websiteId?: string): Promise<{
  success: boolean;
  error?: string;
  limits?: any[];
}> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Track usage in both Polar and Supabase (just count the call, no tokens)
    const result = await trackUsageDual(
      "chat",
      0, // No token tracking, just count the call
      websiteId,
      undefined, // No polar customer ID needed for basic tracking
      user.id
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Usage tracking failed",
      };
    }

    // Get updated limits after tracking
    const { data: limits, error: limitsError } = await supabase.rpc(
      "check_ai_usage_limits",
      { user_uuid: user.id }
    );

    if (limitsError) {
      console.warn("Failed to check limits after tracking:", limitsError);
    }

    return {
      success: true,
      limits: limits || [],
    };
  } catch (error) {
    console.error("Error tracking AI call:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Server action to create a website with usage limit check
 * This ensures users can't bypass limits by calling APIs directly
 */
export async function createWebsiteWithLimitCheck(
  appName: string,
  displayName: string
): Promise<{
  success: boolean;
  websiteId?: string;
  previewId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Check usage limits before creating website
    const usageCheck = await checkRemainingChatUsage();
    if (!usageCheck.hasRemainingUsage) {
      return {
        success: false,
        error: "AI usage limit exceeded. Please upgrade your plan.",
      };
    }

    // Create both preview environment and website records
    const [previewInsert, websiteInsert] = await Promise.all([
      supabase
        .from("preview_environments")
        .insert({
          app_name: appName,
          id: user.id,
          assigned_at: new Date().toISOString(),
        })
        .select()
        .single(),
      supabase
        .from("websites")
        .insert({
          user_id: user.id,
          name: displayName,
          app_name: appName,
          created_at: new Date().toISOString(),
        })
        .select()
        .single(),
    ]);

    if (previewInsert.error) {
      return {
        success: false,
        error: `Failed to create preview environment: ${previewInsert.error.message}`,
      };
    }

    if (websiteInsert.error) {
      return {
        success: false,
        error: `Failed to create website: ${websiteInsert.error.message}`,
      };
    }

    // Link the website to the preview environment
    const { error: linkError } = await supabase
      .from("websites")
      .update({ preview_id: previewInsert.data.preview_id })
      .eq("id", websiteInsert.data.id);

    if (linkError) {
      return {
        success: false,
        error: `Failed to link website to preview: ${linkError.message}`,
      };
    }

    return {
      success: true,
      websiteId: websiteInsert.data.id,
      previewId: previewInsert.data.preview_id,
    };
  } catch (error) {
    console.error("Error creating website with limit check:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
