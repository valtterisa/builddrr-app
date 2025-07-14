"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getAllProductCheckOutUrls } from "@/lib/polar";

const plans = getAllProductCheckOutUrls();

console.log("plans", plans);

interface BillingClientProps {
  subscription: any | null;
  customer: any | null;
}

const BillingClient: React.FC<BillingClientProps> = ({
  subscription,
  customer,
}) => {
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  const currentPlanId = subscription?.product_id;

  return (
    <div className="px-4 md:px-6">
      <SiteHeader title="Billing" />
      <div className="space-y-6 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Manage your subscription and view billing details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold capitalize">
                    {subscription.product?.name || "Unknown"} Plan
                  </h3>
                  {subscription.renews_at && (
                    <p className="text-sm text-muted-foreground">
                      Renews on{" "}
                      {new Date(subscription.renews_at).toLocaleDateString()}
                    </p>
                  )}
                  {subscription.status && (
                    <Badge
                      variant={
                        subscription.status === "active" ||
                        subscription.status === "trialing"
                          ? "default"
                          : "secondary"
                      }
                      className="capitalize mt-1"
                    >
                      {subscription.status}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div>No active subscription found.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Upgrade or change your plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={
                    plan.id === currentPlanId ? "border-primary border-2" : ""
                  }
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {plan.prices && plan.prices[0]
                        ? `${(plan.prices[0].price_amount / 100).toFixed(2)} ${plan.prices[0].price_currency}`
                        : "Free"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plan.recurring_interval
                        ? `Billed ${plan.recurring_interval}`
                        : ""}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {plan.id === currentPlanId ? (
                      <Badge variant="default">Current Plan</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        disabled={!!isUpgrading}
                        onClick={() => {
                          window.location.href = plan.url;
                        }}
                      >
                        {isUpgrading === plan.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Upgrade
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingClient;
