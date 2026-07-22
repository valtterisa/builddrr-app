"use client";

import { useState } from "react";
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
  GENERATION_FEATURE,
  TOP_UP_PACKS,
  TOP_UP_PLAN_ID,
  type TopUpPack,
} from "@/lib/billing/constants";

export type TopUpModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased?: () => void;
};

export function TopUpModal({ open, onOpenChange, onPurchased }: TopUpModalProps) {
  const { attach, data, refetch } = useCustomer();
  const [selected, setSelected] = useState<TopUpPack>(TOP_UP_PACKS[1]!);
  const [pending, setPending] = useState(false);

  const balance = data?.balances?.[GENERATION_FEATURE]?.remaining ?? null;

  const purchase = async () => {
    setPending(true);
    try {
      const result = await attach({
        planId: TOP_UP_PLAN_ID,
        featureQuantities: [
          {
            featureId: GENERATION_FEATURE,
            quantity: selected.generations,
          },
        ],
        redirectMode: "if_required",
      });

      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      await refetch();
      onPurchased?.();
      onOpenChange(false);
      toast.success(`Added ${selected.generations} generations.`);
    } catch {
      toast.error("Could not start top-up. Make sure billing is configured.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top up generations</DialogTitle>
          <DialogDescription>
            Buy extra site generations that never expire. They stack on top of
            your monthly plan allowance.
            {typeof balance === "number" ? (
              <>
                {" "}
                You have <span className="text-foreground">{balance}</span> left.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          {TOP_UP_PACKS.map((pack) => {
            const active = pack.id === selected.id;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => setSelected(pack)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-brand bg-brand/10"
                    : "border-border/60 hover:border-border hover:bg-muted/40"
                )}
              >
                <div>
                  <p className="text-sm font-medium">
                    {pack.generations} generations
                  </p>
                  {pack.hint ? (
                    <p className="text-xs text-muted-foreground">{pack.hint}</p>
                  ) : null}
                </div>
                <span className="text-sm font-semibold">{pack.priceLabel}</span>
              </button>
            );
          })}
        </div>

        <Button
          onClick={purchase}
          disabled={pending}
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90 active:scale-[0.98]"
        >
          {pending
            ? "Opening checkout…"
            : `Buy ${selected.generations} for ${selected.priceLabel}`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
