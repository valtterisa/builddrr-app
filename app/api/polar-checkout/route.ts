import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { polar } from "@/lib/polar";
import { getPublicUrl } from "@/lib/env-config";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("API: userError:", userError);
    console.log("API: user:", user);

    if (userError || !user || !user.email) {
      console.log("API: Unauthorized - userError:", userError, "user:", user);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("user in /api/polar-checkout:", user);

    try {
      await polar.customers.create({
        externalId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        billingAddress: { country: "US" }, // @TODO: correct this
      });

      const checkout = await polar.checkouts.create({
        products: ["20800f87-e007-4cea-a836-93f87f00ea40"],
        customerEmail: user.email,
        successUrl: `${getPublicUrl()}/dashboard`,
      });

      console.log("API: Checkout created successfully:", checkout.url);
      return NextResponse.json({ url: checkout.url });
    } catch (e) {
      console.error("API: Error in polar operations:", e);
      return NextResponse.json(
        { error: "Failed to create checkout: " + e },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("API: Unexpected error:", e);
    return NextResponse.json(
      { error: "Unexpected error: " + e },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    try {
      await polar.customers.create({
        externalId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        billingAddress: { country: "US" },
      });

      const checkout = await polar.checkouts.create({
        products: [productId],
        customerEmail: user.email,
        successUrl: `${getPublicUrl()}/dashboard`,
      });

      console.log("API: Checkout created successfully:", checkout.url);
      return NextResponse.json({ url: checkout.url });
    } catch (e) {
      console.error("API: Error in polar operations:", e);
      return NextResponse.json(
        { error: "Failed to create checkout: " + e },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("API: Unexpected error:", e);
    return NextResponse.json(
      { error: "Unexpected error: " + e },
      { status: 500 }
    );
  }
}
