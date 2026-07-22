"use client";

import { Check } from "lucide-react";
import { useCustomer } from "autumn-js/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanCard {
  id: string;
  name: string;
  price: string;
  cadence?: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: PlanCard[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: ["5 site generations / month", "Live sandbox preview", "Astro + Tailwind output"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$20",
    cadence: "/mo",
    highlight: true,
    features: [
      "200 site generations / month",
      "Blog content collections",
      "Priority sandbox capacity",
      "Everything in Free",
    ],
  },
];

export function PricingTableClient() {
  const { attach } = useCustomer();

  const onSelect = async (planId: string) => {
    try {
      await attach({ planId });
    } catch {
      toast.error("Could not open checkout. Make sure billing is configured.");
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "flex flex-col rounded-3xl border p-8",
            plan.highlight
              ? "border-brand/50 bg-brand/5"
              : "border-border/60 bg-card/40"
          )}
        >
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
            {plan.cadence && (
              <span className="text-muted-foreground">{plan.cadence}</span>
            )}
          </div>
          <ul className="mt-6 flex flex-col gap-3 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <Button
            onClick={() => onSelect(plan.id)}
            className={cn(
              "mt-8 active:scale-[0.98]",
              plan.highlight
                ? "bg-brand text-brand-foreground hover:bg-brand/90"
                : ""
            )}
            variant={plan.highlight ? "default" : "outline"}
          >
            {plan.id === "free" ? "Start building" : "Upgrade to Pro"}
          </Button>
        </div>
      ))}
    </div>
  );
}
