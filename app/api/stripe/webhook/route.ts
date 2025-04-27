import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, PLANS } from "@/lib/stripe";
import { getSupabaseClient } from "@/lib/supabase/supabase";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  try {
    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object;

        // Get the plan from the subscription
        const planId = subscription.items.data[0].price.id;
        let plan = "starter";
        let interval = null;

        // Determine the plan and interval based on the price ID
        if (planId === PLANS.PRO.yearly.priceId) {
          plan = "pro";
          interval = "year";
        } else if (planId === PLANS.PRO.monthly.priceId) {
          plan = "pro";
          interval = "month";
        }

        // Update the user's profile
        await supabase
          .from("profiles")
          .update({
            plan,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            subscription_interval: interval,
          })
          .eq("stripe_customer_id", subscription.customer);

        break;

      case "customer.subscription.deleted":
        const canceledSubscription = event.data.object;

        // Downgrade the user to the free plan
        await supabase
          .from("profiles")
          .update({
            plan: "starter",
            subscription_status: "canceled",
            subscription_interval: null,
          })
          .eq("stripe_customer_id", canceledSubscription.customer);

        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
