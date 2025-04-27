import { type NextRequest, NextResponse } from "next/server";
import { cancelSubscription } from "@/lib/stripe";
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

    if (!profile.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Cancel the subscription
    await cancelSubscription(profile.stripe_subscription_id);

    // Update the user's profile
    await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
      })
      .eq("id", session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
