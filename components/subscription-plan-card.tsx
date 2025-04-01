"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"

interface PlanFeature {
  name: string
  included: boolean
}

interface SubscriptionPlanCardProps {
  name: string
  description: string
  price: number | "Free"
  interval?: "yearly" | "monthly"
  features: string[] | PlanFeature[]
  isCurrentPlan: boolean
  isPopular?: boolean
  isLoading?: boolean
  disabled?: boolean
  onSelectPlan: () => void
}

export function SubscriptionPlanCard({
  name,
  description,
  price,
  interval,
  features,
  isCurrentPlan,
  isPopular = false,
  isLoading = false,
  disabled = false,
  onSelectPlan,
}: SubscriptionPlanCardProps) {
  // Normalize features to PlanFeature[] type
  const normalizedFeatures: PlanFeature[] = features.map((feature) =>
    typeof feature === "string" ? { name: feature, included: true } : feature,
  )

  return (
    <Card className={`flex flex-col ${isPopular ? "border-primary shadow-lg relative" : ""}`}>
      {isPopular && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Popular
          </span>
        </div>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price === "Free" ? "Free" : `$${price}`}</span>
          {price !== "Free" && (
            <span className="text-muted-foreground">{interval === "yearly" ? "/year" : "/month"}</span>
          )}
          {interval === "yearly" && price !== "Free" && (
            <div className="text-sm text-muted-foreground mt-1">
              Just ${(Number(price) / 12).toFixed(2)}/month, billed annually
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {normalizedFeatures.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className={`h-4 w-4 mr-2 ${feature.included ? "text-green-500" : "text-gray-300"}`} />
              <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan || isLoading || disabled}
          onClick={onSelectPlan}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : (
            `Upgrade to ${name}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

