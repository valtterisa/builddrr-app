import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest, context: NextFetchEvent) {
  // @TODO: slow
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = user.id;

  const success = await rateLimit(userId, 10, "10 s", context);

  if (!success) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { files, appName, machineId } = body;
  const normalizedFiles = Array.isArray(files) ? files : files ? [files] : [];

  if (!normalizedFiles.length || !appName || !machineId) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data: env, error: envError } = await supabase
    .from("preview_environments")
    .select("*")
    .eq("app_name", appName)
    .eq("machine_id", machineId)
    .eq("status", "available")
    .limit(1)
    .maybeSingle();

  if (envError || !env) {
    return NextResponse.json(
      { ok: false, error: "No available preview environment in pool" },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("preview_environments")
    .update({
      assigned_to: userId,
      assigned_at: now,
      status: "assigned",
      updated_at: now,
    })
    .eq("id", env.id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: updateError.message },
      { status: 500 }
    );
  }

  try {
    const filesPayload = normalizedFiles.map(
      (file: { path: string; content: string }) => ({
        guest_path: file.path,
        raw_value: Buffer.from(file.content, "utf-8").toString("base64"),
      })
    );

    const FLY_API_TOKEN = process.env.FLY_API_TOKEN!;
    const updateRes = await fetch(
      `https://api.machines.dev/v1/apps/${appName}/machines/${machineId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FLY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: filesPayload,
          strategy: "immediate",
        }),
      }
    );

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      throw new Error(`Fly API error: ${updateRes.status} ${errorText}`);
    }

    const data = await updateRes.json();
    return NextResponse.json({ ok: true, machine: data, machineId, appName });
  } catch (err: any) {
    console.error("Machine update failed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || err },
      { status: 500 }
    );
  }
}
