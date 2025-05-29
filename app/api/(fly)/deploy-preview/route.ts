import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";
export async function POST(req: NextRequest, context: NextFetchEvent) {
  const supabase = await createClient();
  const reqBody = await req.json();

  const userId = reqBody.userId;

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

    // Get specific machine, copy config, update config, continue
    const machine = await fetch(
      `https://api.machines.dev/v1/apps/${appName}/machines`,
      {
        headers: {
          Authorization: `Bearer ${FLY_API_TOKEN}`,
        },
      }
    );

    const machineData = await machine.json();
    const machineConfig = machineData.find(
      (m: any) => m.id === machineId
    )?.config;

    if (!machineConfig) {
      return NextResponse.json(
        { ok: false, error: "Machine not found" },
        { status: 404 }
      );
    }

    // Update config
    machineConfig.files = filesPayload;

    const updateRes = await fetch(
      `https://api.machines.dev/v1/apps/${appName}/machines/${machineId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FLY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: machineConfig,
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
