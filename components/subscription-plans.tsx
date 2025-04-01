"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PLANS } from "@/lib/stripe"
import { cn } from "@/lib/utils"

interface SubscriptionPlansProps {
  currentPlan: "starter" | "pro" | "enterprise"
  userId: string
}

export function SubscriptionPlans({ currentPlan, userId }: SubscriptionPlansProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [billingInterval, setBillingInterval] = useState<"yearly" | "monthly">("yearly")

  const handleSelectPlan = async (plan: string, interval: "yearly" | "monthly") => {
    if (plan === currentPlan) return

    setLoading(plan)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          interval,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  // Calculate savings percentage for yearly billing
  const monthlyCost = PLANS.PRO.monthly.price
  const yearlyCost = PLANS.PRO.yearly.price / 12
  const savingsPercentage = Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100)

  return (
    <div className="space-y-12">
      {/* Enhanced billing interval toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full flex items-center">
          <button
            onClick={() => setBillingInterval("yearly")}
            className={cn(
              "relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out",
              billingInterval === "yearly"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
            )}
          >
            Yearly
            {billingInterval === "yearly" && (
              <Badge className="absolute -top-2 -right-2 bg-green-500 hover:bg-green-500 text-[10px] px-1.5 py-0.5 flex items-center">
                <Zap className="h-3 w-3 mr-0.5" />
                Save {savingsPercentage}%
              </Badge>
            )}
          </button>
          <button
            onClick={() => setBillingInterval("monthly")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out",
              billingInterval === "monthly"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
            )}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {/* Starter Plan */}
        <Card
          className={cn(
            "flex flex-col border-2 transition-all duration-200",
            currentPlan === "starter"
              ? "border-primary"
              : "hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1 hover:shadow-lg",
          )}
        >
          <CardHeader className="pb-8 pt-8">
            <CardTitle className="text-2xl">Starter</CardTitle>
            <CardDescription className="text-base mt-2">
              Basic features for individuals and small businesses
            </CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">Free</span>
              <span className="text-muted-foreground text-lg"> forever</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-8">
            <ul className="space-y-4">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                <span>One-page website</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                <span>AI content generation</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Basic templates</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Custom domain</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Contact forms</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="px-8 pb-8">
            <Button
              size="lg"
              variant={currentPlan === "starter" ? "outline" : "outline"}
              className="w-full text-base py-6"
              disabled={currentPlan === "starter"}
            >
              {currentPlan === "starter" ? "Current Plan" : "Downgrade to Starter"}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card
          className={cn(
            "flex flex-col border-2 relative",
            currentPlan === "pro"
              ? "border-primary"
              : "border-primary transform scale-105 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 z-10",
          )}
        >
          {currentPlan !== "pro" && (
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <Badge className="bg-primary hover:bg-primary text-sm px-3 py-1 font-medium">Most Popular</Badge>
            </div>
          )}
          <CardHeader className="pb-8 pt-8">
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription className="text-base mt-2">Advanced features for growing businesses</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                ${billingInterval === "yearly" ? PLANS.PRO.yearly.price : PLANS.PRO.monthly.price}
              </span>
              <span className="text-muted-foreground text-lg">{billingInterval === "yearly" ? "/year" : "/month"}</span>
              {billingInterval === "yearly" && (
                <div className="text-sm text-muted-foreground mt-2">
                  Just ${(PLANS.PRO.yearly.price / 12).toFixed(2)}/month, billed annually
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-8">
            <ul className="space-y-4">
              {PLANS.PRO.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="px-8 pb-8">
            <Button
              size="lg"
              variant={currentPlan === "pro" ? "outline" : "default"}
              className="w-full text-base py-6"
              disabled={currentPlan === "pro" || loading === "pro"}
              onClick={() => handleSelectPlan("pro", billingInterval)}
            >
              {loading === "pro" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === "pro" ? (
                "Current Plan"
              ) : (
                `Upgrade to Pro`
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan - Contact Sales */}
        <Card
          className={cn(
            "flex flex-col border-2 transition-all duration-200",
            currentPlan === "enterprise"
              ? "border-primary"
              : "hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1 hover:shadow-lg",
          )}
        >
          <CardHeader className="pb-8 pt-8">
            <CardTitle className="text-2xl">Enterprise</CardTitle>
            <CardDescription className="text-base mt-2">Custom solution for larger organizations</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">Custom</span>
              <span className="text-muted-foreground text-lg"> pricing</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-8">
            <ul className="space-y-4">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Custom integrations</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Advanced analytics</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="px-8 pb-8">
            <Button
              asChild={!currentPlan.includes("enterprise")}
              size="lg"
              variant="outline"
              className="w-full text-base py-6"
              disabled={currentPlan === "enterprise"}
            >
              {currentPlan === "enterprise" ? "Current Plan" : <a href="/contact">Contact Sales</a>}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

