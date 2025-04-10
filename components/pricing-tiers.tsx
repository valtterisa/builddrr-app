"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function PricingTiers() {
  const [billingInterval, setBillingInterval] = useState<"yearly" | "monthly">(
    "yearly"
  );

  // Pro plan pricing
  const proMonthlyPrice = 5;
  const proYearlyPrice = 29;

  // Calculate savings percentage for yearly billing
  const savingsPercentage = Math.round(
    ((proMonthlyPrice - proYearlyPrice / 12) / proMonthlyPrice) * 100
  );

  return (
    <section className="py-8 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Choose the perfect plan for your needs. No hidden fees, no
            surprises.
          </p>

          {/* Enhanced billing interval toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full flex items-center">
              <button
                onClick={() => setBillingInterval("yearly")}
                className={cn(
                  "relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out",
                  billingInterval === "yearly"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <Card className="flex flex-col border-2 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="pb-8 pt-8">
              <CardTitle className="text-2xl">Starter</CardTitle>
              <CardDescription className="text-base mt-2">
                Perfect for individuals and small projects
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
                asChild
                size="lg"
                variant="outline"
                className="w-full text-base py-6"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="flex flex-col border-2 border-primary relative transform scale-105 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 z-10">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <Badge className="bg-primary hover:bg-primary text-sm px-3 py-1 font-medium">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="pb-8 pt-8">
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription className="text-base mt-2">
                Advanced features for growing businesses
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  $
                  {billingInterval === "yearly"
                    ? proYearlyPrice
                    : proMonthlyPrice}
                </span>
                <span className="text-muted-foreground text-lg">
                  {billingInterval === "yearly" ? "/year" : "/month"}
                </span>
                {billingInterval === "yearly" && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Just ${(proYearlyPrice / 12).toFixed(2)}/month, billed
                    annually
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-8">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Custom domains</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Contact forms</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Testimonials section</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Basic analytics</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-8 pb-8">
              <Button asChild size="lg" className="w-full text-base py-6">
                <Link href="/signup?plan=pro">Upgrade to Pro</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan - Contact Sales */}
          <Card className="flex flex-col border-2 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="pb-8 pt-8">
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <CardDescription className="text-base mt-2">
                Custom solution for larger organizations
              </CardDescription>
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
                asChild
                size="lg"
                variant="outline"
                className="w-full text-base py-6"
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Have questions about our pricing?{" "}
            <Link
              href="/contact"
              className="text-primary font-medium hover:underline"
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
