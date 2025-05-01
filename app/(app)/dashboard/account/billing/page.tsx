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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// Mock billing history data - TODO: Fetch actual billing history from backend/Stripe
const billingHistory = [
  {
    id: "inv_1",
    date: "2025-04-01",
    amount: "$19.00",
    status: "Paid",
    plan: "Pro Monthly",
  },
  {
    id: "inv_2",
    date: "2025-03-01",
    amount: "$19.00",
    status: "Paid",
    plan: "Pro Monthly",
  },
  {
    id: "inv_3",
    date: "2025-02-01",
    amount: "$19.00",
    status: "Paid",
    plan: "Pro Monthly",
  },
];

// Define a type for the subscription state for clarity
interface SubscriptionState {
  plan: string | null;
  status: string | null;
  periodEnd: Date | null; // Explicitly allow Date or null
  isActive: boolean;
  isLoading: boolean;
}

export default function BillingPage() {
  // Use the defined type for the mock state
  const { plan, status, periodEnd, isActive, isLoading }: SubscriptionState = {
    plan: "starter", // Example: Fetch actual plan
    status: "active", // Example: Fetch actual status
    periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Example: Fetch actual end date
    isActive: true, // Example: Determine based on status
    isLoading: false,
  };
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    // TODO: Add logic to call your backend API endpoint for subscription cancellation.
    // This endpoint should interact with Stripe and update the user's profile in Supabase.
    // Example: await fetch('/api/stripe/cancel-subscription', { method: 'POST' });
    console.log("Initiating subscription cancellation...");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsCanceling(false);
    // On success/error, update UI or show toast (consider refetching subscription status)
  };

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and view billing history.
        </p>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Manage your subscription and view billing details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading subscription details...</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold capitalize">
                    {plan ?? "Starter"} Plan
                  </h3>
                  {/* Ensure periodEnd is checked before accessing its methods */}
                  {isActive && periodEnd && (
                    <p className="text-sm text-muted-foreground">
                      Renews on {periodEnd.toLocaleDateString()}
                    </p>
                  )}
                  {status && (
                    <Badge
                      variant={
                        status === "active" || status === "trialing"
                          ? "default"
                          : "secondary"
                      }
                      className="capitalize mt-1"
                    >
                      {status}
                    </Badge>
                  )}
                </div>
                <div className="mt-4 sm:mt-0">
                  {plan !== "enterprise" && (
                    <Button asChild variant="outline">
                      <Link href="/dashboard/upgrade">
                        {isActive ? "Change Plan" : "Upgrade Plan"}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          {isActive && plan !== "starter" && (
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isCanceling || isLoading}
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Canceling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View your past invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.length > 0 ? (
                  billingHistory.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.id}
                      </TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.plan}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "Paid" ? "default" : "secondary"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          View
                        </Button>{" "}
                        {/* Add link/action to view invoice */}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No billing history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
