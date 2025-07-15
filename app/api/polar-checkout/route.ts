import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { polar } from "@/lib/polar";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("user in /api/polar-checkout:", user);

  try {
    await polar.customers.create({
      externalId: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      billingAddress: { country: "US" },
    });

    const checkout = await polar.checkouts.create({
      products: ["20800f87-e007-4cea-a836-93f87f00ea40"],
      customerEmail: user.email,
      successUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create checkout: " + e },
      { status: 500 }
    );
  }
}
