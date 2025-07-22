import { Polar } from "@polar-sh/sdk";

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

  const subscriptionId = customer?.activeSubscriptions?.[0]?.id;

  if (!subscriptionId) return null;

  const subscription = await polar.subscriptions.get({
    id: subscriptionId,
  });

  return { subscription };
}

export async function getPolarProducts() {
  const products = await polar.products.list({
    organizationId:
      process.env.NODE_ENV === "production"
        ? process.env.POLAR_ORG_ID!
        : process.env.POLAR_SANDBOX_ORG_ID!,
    isArchived: false,
  });

  for await (const page of products) {
    return page.result.items;
  }
}

export async function managePolarSubscription(externalId: string) {
  const customer = await polar.customerSessions.create({
    externalCustomerId: externalId,
  });

  return customer.customerPortalUrl;
}
