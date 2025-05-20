"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Loader2, Zap, AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PLANS } from "@/lib/stripe";

export default function UpgradePlanPage() {
  const { toast } = useToast();
  const { plan: currentPlan, error: subscriptionError, isLoading: subscriptionLoading } = useSubscription();
  const [billingInterval, setBillingInterval] = useState<"yearly" | "monthly">("yearly");
  const [loading, setLoading] = useState<string | null>(null);

  // Calculate savings percentage for yearly billing
  const monthlyCost = PLANS.PRO.monthly.price;
  const yearlyCost = PLANS.PRO.yearly.price / 12;
  const savingsPercentage = Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);

  const handleSelectPlan = async (plan: string, interval: "yearly" | "monthly") => {
    if (plan === currentPlan) return;

    setLoading(plan);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          interval,
          returnUrl: `${window.location.origin}/dashboard/plan`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container max-w-6xl py-10 space-y-8">
      <div>
        <Link
          href="/dashboard/plan"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to plan overview
        </Link>
        <h1 className="text-3xl font-bold mb-2">Upgrade Your Plan</h1>
        <p className="text-muted-foreground">Choose the plan that best fits your needs</p>
      </div>

      {subscriptionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{subscriptionError.message}</AlertDescription>
        </Alert>
      )}

      {/* Billing interval toggle */}
      <div className="flex justify-center">
        <div className="bg-muted/50 p-1.5 rounded-full flex items-center">
          <button
            onClick={() => setBillingInterval("yearly")}
            className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out ${
              billingInterval === "yearly"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
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
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out ${
              billingInterval === "monthly"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Loading state */}
      {subscriptionLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Pricing cards */}
      {!subscriptionLoading && (
        <div className="grid gap-8 md:grid-cols-3 mt-8">
          {/* Starter Plan */}
          <Card
            className={`flex flex-col border-2 transition-all duration-200 ${
              currentPlan === "starter"
                ? "border-primary"
                : "hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1 hover:shadow-lg"
            }`}
          >
            <CardHeader className="pb-8 pt-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="text-muted-foreground">Basic features for individuals and small businesses</p>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">Free</span>
                <span className="text-muted-foreground text-lg"> forever</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>One-page website</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>AI content generation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Basic templates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-gray-300 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Custom domain</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-gray-300 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Contact forms</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-6 pb-8">
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
            className={`flex flex-col border-2 relative ${
              currentPlan === "pro"
                ? "border-primary"
                : "border-primary transform scale-105 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 z-10"
            }`}
          >
            {currentPlan !== "pro" && (
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <Badge className="bg-primary hover:bg-primary text-sm px-3 py-1 font-medium">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="pb-8 pt-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-muted-foreground">Advanced features for growing businesses</p>
              </div>
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
            <CardContent className="flex-1 px-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Everything in Starter</span>
                </li>
                {PLANS.PRO.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="px-6 pb-8">
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

          {/* Enterprise Plan */}
          <Card
            className={`flex flex-col border-2 transition-all duration-200 ${
              currentPlan === "enterprise"
                ? "border-primary"
                : "hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1 hover:shadow-lg"
            }`}
          >
            <CardHeader className="pb-8 pt-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Enterprise</h3>
                <p className="text-muted-foreground">Custom solution for larger organizations</p>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">Custom</span>
                <span className="text-muted-foreground text-lg"> pricing</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-6 pb-8">
              <Button
                asChild={currentPlan !== "enterprise"}
                size="lg"
                variant="outline"
                className="w-full text-base py-6"
                disabled={currentPlan === "enterprise"}
              >
                {currentPlan === "enterprise" ? "Current Plan" : <Link href="/contact">Contact Sales</Link>}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* FAQ Section */}
      <div className="mt-16 border-t pt-10">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">Can I change plans later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade, downgrade, or cancel your subscription at any time from your
              account dashboard.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">How does billing work?</h3>
            <p className="text-muted-foreground">
              You'll be charged immediately upon upgrading, and then on the same date each
              month or year depending on your billing cycle.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, including Visa, Mastercard, and American Express.
              We also support payment via PayPal.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What happens if I cancel?</h3>
            <p className="text-muted-foreground">
              If you cancel, your subscription will remain active until the end of your current
              billing period. After that, you'll be downgraded to the Starter plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
