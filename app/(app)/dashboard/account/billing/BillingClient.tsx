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
import { managePolarSubscription } from "@/lib/polar";

interface BillingClientProps {
  subscription: any | null;
  products: any | null;
  customerPortalUrl: string | null;
}

const BillingClient: React.FC<BillingClientProps> = ({
  subscription,
  products,
  customerPortalUrl,
}) => {
  return (
    <div className="px-4 md:px-6">
      <SiteHeader title="Billing" />
      <div className="space-y-6 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Upgrade or change your plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <Card
                  key={product.id}
                  className={
                    product.id === subscription?.product?.id
                      ? "border-primary border-2"
                      : ""
                  }
                >
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    {product.description && (
                      <CardDescription>{product.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {product.prices &&
                        product.prices[0] &&
                        product.prices[0].priceAmount
                        ? `${product.prices[0].priceAmount / 100} ${product.prices[0].priceCurrency.toUpperCase()}`
                        : "Free"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {product.recurringInterval
                        ? `Billed ${product.recurringInterval}ly`
                        : ""}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (customerPortalUrl) {
                          window.location.href = customerPortalUrl;
                        }
                      }}
                    >
                      {product.id === subscription?.product?.id
                        ? "Manage"
                        : "Upgrade"}
                    </Button>
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
