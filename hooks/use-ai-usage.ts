"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AIUsageSummary,
  AIUsageLimitCheck,
  AIUsageLimit,
  PlanLimits,
} from "@/lib/types";

export interface AIUsageData {
  usage: AIUsageSummary[];
  limits: AIUsageLimitCheck[];
  planLimits: PlanLimits | null;
  isLoading: boolean;
  error: Error | null;
  trackUsage: (
    usageType: string,
    tokensUsed: number,
    websiteId?: string
  ) => Promise<void>;
  checkLimits: () => Promise<AIUsageLimitCheck[]>;
}

export function useAIUsage(): AIUsageData {
  const [usage, setUsage] = useState<AIUsageSummary[]>([]);
  const [limits, setLimits] = useState<AIUsageLimitCheck[]>([]);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchUsage = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc("get_user_monthly_ai_usage", {
        user_uuid: user.id,
      });

      if (error) throw error;
      setUsage(data || []);
    } catch (err) {
      console.error("Error fetching AI usage:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setUsage([]);
    }
  };

  const fetchPlanLimits = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_usage_limits")
        .select("*")
        .order("plan_name");

      if (error) throw error;

      if (data && data.length > 0) {
        const limitsMap: PlanLimits = {
          free: data.find((l) => l.plan_name === "free") as AIUsageLimit,
          pro: data.find((l) => l.plan_name === "pro") as AIUsageLimit,
          enterprise: data.find(
            (l) => l.plan_name === "enterprise"
          ) as AIUsageLimit,
        };

        // Verify all plans are found
        if (limitsMap.free && limitsMap.pro && limitsMap.enterprise) {
          setPlanLimits(limitsMap);
        } else {
          console.warn("Some plan limits are missing:", limitsMap);
          setPlanLimits(limitsMap);
        }
      } else {
        console.warn("No plan limits found in database");
        setPlanLimits(null);
      }
    } catch (err) {
      console.error("Error fetching plan limits:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setPlanLimits(null);
    }
  };

  const checkLimits = async (): Promise<AIUsageLimitCheck[]> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.rpc("check_ai_usage_limits", {
        user_uuid: user.id,
      });

      if (error) throw error;

      const limitsData = data || [];
      setLimits(limitsData);
      return limitsData;
    } catch (err) {
      console.error("Error checking AI usage limits:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLimits([]);
      return [];
    }
  };

  const trackUsage = async (
    usageType: string,
    tokensUsed: number,
    websiteId?: string
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Only track chat usage
      if (usageType !== "chat") {
        console.warn("Only chat usage is supported, ignoring:", usageType);
        return;
      }

      const { error } = await supabase.from("ai_usage").insert({
        user_id: user.id,
        website_id: websiteId,
        usage_type: usageType,
        tokens_used: tokensUsed,
        requests_count: 1,
        cost_usd: calculateCost(tokensUsed, usageType),
      });

      if (error) throw error;

      // Refresh usage data
      await fetchUsage();
      await checkLimits();
    } catch (err) {
      console.error("Error tracking AI usage:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const calculateCost = (tokens: number, usageType: string): number => {
    // Rough cost calculation - adjust based on your actual AI provider costs
    const costPerToken = 0.000002; // $0.002 per 1K tokens (example)
    return (tokens / 1000) * costPerToken;
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchUsage(), fetchPlanLimits(), checkLimits()]);
      } catch (err) {
        console.error("Error initializing AI usage data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  return {
    usage,
    limits,
    planLimits,
    isLoading,
    error,
    trackUsage,
    checkLimits,
  };
}
