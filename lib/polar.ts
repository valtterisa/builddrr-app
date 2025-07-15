import { Polar } from "@polar-sh/sdk";
import { redirect } from "next/navigation";

export const polar = new Polar({
  accessToken:
    process.env.NODE_ENV === "production"
      ? process.env.POLAR_ACCESS_TOKEN!
      : process.env.POLAR_SANDBOX_ACCESS_TOKEN!,
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

// Fetch the current user's subscription by externalId (e.g., Supabase user id or email)
export async function getPolarSubscriptionByExternalId(externalId: string) {
  const customer = await polar.customers.getStateExternal({
    externalId: externalId,
  });
  if (!customer || !customer.id) return null;

  const subscription = customer.activeSubscriptions?.[0] || null;

  return { customer, subscription };
}

export async function getAllProductCheckOutUrls() {
  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Basic access with limited features.",
      prices: [],
      checkOutUrl: process.env.POLAR_FREE_PLAN_LINK!,
      checkOutUrlSandbox: process.env.POLAR_SANDBOX_FREE_PLAN_LINK!,
    },
    {
      id: "pro",
      name: "Pro",
      description: "Full access to all features.",
      prices: [{ price_amount: 1500, price_currency: "EUR" }],
      recurring_interval: "monthly",
      checkOutUrl: process.env.NEXT_PUBLIC_POLAR_PRO_PLAN_LINK!,
      checkOutUrlSandbox: process.env.NEXT_PUBLIC_POLAR_SANDBOX_PRO_PLAN_LINK!,
    },
  ];

  return plans.map((plan) => ({
    ...plan,
    url:
      process.env.NODE_ENV === "development"
        ? plan.checkOutUrlSandbox
        : plan.checkOutUrl,
  }));
}
