import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  // server: "sandbox",
});

// integrate to pricing options -> get priduct ids straight
// Need to sync with supabase per customer using external id.
// We can query with the externalId and polar.sh tracks the usage.
// No need for us to track the usage.
// Finally: just test it.

// Fetch all available products (plans)
export async function getPolarProducts() {
  // You may want to filter by organization or other params if needed
  const result = await polar.products.list({});
  // The SDK returns an async iterable for paginated results
  const products: any[] = [];
  for await (const page of result) {
    products.push(...(page.items || page));
  }
  return products;
}

// Fetch the current user's subscription by externalId (e.g., Supabase user id or email)
export async function getPolarSubscriptionByExternalId(externalId: string) {
  // This assumes you use externalId to sync users between your app and Polar
  // You may need to adjust this if you use a different identifier
  const customer = await polar.customers.getExternal({ externalId });
  if (!customer || !customer.id) return null;
  // List subscriptions for this customer
  const result = await polar.subscriptions.list({ customerId: customer.id });
  const subscriptions: any[] = [];
  for await (const page of result) {
    subscriptions.push(...(page.items || page));
  }
  // Return the most recent/active subscription
  return (
    subscriptions.find((sub) => sub.status === "active") ||
    subscriptions[0] ||
    null
  );
}
