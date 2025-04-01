"use client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface PricingToggleProps {
  billingPeriod: "monthly" | "yearly"
  onChange: (period: "monthly" | "yearly") => void
  className?: string
}

export function PricingToggle({ billingPeriod, onChange, className }: PricingToggleProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Label htmlFor="billing-period" className="text-sm font-medium">
        Billing Period
      </Label>
      <Switch
        id="billing-period"
        checked={billingPeriod === "yearly"}
        onCheckedChange={(checked) => onChange(checked ? "yearly" : "monthly")}
      />
      <span className="text-sm text-muted-foreground">{billingPeriod === "monthly" ? "Monthly" : "Yearly"}</span>
    </div>
  )
}

