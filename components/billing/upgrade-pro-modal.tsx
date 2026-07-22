"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useCustomer } from "autumn-js/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const priceLabel = interval === "month" ? "$20/mo" : "$192/yr";

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
      <DialogContent className="gap-6 rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get Pro to build</DialogTitle>
          <DialogDescription>
            Floras needs an active Pro plan before you can prompt the AI. $20 of
            AI credit every month, live previews, and chat refinements.
          </DialogDescription>
        </DialogHeader>

        <div
          role="group"
          aria-label="Billing period"
          className="inline-flex w-full border border-border"
        >
          <button
            type="button"
            aria-pressed={interval === "month"}
            onClick={() => setInterval("month")}
            className={cn(
              "flex-1 cursor-pointer px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
              interval === "month"
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
          >
            Monthly · $20
          </button>
          <button
            type="button"
            aria-pressed={interval === "year"}
            onClick={() => setInterval("year")}
            className={cn(
              "flex-1 cursor-pointer border-l border-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
              interval === "year"
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
          >
            Yearly · $192
          </button>
        </div>

        <ul className="border-y border-border text-sm text-muted-foreground">
          {[
            "AI usage included every month",
            "Full Astro sites from one sentence",
            "Live preview while you refine in chat",
            "Top up credits anytime",
          ].map((item) => (
            <li
              key={item}
              className="border-b border-border py-2.5 last:border-b-0"
            >
              {item}
            </li>
          ))}
        </ul>

        <Button
          onClick={() => void purchase()}
          disabled={pending || !isAuthenticated}
          className="w-full rounded-none bg-brand text-brand-foreground hover:brightness-110 active:scale-[0.98]"
        >
          {pending ? "Opening checkout…" : `Get Pro · ${priceLabel}`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
