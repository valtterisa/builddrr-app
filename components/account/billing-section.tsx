"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { useCustomer } from "autumn-js/react";
import { toast } from "sonner";
import { GENERATION_FEATURE } from "@/lib/billing/constants";
import { Button } from "@/components/ui/button";
import { AccountSection } from "@/components/account/account-section";

export function BillingSection() {
  const { isAuthenticated } = useConvexAuth();
  const { data, check, attach, openCustomerPortal } = useCustomer({
    errorOnNotFound: false,
    queryOptions: { enabled: isAuthenticated },
  });

  let planName = "Free";
  let remaining: number | null = null;
  let granted: number | null = null;

  if (data) {
    const paid = data.subscriptions.find(
      (s) => s.status === "active" && s.planId !== "free" && !s.autoEnable
    );
    const active = data.subscriptions.find((s) => s.status === "active");
    planName =
      paid?.plan?.name ??
      paid?.planId ??
      active?.plan?.name ??
      active?.planId ??
      "Free";

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

  const isPro = planName.toLowerCase().includes("pro");

  const onUpgrade = async () => {
    try {
      await attach({ planId: "pro" });
    } catch {
      toast.error("Could not open checkout. Make sure billing is configured.");
    }
  };

  const onManage = async () => {
    try {
      await openCustomerPortal({
        returnUrl: `${window.location.origin}/account`,
      });
    } catch {
      toast.error("Could not open billing portal.");
    }
  };

  return (
    <AccountSection
      title="Billing"
      description="Plan, usage, and payment settings for site generations."
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
                Generations left
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {remaining === null
                  ? "—"
                  : granted !== null
                    ? `${remaining} / ${granted}`
                    : String(remaining)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isPro ? (
              <Button
                onClick={() => void onUpgrade()}
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Upgrade to Pro
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => void onManage()}>
              Manage billing
            </Button>
            <Button asChild variant="ghost">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      )}
    </AccountSection>
  );
}
