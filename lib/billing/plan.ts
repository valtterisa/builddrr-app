import { isPaidPlanId } from "@/lib/billing/constants";

type SubscriptionLike = {
  status?: string | null;
  planId?: string | null;
  autoEnable?: boolean | null;
};

type CustomerLike = {
  subscriptions?: SubscriptionLike[] | null;
} | null | undefined;

export function hasActivePaidPlan(customer: CustomerLike): boolean {
  if (!customer?.subscriptions?.length) return false;
  return customer.subscriptions.some(
    (s) => s.status === "active" && isPaidPlanId(s.planId) && !s.autoEnable
  );
}

export type GenerationDenyReason = "no_plan" | "no_credits";
