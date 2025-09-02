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
    const { sandboxId: bodySandboxId, id: appName } = await request.json();
    let sandboxId = bodySandboxId as string | undefined;

    // Allow resolving sandboxId by appName if not provided
    if (!sandboxId && appName) {
      const { data } = await supabase
        .from("preview_environments")
        .select("sandbox_id")
        .eq("app_name", appName)
        .single();
      sandboxId = data?.sandbox_id || undefined;
    }

    if (!sandboxId) {
      return NextResponse.json(
        { error: "sandboxId not found for app" },
        { status: 404 }
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
