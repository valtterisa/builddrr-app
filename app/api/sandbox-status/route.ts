import { NextRequest, NextResponse } from "next/server";
import {
  getSandboxStatus,
  deploySandboxAndStopExisting,
} from "@/lib/vercel/vercel";
import { createClient } from "@/lib/supabase/server";

const MIN_RECREATE_INTERVAL_MS = 15_000; // backoff to avoid provider rate limits

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.info("sandbox-status: unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: appName, recreate } = await request.json();
    if (!appName) {
      console.info("sandbox-status: missing appName in body");
      return NextResponse.json(
        { error: "Missing app id (appName)" },
        { status: 400 }
      );
    }

    // Ensure ownership
    const { data: website } = await supabase
      .from("websites")
      .select("id")
      .eq("app_name", appName)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!website) {
      console.info("sandbox-status: forbidden app", {
        appName,
        userId: user.id,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch existing preview row (always exists per data model)
    let { data: preview } = await supabase
      .from("preview_environments")
      .select("sandbox_id, updated_at")
      .eq("app_name", appName)
      .single();

    let sandboxId = preview?.sandbox_id as string | undefined;
    let lastUpdatedAt = preview?.updated_at
      ? new Date(preview.updated_at).getTime()
      : 0;

    const now = Date.now();

    // If recreate requested (user made changes), throttle attempts but force a (re)create path
    if (recreate === true) {
      if (!lastUpdatedAt || now - lastUpdatedAt >= MIN_RECREATE_INTERVAL_MS) {
        console.info("sandbox-status: recreate requested", { appName });
        // touch/update preview row updated_at to start cooldown
        await supabase
          .from("preview_environments")
          .upsert({ app_name: appName, sandbox_id: sandboxId ?? null })
          .select();
        try {
          const created = await deploySandboxAndStopExisting(appName);
          sandboxId = created.sandboxId;
        } catch (e) {
          console.info("sandbox-status: recreate failed", {
            appName,
            error: (e as Error)?.message,
          });
        }
      }
      return NextResponse.json({ error: "Not ready" }, { status: 404 });
    }

    // Row always exists by design; no placeholder creation here

    // If we have a sandboxId, check status
    if (sandboxId) {
      const result = await getSandboxStatus(sandboxId);
      if (result.success && result.status === "running" && result.url) {
        console.info("sandbox-status: running", {
          appName,
          sandboxId,
          url: result.url,
        });
        return NextResponse.json(
          { success: true, status: "running", url: result.url, sandboxId },
          { status: 200 }
        );
      }
      // If stopped/failed, recreate only after cooldown
      if (
        result.success &&
        (result.status === "stopped" || result.status === "failed")
      ) {
        if (!lastUpdatedAt || now - lastUpdatedAt >= MIN_RECREATE_INTERVAL_MS) {
          console.info("sandbox-status: recreate after stopped/failed", {
            appName,
            sandboxId,
          });
          await supabase
            .from("preview_environments")
            .update({ sandbox_id: null })
            .eq("app_name", appName)
            .select();
          try {
            const created = await deploySandboxAndStopExisting(appName);
          } catch (e) {
            // start cooldown even on failure
            await supabase
              .from("preview_environments")
              .upsert({ app_name: appName, sandbox_id: sandboxId ?? null })
              .select();
            const message = (e as Error)?.message || "recreate failed";
            console.info("sandbox-status: recreate failed", {
              appName,
              error: message,
            });
          }
        }
        return NextResponse.json({ error: "Not ready" }, { status: 404 });
      }
      // pending/stopping/unknown
      return NextResponse.json({ error: "Not ready" }, { status: 404 });
    }

    // Have row but no sandboxId yet: honor cooldown before creating
    if (!lastUpdatedAt || now - lastUpdatedAt >= MIN_RECREATE_INTERVAL_MS) {
      console.info("sandbox-status: no sandboxId yet, attempting create", {
        appName,
      });
      try {
        const created = await deploySandboxAndStopExisting(appName);
      } catch (e) {
        // start cooldown even on failure
        await supabase
          .from("preview_environments")
          .upsert({ app_name: appName, sandbox_id: sandboxId ?? null })
          .select();
        const message = (e as Error)?.message || "create failed";
        console.info("sandbox-status: create failed", {
          appName,
          error: message,
        });
      }
    }
    return NextResponse.json({ error: "Not ready" }, { status: 404 });
  } catch (error) {
    console.info("sandbox-status: error", { error: (error as Error)?.message });
    return NextResponse.json({ error: "Not ready" }, { status: 404 });
  }
}
