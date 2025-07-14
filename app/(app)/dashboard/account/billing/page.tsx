import { getPolarSubscriptionByExternalId } from "@/lib/polar";
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
  const subscription = result?.subscription ?? null;
  const customer = result?.customer ?? null;

  return <BillingClient subscription={subscription} customer={customer} />;
}
