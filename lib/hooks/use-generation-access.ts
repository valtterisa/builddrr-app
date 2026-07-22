"use client";

import { useConvexAuth } from "convex/react";
import { useCustomer } from "autumn-js/react";
import {
  AI_CREDITS_FEATURE,
  MIN_CREDIT_BALANCE,
} from "@/lib/billing/constants";
import {
  hasActivePaidPlan,
  type GenerationDenyReason,
} from "@/lib/billing/plan";

export { AI_CREDITS_FEATURE, GENERATION_FEATURE } from "@/lib/billing/constants";

export function useGenerationAccess() {
  const { isAuthenticated } = useConvexAuth();
  const { check, refetch, data } = useCustomer({
    errorOnNotFound: false,
    queryOptions: { enabled: isAuthenticated },
  });

  const balance = data?.balances?.[AI_CREDITS_FEATURE]?.remaining ?? null;
  const billingReady = Boolean(isAuthenticated && data);
  const hasPaidPlan = billingReady ? hasActivePaidPlan(data) : false;

  const getDenyReason = (): GenerationDenyReason | null => {
    if (!isAuthenticated || !data) return null;
    if (!hasActivePaidPlan(data)) return "no_plan";
    try {
      const { allowed } = check({
        featureId: AI_CREDITS_FEATURE,
        requiredBalance: MIN_CREDIT_BALANCE,
      });
      if (allowed === false) return "no_credits";
    } catch {
      return null;
    }
    return null;
  };

  const assertCanGenerate = (): boolean => getDenyReason() === null;

  return {
    assertCanGenerate,
    getDenyReason,
    hasPaidPlan,
    billingReady,
    refetch,
    balance,
    data,
    isAuthenticated,
  };
}
