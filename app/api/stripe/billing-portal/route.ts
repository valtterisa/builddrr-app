import { type NextRequest, NextResponse } from "next/server";
import { createBillingPortalSession } from "@/lib/stripe";
import { getSupabaseClient } from "@/lib/supabase/supabase";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const {
      data: { session },
    } = await supabase!.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 }
      );
    }

    // Create a billing portal session
    const portalSession = await createBillingPortalSession(
      profile.stripe_customer_id,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
