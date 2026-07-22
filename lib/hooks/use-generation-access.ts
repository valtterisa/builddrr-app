"use client";

import { useConvexAuth } from "convex/react";
import { useCustomer } from "autumn-js/react";
import { GENERATION_FEATURE } from "@/lib/billing/constants";

export { GENERATION_FEATURE };

export function useGenerationAccess() {
  const { isAuthenticated } = useConvexAuth();
  const { check, refetch, data } = useCustomer({
    errorOnNotFound: false,
    queryOptions: { enabled: isAuthenticated },
  });

  const balance = data?.balances?.[GENERATION_FEATURE]?.remaining ?? null;

  const assertCanGenerate = (): boolean => {
    if (!isAuthenticated || !data) return true;
    try {
      const { allowed } = check({
        featureId: GENERATION_FEATURE,
        requiredBalance: 1,
      });
      return allowed !== false;
    } catch {
      return true;
    }
  };

  return { assertCanGenerate, refetch, balance, data, isAuthenticated };
}
