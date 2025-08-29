import { NextRequest, NextResponse } from "next/server";
import { getSandboxStatus } from "@/lib/vercel/vercel";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sandboxId } = await request.json();

    if (!sandboxId) {
      return NextResponse.json(
        { error: "sandboxId is required" },
        { status: 400 }
      );
    }

    const result = await getSandboxStatus(sandboxId);

    if (result.status === "stopped") {
      return NextResponse.json({ error: "Sandbox stopped" }, { status: 400 });
    }

    console.log("🔍 [DEBUG] Sandbox status", result);

    if (result.success && result.status === "running") {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Sandbox status check error:", error);
    return NextResponse.json(
      { error: "Failed to check sandbox status" },
      { status: 500 }
    );
  }
}
