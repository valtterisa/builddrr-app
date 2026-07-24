import { Autumn } from "autumn-js";
import {
  AI_CREDITS_FEATURE,
  MIN_CREDIT_BALANCE,
} from "@/lib/billing/constants";
import { hasActivePaidPlan } from "@/lib/billing/plan";

export type AccessResult = {
  hasPaidPlan: boolean;
  creditAllowed: boolean;
};

function billingFailOpen(): boolean {
  if (process.env.BILLING_FAIL_OPEN === "1") return true;
  return process.env.NODE_ENV !== "production";
}

function denyAll(): AccessResult {
  return { hasPaidPlan: false, creditAllowed: false };
}

export async function getAccess(customerId: string): Promise<AccessResult> {
  const secretKey = process.env.AUTUMN_SECRET_KEY;
  if (!secretKey) {
    if (billingFailOpen()) {
      console.warn("[billing] AUTUMN_SECRET_KEY missing — fail-open");
      return { hasPaidPlan: true, creditAllowed: true };
    }
    console.error("[billing] AUTUMN_SECRET_KEY missing — fail-closed");
    return denyAll();
  }

  try {
    const autumn = new Autumn({ secretKey });
    const customer = await autumn.customers.get({ customerId });
    const hasPaidPlan = hasActivePaidPlan(customer);

    if (!hasPaidPlan) {
      return { hasPaidPlan: false, creditAllowed: false };
    }

    try {
      const check = await autumn.check({
        customerId,
        featureId: AI_CREDITS_FEATURE,
        requiredBalance: MIN_CREDIT_BALANCE,
      });
      return {
        hasPaidPlan: true,
        creditAllowed: check.allowed !== false,
      };
    } catch (error) {
      if (billingFailOpen()) {
        console.warn("[billing] credit check failed — fail-open", error);
        return { hasPaidPlan: true, creditAllowed: true };
      }
      console.error("[billing] credit check failed — fail-closed", error);
      return { hasPaidPlan: true, creditAllowed: false };
    }
  } catch (error) {
    if (billingFailOpen()) {
      console.warn("[billing] customer fetch failed — fail-open", error);
      return { hasPaidPlan: true, creditAllowed: true };
    }
    console.error("[billing] customer fetch failed — fail-closed", error);
    return denyAll();
  }
}
