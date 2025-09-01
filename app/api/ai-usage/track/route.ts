import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackUsageDual } from "@/lib/polar-usage-tracker";

export async function POST(request: NextRequest) {
  try {
    const { usageType, tokensUsed, websiteId, polarCustomerId } =
      await request.json();

    // Validate input
    if (!usageType || typeof tokensUsed !== "number") {
      return NextResponse.json(
        { error: "Invalid input: usageType and tokensUsed are required" },
        { status: 400 }
      );
    }

    // Only support chat usage type
    if (usageType !== "chat") {
      return NextResponse.json(
        { error: "Only 'chat' usage type is supported" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Track usage in both Polar and Supabase
    const result = await trackUsageDual(
      usageType,
      tokensUsed,
      websiteId,
      polarCustomerId,
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Usage tracking failed" },
        { status: 500 }
      );
    }

    // Check current limits after tracking
    const { data: limits, error: limitsError } = await supabase.rpc(
      "check_ai_usage_limits",
      { user_uuid: user.id }
    );

    if (limitsError) {
      console.warn("Failed to check limits:", limitsError);
    }

    return NextResponse.json({
      success: true,
      usageId: result.usageId,
      polarTracked: result.polarTracked,
      supabaseTracked: result.supabaseTracked,
      limits: limits || [],
      message: "Usage tracked successfully",
    });
  } catch (error) {
    console.error("Error in AI usage tracking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
