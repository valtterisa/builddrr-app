import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
export async function POST(req: NextRequest, context: NextFetchEvent) {
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

  try {
    const filesPayload = normalizedFiles.map(
      (file: { path: string; content: string }) => ({
        guest_path: file.path,
        raw_value: Buffer.from(file.content, "utf-8").toString("base64"),
      })
    );

    const FLY_API_TOKEN = process.env.FLY_API_TOKEN!;

    // Get specific machine, copy config, update config, continue
    // This should be correct only thing is can this be called from the action? answer is no i think
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
