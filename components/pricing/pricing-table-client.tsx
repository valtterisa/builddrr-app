"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useCustomer } from "autumn-js/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  FREE_PLAN_ID,
  PRO_MONTHLY_PLAN_ID,
  PRO_YEARLY_PLAN_ID,
  isPaidPlanId,
} from "@/lib/billing/constants";
import { checkoutSuccessUrl, redirectToCheckout } from "@/lib/billing/checkout";

type BillingInterval = "month" | "year";

type PlanCard = {
  id: string;
  name: string;
  price: string;
  cadence?: string;
  note?: string;
  features: string[];
  highlight?: boolean;
  cta: string;
};

const PLANS: Record<BillingInterval, PlanCard[]> = {
  month: [
    {
      id: FREE_PLAN_ID,
      name: "Free",
      price: "$0",
      features: [
        "$2 AI credits / month",
        "Pay only for tokens you use",
        "Live sandbox preview",
        "Astro + Tailwind output",
      ],
      cta: "Start building",
    },
    {
      id: PRO_MONTHLY_PLAN_ID,
      name: "Pro",
      price: "$20",
      cadence: "/mo",
      highlight: true,
      features: [
        "$20 AI credits / month",
        "Token usage metering",
        "Blog content collections",
        "Priority sandbox capacity",
      ],
      cta: "Upgrade to Pro",
    },
  ],
  year: [
    {
      id: FREE_PLAN_ID,
      name: "Free",
      price: "$0",
      features: [
        "$2 AI credits / month",
        "Pay only for tokens you use",
        "Live sandbox preview",
        "Astro + Tailwind output",
      ],
      cta: "Start building",
    },
    {
      id: PRO_YEARLY_PLAN_ID,
      name: "Pro",
      price: "$192",
      cadence: "/yr",
      note: "Save 20% vs monthly",
      highlight: true,
      features: [
        "$20 AI credits / month",
        "Token usage metering",
        "Blog content collections",
        "Priority sandbox capacity",
      ],
      cta: "Upgrade yearly",
    },
  ],
};

export function PricingTableClient() {
  const { isAuthenticated } = useConvexAuth();
  const { attach, data, refetch } = useCustomer({
    errorOnNotFound: false,
    queryOptions: { enabled: isAuthenticated },
  });
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  const activePaid = data?.subscriptions?.find(
    (s) => s.status === "active" && isPaidPlanId(s.planId) && !s.autoEnable
  );
  const currentPlanId = activePaid?.planId ?? FREE_PLAN_ID;
  const plans = PLANS[interval];

  const onSelect = async (planId: string) => {
    if (planId === FREE_PLAN_ID) {
      window.location.href = isAuthenticated ? "/dashboard" : "/sign-up";
      return;
    }

    if (!isAuthenticated) {
      toast.error("Sign in to upgrade your plan.");
      window.location.href = `/login?next=${encodeURIComponent("/#pricing")}`;
      return;
    }

    if (planId === currentPlanId) {
      toast.message("You are already on this plan.");
      return;
    }

    setPendingPlan(planId);
    try {
      const result = await attach({
        planId,
        redirectMode: "always",
        successUrl: checkoutSuccessUrl("/account"),
      });

      if (await redirectToCheckout(result)) return;

      await refetch();
      toast.success("Plan updated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not open checkout.";
      toast.error(message);
    } finally {
      setPendingPlan(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-3 border-b border-border px-6 py-5 md:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Billing period
        </p>
        <div
          role="group"
          aria-label="Billing period"
          className="inline-flex border border-border bg-background"
        >
          <button
            type="button"
            aria-pressed={interval === "month"}
            onClick={() => setInterval("month")}
            className={cn(
              "cursor-pointer px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
              interval === "month"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={interval === "year"}
            onClick={() => setInterval("year")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 border-l border-border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
              interval === "year"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
          >
            Yearly
            <span
              className={cn(
                "border px-1.5 py-0.5 text-[9px] tracking-[0.12em]",
                interval === "year"
                  ? "border-background/30 text-background"
                  : "border-brand/40 text-brand"
              )}
            >
              −20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2">
        {plans.map((plan, i) => {
          const isCurrent = plan.id === currentPlanId;
          const pending = pendingPlan === plan.id;
          return (
            <div
              key={`${interval}-${plan.id}`}
              className={cn(
                "flex flex-col border-border p-8",
                i === 0 ? "border-b sm:border-b-0 sm:border-r" : "",
                plan.highlight ? "bg-brand/[0.04]" : "bg-card/40"
              )}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                {plan.highlight ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand">
                    Popular
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                {plan.cadence ? (
                  <span className="text-sm text-muted-foreground">{plan.cadence}</span>
                ) : null}
              </div>
              {plan.note ? (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {plan.note}
                </p>
              ) : null}
              <ul className="mt-8 flex flex-col border-y border-border">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="border-b border-border py-3 text-sm text-muted-foreground last:border-b-0"
                  >
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={pending || (isCurrent && plan.id !== FREE_PLAN_ID)}
                onClick={() => void onSelect(plan.id)}
                className={cn(
                  "mt-8 inline-flex h-11 cursor-pointer items-center justify-center px-5 font-mono text-[11px] uppercase tracking-[0.14em] transition-[filter] active:scale-[0.98]",
                  plan.highlight
                    ? "bg-brand text-white hover:brightness-110"
                    : "border border-border bg-card text-foreground hover:bg-background",
                  "disabled:cursor-not-allowed disabled:opacity-40"
                )}
              >
                {pending
                  ? "Opening checkout…"
                  : isCurrent && plan.id !== FREE_PLAN_ID
                    ? "Current plan"
                    : plan.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
