import {
  getPolarProducts,
  getPolarSubscriptionByExternalId,
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
  let plans = [];
  let subscription = null;
  let error = null;
  try {
    plans = await getPolarProducts();
    subscription = await getPolarSubscriptionByExternalId(externalId);
  } catch (e: any) {
    error = e.message || "Failed to load billing data";
  }

  return (
    <BillingClient
      plans={plans}
      subscription={subscription}
      error={error}
      externalId={externalId}
    />
  );
}
