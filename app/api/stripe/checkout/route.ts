import { type NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, PLANS } from "@/lib/stripe";
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

    const { plan, interval = "yearly" } = await request.json();

    // Get the user's profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Determine which price ID to use
    let priceId;
    if (plan === "pro") {
      priceId =
        interval === "yearly"
          ? PLANS.PRO.yearly.priceId
          : PLANS.PRO.monthly.priceId;
    } else {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Ensure the user has a Stripe customer ID
    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer ID found" },
        { status: 400 }
      );
    }

    // Create a checkout session
    const checkoutSession = await createCheckoutSession({
      customerId: profile.stripe_customer_id,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?checkout=canceled`,
      metadata: {
        userId: session.user.id,
        plan,
        interval,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
