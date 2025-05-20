"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Calendar, CheckCircle, CreditCard, ExternalLink, Loader2, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscription } from "@/hooks/use-subscription";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { plan, status, periodEnd, isActive, isLoading, error } = useSubscription();
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  const handleCancelSubscription = async () => {
    if (confirm("Are you sure you want to cancel your subscription? Your plan will remain active until the end of your current billing period.")) {
      setCancellingSubscription(true);
      try {
        const response = await fetch("/api/stripe/cancel-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to cancel subscription");
        }

        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled. You'll have access to Pro features until the end of your billing period.",
        });

        // Reload the page to reflect the new subscription status
        router.refresh();
      } catch (error) {
        console.error("Error cancelling subscription:", error);
        toast({
          title: "Error",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setCancellingSubscription(false);
      }
    }
  };

  const handleOpenBillingPortal = async () => {
    try {
      const response = await fetch("/api/stripe/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to access billing portal");
      }

      // Redirect to Stripe Billing Portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Error accessing billing portal:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Subscription Plan</h1>
        <p className="text-muted-foreground">Manage your subscription plan and billing</p>
      </div>

      {/* Display error message if there's an error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message}
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.refresh()}
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Your current plan</CardTitle>
                  <CardDescription>Details about your current subscription</CardDescription>
                </div>
                <Badge variant={plan === "starter" ? "outline" : "default"}>
                  {plan === "pro" ? "Pro Plan" : plan === "enterprise" ? "Enterprise Plan" : "Starter Plan"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">PLAN DETAILS</h3>
                  {plan === "starter" ? (
                    <div className="text-lg font-medium">Free Plan</div>
                  ) : (
                    <>
                      <div className="text-lg font-medium">
                        {plan === "pro" ? "Pro Plan" : "Enterprise Plan"}
                        {status === "active" && (
                          <span className="text-green-500 text-sm font-normal ml-2">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Active
                          </span>
                        )}
                        {status === "paused" && (
                          <span className="text-amber-500 text-sm font-normal ml-2">
                            Paused (access until period end)
                          </span>
                        )}
                      </div>
                      {periodEnd && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Current period ends:{" "}
                          <span className="font-medium ml-1">
                            {new Date(periodEnd).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">FEATURES</h3>
                  <ul className="space-y-2">
                    {plan === "starter" ? (
                      <>
                        <li className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          One-page website
                        </li>
                        <li className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          AI content generation
                        </li>
                        <li className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Basic templates
                        </li>
                      </>
                    ) : plan === "pro" ? (
                      <>
                        <li className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Custom domains
                        </li>
                        <li className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Contact forms
                        </li>
                        <li className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Basic analytics
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Everything in Pro
                        </li>
                        <li className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Custom integrations
                        </li>
                        <li className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Dedicated account manager
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 pt-2">
              {(() => {
                if (plan === "starter") {
                  return (
                    <Button asChild className="w-full sm:w-auto">
                      <Link href="/dashboard/plan/upgrade">Upgrade Now</Link>
                    </Button>
                  );
                }

                if (status === "paused") {
                  return (
                    <Button asChild className="w-full sm:w-auto">
                      <Link href="/dashboard/plan/upgrade">Renew Subscription</Link>
                    </Button>
                  );
                }

                return (
                  <>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={handleOpenBillingPortal}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Billing
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto"
                      onClick={handleCancelSubscription}
                      disabled={cancellingSubscription}
                    >
                      {cancellingSubscription ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Subscription"
                      )}
                    </Button>
                  </>
                );
              })()}
            </CardFooter>
          </Card>

          {/* Usage Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Usage Overview</CardTitle>
              <CardDescription>
                Monitor your resource usage and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Websites</span>
                    <span className="font-medium">2 / {plan === "starter" ? "1" : plan === "pro" ? "5" : "Unlimited"}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-primary rounded-full ${plan === "starter" ? "w-[200%]" : "w-[40%]"}`}
                      style={{
                        backgroundColor: plan === "starter" ? "#ef4444" : undefined
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Custom Domains</span>
                    <span className="font-medium">1 / {plan === "starter" ? "0" : plan === "pro" ? "3" : "Unlimited"}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-primary rounded-full ${plan === "starter" ? "w-[200%]" : "w-[33%]"}`}
                      style={{
                        backgroundColor: plan === "starter" ? "#ef4444" : undefined
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/analytics"
                  className="text-primary hover:underline text-sm flex items-center"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View detailed analytics
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Billing Information</CardTitle>
              <CardDescription>
                Manage your payment methods and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plan === "starter" ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    You are currently on the free Starter plan.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/plan/upgrade">Upgrade Now</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Payment Method */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">PAYMENT METHOD</h3>
                    <div className="flex items-center border rounded-md p-3">
                      <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">•••• •••• •••• 4242</div>
                        <div className="text-sm text-muted-foreground">Expires 12/2025</div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={handleOpenBillingPortal}>
                        <Settings className="h-4 w-4 mr-1" /> Update
                      </Button>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">BILLING HISTORY</h3>
                    <div className="border rounded-md overflow-hidden">
                      <div className="grid grid-cols-3 gap-4 p-3 bg-muted/40 text-sm font-medium">
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Status</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-3 text-sm border-t">
                        <div>May 1, 2025</div>
                        <div>$29.00</div>
                        <div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Paid
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-3 text-sm border-t">
                        <div>Apr 1, 2025</div>
                        <div>$29.00</div>
                        <div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Paid
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-sm"
                        onClick={handleOpenBillingPortal}
                      >
                        View all invoices
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">
                Need help with billing? <Link href="/contact" className="text-primary hover:underline">Contact support</Link>
              </div>
              {plan !== "starter" && (
                <Button variant="outline" onClick={handleOpenBillingPortal}>
                  Manage Billing
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

