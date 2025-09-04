"use server";

import { createClient } from "@/lib/supabase/server";
import { trackUsageDual } from "@/lib/polar-usage-tracker";

export async function trackAICall(websiteId?: string): Promise<{
  success: boolean;
  error?: string;
  limits?: any[];
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const result = await trackUsageDual(
      "chat",
      0,
      websiteId,
      undefined,
      user.id
    );
    if (!result.success) {
      return { success: false, error: result.error || "Usage tracking failed" };
    }

    const { data: limits } = await supabase.rpc("check_ai_usage_limits", {
      user_uuid: user.id,
    });

    return { success: true, limits: limits || [] };
  } catch (error) {
    console.error("Error tracking AI call:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function checkUsageLimits(): Promise<{
  hasExceeded: boolean;
  limits: any[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { hasExceeded: false, limits: [] };

    const { data, error } = await supabase.rpc("check_ai_usage_limits", {
      user_uuid: user.id,
    });
    if (error) throw error;

    // Determine if any limit is exceeded
    const limits = data || [];
    const hasExceeded = limits.some((l: any) => l.is_exceeded === true);
    return { hasExceeded, limits };
  } catch (error) {
    return {
      hasExceeded: false,
      limits: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function checkRemainingChatUsage(): Promise<{
  hasRemainingUsage: boolean;
  currentUsage: number;
  limit: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return { success: false, error: "User not authenticated" };

    const usage = await checkRemainingChatUsage();
    if (!usage.hasRemainingUsage) {
      return {
        success: false,
        error: "AI usage limit exceeded. Please upgrade your plan.",
      };
    }

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

    if (previewInsert.error)
      return {
        success: false,
        error: `Failed to create preview environment: ${previewInsert.error.message}`,
      };
    if (websiteInsert.error)
      return {
        success: false,
        error: `Failed to create website: ${websiteInsert.error.message}`,
      };

    const { error: linkError } = await supabase
      .from("websites")
      .update({ preview_id: previewInsert.data.preview_id })
      .eq("id", websiteInsert.data.id);
    if (linkError)
      return {
        success: false,
        error: `Failed to link website to preview: ${linkError.message}`,
      };

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
