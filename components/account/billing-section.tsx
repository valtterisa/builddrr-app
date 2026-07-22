"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useCustomer } from "autumn-js/react";
import { toast } from "sonner";
import {
  GENERATION_FEATURE,
  PRO_MONTHLY_PLAN_ID,
  PRO_YEARLY_PLAN_ID,
  formatCredits,
  isPaidPlanId,
} from "@/lib/billing/constants";
import { checkoutSuccessUrl, redirectToCheckout } from "@/lib/billing/checkout";
import { Button } from "@/components/ui/button";
import { AccountSection } from "@/components/account/account-section";
import { TopUpModal } from "@/components/billing/top-up-modal";

export function BillingSection() {
  const { isAuthenticated } = useConvexAuth();
  const { data, check, attach, openCustomerPortal, refetch } = useCustomer({
    errorOnNotFound: false,
    queryOptions: { enabled: isAuthenticated },
  });
  const [pending, setPending] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  let planName = "No plan";
  let planId: string | null = null;
  let remaining: number | null = null;
  let granted: number | null = null;

  if (data) {
    const paid = data.subscriptions.find(
      (s) => s.status === "active" && isPaidPlanId(s.planId) && !s.autoEnable
    );
    const active = data.subscriptions.find((s) => s.status === "active");
    planId = paid?.planId ?? active?.planId ?? null;
    planName =
      paid?.plan?.name ??
      paid?.planId ??
      active?.plan?.name ??
      active?.planId ??
      "No plan";

    try {
      const result = check({
        featureId: GENERATION_FEATURE,
        requiredBalance: 1,
      });
      remaining = result.balance?.remaining ?? null;
      granted = result.balance?.granted ?? null;
    } catch {
      const balance = data.balances[GENERATION_FEATURE];
      remaining = balance?.remaining ?? null;
      granted = balance?.granted ?? null;
    }
  }

  const isPro = isPaidPlanId(planId);

  const onUpgrade = async (targetPlanId: string) => {
    setPending(true);
    try {
      const result = await attach({
        planId: targetPlanId,
        redirectMode: "always",
        successUrl: checkoutSuccessUrl("/dashboard/account"),
      });
      if (await redirectToCheckout(result)) return;
      await refetch();
      toast.success("Plan updated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not open checkout.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  const onManage = async () => {
    try {
      await openCustomerPortal({
        returnUrl: `${window.location.origin}/dashboard/account`,
      });
    } catch {
      toast.error("Could not open billing portal.");
    }
  };

  return (
    <AccountSection
      title="Billing"
      description="Plan, usage, and payment settings for creating sites."
    >
      {!isAuthenticated ? (
        <p className="text-sm text-muted-foreground">
          Sign in to view billing.
        </p>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">
          Loading billing… If this stays empty, Autumn may not be configured.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Current plan
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {planName}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Credits left
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {!isPro
                  ? "—"
                  : remaining === null
                    ? "—"
                    : formatCredits(remaining)}
              </p>
              {isPro && granted != null ? (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  of {formatCredits(granted)} included
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isPro ? (
              <>
                <Button
                  disabled={pending}
                  onClick={() => void onUpgrade(PRO_MONTHLY_PLAN_ID)}
                  className="rounded-none bg-brand text-brand-foreground hover:brightness-110"
                >
                  {pending ? "Opening…" : "Get Pro monthly"}
                </Button>
                <Button
                  disabled={pending}
                  onClick={() => void onUpgrade(PRO_YEARLY_PLAN_ID)}
                  variant="outline"
                  className="rounded-none"
                >
                  Get Pro yearly
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="rounded-none"
                onClick={() => setTopUpOpen(true)}
              >
                Top up credits
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => void onManage()}
            >
              Manage billing
            </Button>
            <Button asChild variant="ghost" className="rounded-none">
              <Link href="/#pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      )}
      <TopUpModal
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        onPurchased={() => void refetch()}
      />
    </AccountSection>
  );
}
