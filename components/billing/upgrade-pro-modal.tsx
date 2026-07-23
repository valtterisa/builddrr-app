"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useCustomer } from "autumn-js/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  PRO_MONTHLY_PLAN_ID,
  PRO_YEARLY_PLAN_ID,
} from "@/lib/billing/constants";
import { checkoutSuccessUrl, redirectToCheckout } from "@/lib/billing/checkout";

export type UpgradeProModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased?: () => void;
};

const FEATURES = [
  "$13 of AI tokens every month",
  "Hosting included",
  "Top up credits to keep editing",
  "SEO-ready Astro that ranks",
  "Sites that slap — end to end",
];

export function UpgradeProModal({
  open,
  onOpenChange,
  onPurchased,
}: UpgradeProModalProps) {
  const { isAuthenticated } = useConvexAuth();
  const { attach, refetch } = useCustomer({
    errorOnNotFound: false,
    queryOptions: { enabled: isAuthenticated && open },
  });
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [pending, setPending] = useState(false);

  const planId =
    interval === "month" ? PRO_MONTHLY_PLAN_ID : PRO_YEARLY_PLAN_ID;
  const priceLabel = interval === "month" ? "$20" : "$192";
  const cadenceLabel = interval === "month" ? "/mo" : "/yr";

  const purchase = async () => {
    if (!isAuthenticated) {
      toast.error("Sign in to get Pro.");
      return;
    }
    setPending(true);
    try {
      const result = await attach({
        planId,
        redirectMode: "always",
        successUrl: checkoutSuccessUrl("/dashboard"),
      });
      if (await redirectToCheckout(result)) return;
      await refetch();
      onPurchased?.();
      onOpenChange(false);
      toast.success("Pro is active.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not open checkout."
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-none border-border p-0 sm:max-w-md">
        <div className="border-b border-border px-6 py-5 pr-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Required to continue
          </p>
          <DialogTitle className="mt-2 text-2xl font-semibold tracking-tight">
            Get Pro
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
            Unlock generation, live preview, and chat refinements.
          </DialogDescription>
        </div>

        <div
          role="group"
          aria-label="Billing period"
          className="grid grid-cols-2 border-b border-border"
        >
          <button
            type="button"
            aria-pressed={interval === "month"}
            onClick={() => setInterval("month")}
            className={cn(
              "cursor-pointer px-5 py-4 text-left transition-colors",
              interval === "month"
                ? "bg-brand-soft"
                : "hover:bg-background"
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Monthly
            </span>
            <span className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                $20
              </span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </span>
          </button>
          <button
            type="button"
            aria-pressed={interval === "year"}
            onClick={() => setInterval("year")}
            className={cn(
              "cursor-pointer border-l border-border px-5 py-4 text-left transition-colors",
              interval === "year" ? "bg-brand-soft" : "hover:bg-background"
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Yearly
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-brand">
                −20%
              </span>
            </span>
            <span className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                $192
              </span>
              <span className="text-sm text-muted-foreground">/yr</span>
            </span>
          </button>
        </div>

        <ul>
          {FEATURES.map((item) => (
            <li
              key={item}
              className="border-b border-border px-6 py-3 text-sm text-muted-foreground last:border-b-0"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="border-t border-border p-0">
          <button
            type="button"
            onClick={() => void purchase()}
            disabled={pending || !isAuthenticated}
            className={cn(
              "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-brand px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-foreground transition-[filter] active:scale-[0.99]",
              "hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
            )}
          >
            {pending
              ? "Opening checkout…"
              : `Get Pro · ${priceLabel}${cadenceLabel}`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
