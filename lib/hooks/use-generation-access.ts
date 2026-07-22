"use client";

import { useCustomer } from "autumn-js/react";
import { GENERATION_FEATURE } from "@/lib/billing/constants";

export { GENERATION_FEATURE };

export function useGenerationAccess() {
  const { check, refetch, data } = useCustomer();

  const balance = data?.balances?.[GENERATION_FEATURE]?.remaining ?? null;

  const assertCanGenerate = (): boolean => {
    if (!data) return true;
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

  return { assertCanGenerate, refetch, balance, data };
}
