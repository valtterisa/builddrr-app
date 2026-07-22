import { v } from "convex/values";
import { action } from "./_generated/server";
import { autumn } from "./autumn";

const PAID_PLAN_IDS = new Set(["pro", "pro_yearly"]);
const AI_CREDITS_FEATURE = "ai_credits";
const MIN_CREDIT_BALANCE = 0.05;

export const getAccess = action({
  args: {},
  returns: v.object({
    hasPaidPlan: v.boolean(),
    creditAllowed: v.boolean(),
  }),
  handler: async (ctx) => {
    const customerResult = await autumn.customers.get(ctx);
    const customer = customerResult.data;
    const hasPaidPlan = Boolean(
      customer?.subscriptions?.some(
        (s) =>
          s.status === "active" &&
          PAID_PLAN_IDS.has(s.planId) &&
          !s.autoEnable
      )
    );

    if (!hasPaidPlan) {
      return { hasPaidPlan: false, creditAllowed: false };
    }

    try {
      const check = await autumn.check(ctx, {
        featureId: AI_CREDITS_FEATURE,
        requiredBalance: MIN_CREDIT_BALANCE,
      });
      return {
        hasPaidPlan: true,
        creditAllowed: check.data?.allowed !== false,
      };
    } catch {
      return { hasPaidPlan: true, creditAllowed: true };
    }
  },
});
