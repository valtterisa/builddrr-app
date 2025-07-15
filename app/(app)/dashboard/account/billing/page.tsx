import {
  getPolarProducts,
  getPolarSubscriptionByExternalId,
  managePolarSubscription,
} from "@/lib/polar";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  // Get Supabase user on the server
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    // Optionally, redirect to login or show an error
    return <div className="p-8">You must be logged in to view billing.</div>;
  }

  const externalId = user.id;

  const result = await getPolarSubscriptionByExternalId(externalId);
  const products = await getPolarProducts();
  const customerPortalUrl = await managePolarSubscription(externalId);
  const subscription = result?.subscription ?? null;

  return (
    <BillingClient
      subscription={subscription}
      products={products}
      customerPortalUrl={customerPortalUrl}
    />
  );
}
